from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .api import analyze
from .utils.logging_config import setup_logging
from .utils.exceptions import AIDetectorError
from .utils.monitoring import MetricsCollector, SystemMonitor, PerformanceMonitor, MetricsExporter
import time
import logging
import psutil

# Set up logging
setup_logging()
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI Content Detector API",
    description="API for detecting AI-generated content using advanced language models",
    version="1.1.0"
)

# Initialize monitoring system
metrics_collector = MetricsCollector()
system_monitor = SystemMonitor(metrics_collector)
performance_monitor = PerformanceMonitor(metrics_collector)
metrics_exporter = MetricsExporter(metrics_collector)

# Start system monitoring
system_monitor.start_monitoring()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add timing middleware
@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(round(process_time * 1000, 2))
        
        # Record request metrics
        performance_monitor.record_request(
            duration=process_time,
            endpoint=request.url.path
        )
        return response
    except Exception as e:
        # Record error metrics
        performance_monitor.record_error(error_type=type(e).__name__)
        raise

# Global exception handler
@app.exception_handler(AIDetectorError)
async def detector_exception_handler(request: Request, exc: AIDetectorError):
    logger.error(f"API error: {exc.message}", extra={"details": exc.details})
    return JSONResponse(
        status_code=400,
        content={
            "error": exc.message,
            "code": exc.code,
            "details": exc.details
        }
    )

# Include routers
app.include_router(
    analyze.router,
    prefix="/api",
    tags=["analysis"]
)

@app.get("/")
async def root():
    """Root endpoint returning API information."""
    return {
        "message": "AI Content Detector API",
        "version": "1.1.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint with system metrics."""
    metrics = metrics_collector.get_metrics()
    
    # Check system health thresholds
    cpu_usage = metrics['system']['cpu_usage'] or 0
    memory_usage = metrics['system']['memory_usage'] or 0
    error_rate = metrics['performance']['error_rate'] or 0
    
    health_status = "healthy"
    if cpu_usage > 90 or memory_usage > 90 or error_rate > 10:
        health_status = "degraded"
    
    return {
        "status": health_status,
        "timestamp": time.time(),
        "version": "1.1.0",
        "metrics": {
            "system": metrics['system'],
            "performance": metrics['performance']
        }
    }

@app.get("/metrics")
async def get_metrics():
    """Get detailed system metrics."""
    return metrics_collector.get_metrics()

@app.get("/metrics/export")
async def export_metrics():
    """Export metrics to files."""
    try:
        metrics_exporter.export_json()
        metrics_exporter.export_prometheus()
        return {"message": "Metrics exported successfully"}
    except Exception as e:
        logger.error(f"Error exporting metrics: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to export metrics"}
        )

# Log startup
logger.info("AI Content Detector API started")