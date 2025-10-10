"""Batch document processing module for handling multiple files efficiently."""
from typing import Dict, List, Optional, Union, Any
from pathlib import Path
import asyncio
import aiofiles
from tenacity import retry, stop_after_attempt, wait_exponential
from tqdm import tqdm
import logging
from collections import deque
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from .document_processor import DocumentProcessor, DocumentValidationError

logger = logging.getLogger(__name__)

class ProcessingStatus(Enum):
    """Enum representing the status of a document in the processing queue."""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class ProcessingResult:
    """Dataclass for storing document processing results."""
    file_path: Union[str, Path]
    status: ProcessingStatus
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    retries: int = 0

class BatchDocumentProcessor:
    """Handles batch processing of multiple documents with async support."""
    
    def __init__(self, max_concurrent: int = 5, max_retries: int = 3):
        """Initialize the batch processor.
        
        Args:
            max_concurrent: Maximum number of documents to process concurrently.
            max_retries: Maximum number of retry attempts for failed documents.
        """
        self.document_processor = DocumentProcessor()
        self.max_concurrent = max_concurrent
        self.max_retries = max_retries
        self.processing_queue = deque()
        self.results: Dict[str, ProcessingResult] = {}
        self._processing_lock = asyncio.Lock()
        self._is_processing = False
        self._progress_callbacks = []
        self._start_time = None
        
    def add_progress_callback(self, callback):
        """Add a callback function for progress updates.
        
        The callback will receive ProcessingResult objects as they are updated.
        
        Args:
            callback: Function that takes a ProcessingResult as its argument.
        """
        self._progress_callbacks.append(callback)
        
    def _notify_progress(self, result: ProcessingResult):
        """Notify all registered callbacks of a progress update.
        
        Args:
            result: The updated ProcessingResult object.
        """
        for callback in self._progress_callbacks:
            try:
                callback(result)
            except Exception as e:
                logger.error(f"Error in progress callback: {str(e)}")
        
    def add_document(self, file_path: Union[str, Path]) -> None:
        """Add a document to the processing queue.
        
        Args:
            file_path: Path to the document file.
        """
        file_path = Path(file_path)
        if str(file_path) not in self.results:
            self.processing_queue.append(file_path)
            self.results[str(file_path)] = ProcessingResult(
                file_path=file_path,
                status=ProcessingStatus.QUEUED
            )
            logger.debug(f"Added document to queue: {file_path}")
            
    def _get_retry_strategy(self):
        """Get the retry strategy for document processing.
        
        The strategy uses exponential backoff with jitter for robustness.
        """
        return {
            'stop': stop_after_attempt(self.max_retries),
            'wait': wait_exponential(multiplier=1, min=4, max=10),
            'reraise': True
        }
        
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def _process_single_document(self, file_path: Path) -> Dict[str, Any]:
        """Process a single document with retry logic.
        
        Args:
            file_path: Path to the document file.
            
        Returns:
            Dict containing processing results.
            
        Raises:
            DocumentValidationError: If document validation fails.
            ValueError: If document processing fails.
        """
        async with aiofiles.open(file_path, 'rb') as f:
            content = await f.read()
        
        # Get MIME type and format validation before processing
        mime_type, format_id = self.document_processor.validate_file(file_path)
        
        # Create a task for CPU-intensive processing to avoid blocking
        loop = asyncio.get_running_loop()
        
        # Process based on format using thread pool for CPU-intensive operations
        if format_id == 'docx':
            result = await loop.run_in_executor(None, DocumentProcessor.extract_text_from_docx, content)
        elif format_id == 'pdf':
            result = await loop.run_in_executor(None, DocumentProcessor.extract_text_from_pdf, content)
        elif format_id == 'txt':
            text = content.decode('utf-8')
            result = {
                "text": text,
                "metadata": {
                    "format": "txt",
                    "words": len(text.split())
                }
            }
        else:
            raise ValueError(f"Unsupported format: {format_id}")
            
        return result
        
    async def process_multiple(self, file_paths: List[Union[str, Path]]) -> Dict[str, ProcessingResult]:
        """Process multiple documents by adding them to the queue and starting processing.
        
        Args:
            file_paths: List of paths to documents to process.
            
        Returns:
            Dict mapping file paths to their processing results.
        """
        # Add all documents to the queue
        for file_path in file_paths:
            self.add_document(file_path)
            
        # Process the queue
        return await self.process_batch()
        
    async def _process_queue_item(self, file_path: Path) -> None:
        """Process a single item from the queue with error handling and status updates.
        
        Args:
            file_path: Path to the document file.
        """
        result = self.results[str(file_path)]
        result.start_time = datetime.now()
        result.status = ProcessingStatus.PROCESSING
        retry_count = 0
        
        try:
            retry_decorator = retry(**self._get_retry_strategy())
            retry_process = retry_decorator(self._process_single_document)
            
            try:
                processed_result = await retry_process(file_path)
                result.result = processed_result
                result.status = ProcessingStatus.COMPLETED
            except Exception as retry_error:
                retry_count = getattr(retry_process, 'retry.statistics', {}).get('attempt_number', 0)
                raise retry_error
                
            result.retries = retry_count
            
        except DocumentValidationError as e:
            logger.error(f"Validation error processing {file_path}: {str(e)}")
            result.error = str(e)
            result.status = ProcessingStatus.FAILED
            
        except Exception as e:
            logger.error(f"Error processing {file_path}: {str(e)}")
            result.error = str(e)
            result.status = ProcessingStatus.FAILED
            
        finally:
            result.end_time = datetime.now()
            
    def _create_progress_callback(self, pbar):
        """Create a callback function to update progress information.
        
        Args:
            pbar: tqdm progress bar instance.
            
        Returns:
            Callback function for updating progress.
        """
        def update_progress(status: ProcessingStatus, file_path: Path = None, error: str = None):
            """Update progress bar and status information.
            
            Args:
                status: Current processing status.
                file_path: Optional path to current file.
                error: Optional error message.
            """
            if status == ProcessingStatus.COMPLETED:
                pbar.update(1)
            
            # Update description with current file and status
            if file_path:
                pbar.set_description(f"Processing {file_path.name} [{status.value}]")
                
            if error:
                pbar.write(f"Error processing {file_path}: {error}")
                
            # Update progress bar format with statistics
            stats = self.get_batch_status()
            pbar.set_postfix(
                completed=f"{stats['status_counts']['completed']}/{stats['total_documents']}",
                success_rate=f"{stats['completed_percentage']:.1f}%",
                avg_time=f"{stats['average_processing_time']:.1f}s"
            )
            
        return update_progress
        
    async def process_batch(self) -> Dict[str, ProcessingResult]:
        """Process all documents in the queue concurrently.
        
        Returns:
            Dict mapping file paths to their processing results.
        """
        async with self._processing_lock:
            if self._is_processing:
                logger.warning("Batch processing already in progress")
                return self.results
                
            self._is_processing = True
        
        try:
            total_files = len(self.processing_queue)
            with tqdm(
                total=total_files,
                desc="Processing documents",
                unit="files",
                dynamic_ncols=True,
                miniters=1
            ) as pbar:
                progress_callback = self._create_progress_callback(pbar)
                
                while self.processing_queue:
                    # Process documents in chunks based on max_concurrent
                    current_batch = []
                    for _ in range(min(self.max_concurrent, len(self.processing_queue))):
                        if self.processing_queue:
                            file_path = self.processing_queue.popleft()
                            current_batch.append(file_path)
                            progress_callback(ProcessingStatus.PROCESSING, file_path)
                    
                    # Process current batch concurrently
                    tasks = [self._process_queue_item(file_path) for file_path in current_batch]
                    
                    try:
                        await asyncio.gather(*tasks)
                    except Exception as e:
                        # Log batch processing error but continue with remaining files
                        logger.error(f"Error processing batch: {str(e)}")
                        progress_callback(ProcessingStatus.FAILED, error=str(e))
                        
                    # Update progress for completed items
                    for file_path in current_batch:
                        result = self.results[str(file_path)]
                        if result.status == ProcessingStatus.COMPLETED:
                            progress_callback(ProcessingStatus.COMPLETED, file_path)
                        elif result.status == ProcessingStatus.FAILED:
                            progress_callback(ProcessingStatus.FAILED, file_path, result.error)
                    
        finally:
            self._is_processing = False
        
        return self.results
        
    def get_status(self, file_path: Union[str, Path]) -> Optional[ProcessingResult]:
        """Get the processing status and result for a specific document.
        
        Args:
            file_path: Path to the document file.
            
        Returns:
            ProcessingResult if the document exists in the batch, None otherwise.
        """
        return self.results.get(str(file_path))
        
    def get_batch_status(self) -> Dict[str, Dict[str, int]]:
        """Get overall status of the batch processing.
        
        Returns:
            Dict containing counts of documents in each status.
        """
        status_counts = {status: 0 for status in ProcessingStatus}
        processing_times = []
        
        for result in self.results.values():
            status_counts[result.status] += 1
            if result.start_time and result.end_time:
                processing_times.append((result.end_time - result.start_time).total_seconds())
                
        avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0
        
        return {
            "status_counts": {status.value: count for status, count in status_counts.items()},
            "total_documents": len(self.results),
            "average_processing_time": avg_processing_time,
            "completed_percentage": (status_counts[ProcessingStatus.COMPLETED] / len(self.results) * 100) if self.results else 0
        }