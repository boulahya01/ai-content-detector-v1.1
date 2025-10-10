"""System monitoring and metrics collection utilities."""
import time
import psutil
import torch
import logging
from typing import Dict, Any, Optional
from collections import deque
import threading
from dataclasses import dataclass
from datetime import datetime
import json
from pathlib import Path

logger = logging.getLogger(__name__)

@dataclass
class MetricPoint:
    """Data class for storing metric points."""
    timestamp: float
    value: float
    labels: Dict[str, str]

class MetricsCollector:
    """Collects and stores system and application metrics."""
    
    def __init__(self, history_size: int = 1000):
        """Initialize metrics collector.
        
        Args:
            history_size: Number of historical data points to keep.
        """
        self.history_size = history_size
        self.metrics = {
            'cpu_usage': deque(maxlen=history_size),
            'memory_usage': deque(maxlen=history_size),
            'gpu_memory_usage': deque(maxlen=history_size),
            'model_inference_time': deque(maxlen=history_size),
            'request_latency': deque(maxlen=history_size),
            'requests_per_minute': deque(maxlen=history_size),
            'error_rate': deque(maxlen=history_size)
        }
        self.start_time = time.time()
        self.request_count = 0
        self.error_count = 0
        self._lock = threading.Lock()

    def add_metric(self, name: str, value: float, labels: Optional[Dict[str, str]] = None):
        """Add a metric data point.
        
        Args:
            name: Metric name.
            value: Metric value.
            labels: Optional metric labels.
        """
        with self._lock:
            metric_point = MetricPoint(
                timestamp=time.time(),
                value=value,
                labels=labels or {}
            )
            if name in self.metrics:
                self.metrics[name].append(metric_point)

    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics summary.
        
        Returns:
            Dictionary containing all metrics.
        """
        with self._lock:
            current_time = time.time()
            uptime = current_time - self.start_time
            
            # Calculate requests per minute
            recent_request_count = sum(
                1 for m in self.metrics['request_latency']
                if current_time - m.timestamp <= 60
            )
            
            # Calculate error rate
            recent_errors = sum(
                1 for m in self.metrics['error_rate']
                if current_time - m.timestamp <= 60
            )
            error_rate = (recent_errors / max(recent_request_count, 1)) * 100
            
            return {
                'system': {
                    'uptime': uptime,
                    'cpu_usage': self._get_latest('cpu_usage'),
                    'memory_usage': self._get_latest('memory_usage'),
                    'gpu_memory_usage': self._get_latest('gpu_memory_usage')
                },
                'performance': {
                    'requests_per_minute': recent_request_count,
                    'average_latency': self._get_average('request_latency'),
                    'average_inference_time': self._get_average('model_inference_time'),
                    'error_rate': error_rate
                },
                'historical': {
                    name: self._get_historical(name)
                    for name in self.metrics.keys()
                }
            }

    def _get_latest(self, metric_name: str) -> Optional[float]:
        """Get latest value for a metric."""
        try:
            return self.metrics[metric_name][-1].value
        except (KeyError, IndexError):
            return None

    def _get_average(self, metric_name: str, window: int = 60) -> Optional[float]:
        """Get average value for a metric over a time window."""
        try:
            current_time = time.time()
            recent_points = [
                m.value for m in self.metrics[metric_name]
                if current_time - m.timestamp <= window
            ]
            return sum(recent_points) / len(recent_points) if recent_points else None
        except KeyError:
            return None

    def _get_historical(self, metric_name: str) -> list:
        """Get historical data for a metric."""
        try:
            return [
                {
                    'timestamp': m.timestamp,
                    'value': m.value,
                    'labels': m.labels
                }
                for m in self.metrics[metric_name]
            ]
        except KeyError:
            return []

class SystemMonitor:
    """Monitors system resources and performance."""
    
    def __init__(self, metrics_collector: MetricsCollector):
        """Initialize system monitor.
        
        Args:
            metrics_collector: MetricsCollector instance.
        """
        self.metrics_collector = metrics_collector
        self.monitoring = False
        self.monitor_thread = None

    def start_monitoring(self, interval: float = 1.0):
        """Start system monitoring in background thread.
        
        Args:
            interval: Monitoring interval in seconds.
        """
        if self.monitoring:
            return

        self.monitoring = True
        self.monitor_thread = threading.Thread(
            target=self._monitor_loop,
            args=(interval,),
            daemon=True
        )
        self.monitor_thread.start()
        logger.info("System monitoring started")

    def stop_monitoring(self):
        """Stop system monitoring."""
        self.monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join()
            logger.info("System monitoring stopped")

    def _monitor_loop(self, interval: float):
        """Main monitoring loop."""
        while self.monitoring:
            try:
                # CPU usage
                cpu_percent = psutil.cpu_percent(interval=0.1)
                self.metrics_collector.add_metric('cpu_usage', cpu_percent)

                # Memory usage
                memory = psutil.virtual_memory()
                self.metrics_collector.add_metric('memory_usage', memory.percent)

                # GPU memory usage if available
                if torch.cuda.is_available():
                    for i in range(torch.cuda.device_count()):
                        gpu_memory = torch.cuda.memory_allocated(i) / torch.cuda.max_memory_allocated(i)
                        self.metrics_collector.add_metric(
                            'gpu_memory_usage',
                            gpu_memory * 100,
                            {'device': f'cuda:{i}'}
                        )

                time.sleep(interval)
            except Exception as e:
                logger.error(f"Error in monitoring loop: {str(e)}")
                time.sleep(interval)

class PerformanceMonitor:
    """Monitors application performance metrics."""

    def __init__(self, metrics_collector: MetricsCollector):
        """Initialize performance monitor.
        
        Args:
            metrics_collector: MetricsCollector instance.
        """
        self.metrics_collector = metrics_collector

    def record_request(self, duration: float, endpoint: str):
        """Record API request metrics.
        
        Args:
            duration: Request duration in seconds.
            endpoint: API endpoint name.
        """
        self.metrics_collector.add_metric(
            'request_latency',
            duration * 1000,  # Convert to milliseconds
            {'endpoint': endpoint}
        )

    def record_inference(self, duration: float, model_name: str):
        """Record model inference metrics.
        
        Args:
            duration: Inference duration in seconds.
            model_name: Name of the model used.
        """
        self.metrics_collector.add_metric(
            'model_inference_time',
            duration * 1000,  # Convert to milliseconds
            {'model': model_name}
        )

    def record_error(self, error_type: str):
        """Record error occurrence.
        
        Args:
            error_type: Type of error that occurred.
        """
        self.metrics_collector.add_metric(
            'error_rate',
            1.0,
            {'type': error_type}
        )

class MetricsExporter:
    """Exports metrics to various formats."""
    
    def __init__(self, metrics_collector: MetricsCollector, export_dir: str = "metrics"):
        """Initialize metrics exporter.
        
        Args:
            metrics_collector: MetricsCollector instance.
            export_dir: Directory to export metrics to.
        """
        self.metrics_collector = metrics_collector
        self.export_dir = Path(export_dir)
        self.export_dir.mkdir(exist_ok=True)

    def export_json(self, filename: str = "metrics.json"):
        """Export metrics to JSON file.
        
        Args:
            filename: Output filename.
        """
        metrics = self.metrics_collector.get_metrics()
        output_path = self.export_dir / filename
        
        with open(output_path, 'w') as f:
            json.dump(metrics, f, indent=2)

    def export_prometheus(self, filename: str = "metrics.prom"):
        """Export metrics in Prometheus format.
        
        Args:
            filename: Output filename.
        """
        metrics = self.metrics_collector.get_metrics()
        output_path = self.export_dir / filename
        
        with open(output_path, 'w') as f:
            # System metrics
            for metric, value in metrics['system'].items():
                if value is not None:
                    f.write(f'ai_detector_system_{metric} {value}\n')
            
            # Performance metrics
            for metric, value in metrics['performance'].items():
                if value is not None:
                    f.write(f'ai_detector_performance_{metric} {value}\n')