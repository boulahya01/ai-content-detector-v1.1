from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .api import analyze
from .utils.logging_config import setup_logging
from .utils.exceptions import AIDetectorError
from .utils.monitoring import (
    MetricsCollector, SystemMonitor, PerformanceMonitor, 
    MetricsExporter, AlertManager, Alert, AlertSeverity
)
import time
import logging
import psutil
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# Set up logging
setup_logging()
logger = logging.getLogger(__name__)

# Initialize structured logger for the application
app_logger = logging.getLogger("app")

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
alert_manager = AlertManager(metrics_collector)

# Start alert monitoring
alert_manager.start_monitoring()

# Configure email alerts if environment variables are set
if "SMTP_HOST" in os.environ:
    def email_alert_handler(alert: Alert):
        if alert.threshold.severity in [AlertSeverity.ERROR, AlertSeverity.CRITICAL]:
            try:
                msg = MIMEMultipart()
                msg["From"] = os.environ.get("SMTP_FROM", "alerts@aidetector.com")
                msg["To"] = os.environ.get("ALERT_EMAIL")
                msg["Subject"] = f"AI Detector Alert: {alert.threshold.severity.value}"
                
                body = f"""
                Alert Details:
                -------------
                Metric: {alert.threshold.metric_name}
                Value: {alert.current_value}
                Threshold: {alert.threshold.threshold}
                Description: {alert.threshold.description}
                Time: {datetime.fromtimestamp(alert.timestamp).strftime('%Y-%m-%d %H:%M:%S')}
                """
                
                msg.attach(MIMEText(body, "plain"))
                
                with smtplib.SMTP(os.environ["SMTP_HOST"], int(os.environ.get("SMTP_PORT", 587))) as server:
                    if os.environ.get("SMTP_TLS", "true").lower() == "true":
                        server.starttls()
                    if "SMTP_USER" in os.environ:
                        server.login(os.environ["SMTP_USER"], os.environ["SMTP_PASSWORD"])
                    server.send_message(msg)
                    
            except Exception as e:
                logger.error(f"Failed to send alert email: {str(e)}")
    
    alert_manager.add_alert_handler(email_alert_handler)

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

# Add request logging middleware
from .utils.logging_config import RequestLoggingMiddleware
app.add_middleware(RequestLoggingMiddleware)

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
        
        # Log performance metrics
        logging.getLogger("performance").info(
            "Request performance metrics",
            extra={
                "details": {
                    "endpoint": request.url.path,
                    "method": request.method,
                    "duration": process_time,
                    "cpu_percent": psutil.cpu_percent(),
                    "memory_percent": psutil.virtual_memory().percent
                }
            }
        )
        return response
    except Exception as e:
        # Record error metrics
        performance_monitor.record_error(error_type=type(e).__name__)
        # Log error in performance metrics
        logging.getLogger("performance").error(
            "Request failed",
            extra={
                "details": {
                    "endpoint": request.url.path,
                    "method": request.method,
                    "error": str(e),
                    "error_type": type(e).__name__
                }
            }
        )
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
    """Health check endpoint with comprehensive system status."""
    metrics = metrics_collector.get_metrics()
    current_time = time.time()
    
    # System metrics
    cpu_usage = metrics['system']['cpu_usage'] or 0
    memory_usage = metrics['system']['memory_usage'] or 0
    error_rate = metrics['performance']['error_rate'] or 0
    
    # Disk usage
    disk = psutil.disk_usage('/')
    disk_usage = disk.percent
    
    # Network checks
    network_io = psutil.net_io_counters()
    
    # Process information
    process = psutil.Process()
    process_info = {
        'cpu_percent': process.cpu_percent(),
        'memory_percent': process.memory_percent(),
        'threads': process.num_threads(),
        'open_files': len(process.open_files()),
        'connections': len(process.connections())
    }
    
    # Database connection check (if applicable)
    db_status = "healthy"  # Replace with actual DB check if using a database
    
    # Define subsystem checks
    subsystems = {
        "system": {
            "status": "healthy" if cpu_usage < 90 and memory_usage < 90 else "degraded",
            "metrics": {
                "cpu_usage": cpu_usage,
                "memory_usage": memory_usage,
                "disk_usage": disk_usage,
                "swap_usage": psutil.swap_memory().percent
            }
        },
        "process": {
            "status": "healthy" if process_info['cpu_percent'] < 90 else "degraded",
            "metrics": process_info
        },
        "network": {
            "status": "healthy",
            "metrics": {
                "bytes_sent": network_io.bytes_sent,
                "bytes_recv": network_io.bytes_recv,
                "packets_sent": network_io.packets_sent,
                "packets_recv": network_io.packets_recv,
                "errors_in": network_io.errin,
                "errors_out": network_io.errout
            }
        },
        "application": {
            "status": "healthy" if error_rate < 10 else "degraded",
            "metrics": {
                "error_rate": error_rate,
                "request_latency": metrics['performance'].get('average_latency', 0),
                "requests_per_minute": metrics['performance'].get('requests_per_minute', 0),
                "active_requests": len(process.connections())
            }
        },
        "storage": {
            "status": "healthy" if disk_usage < 90 else "degraded",
            "metrics": {
                "disk_usage": disk_usage,
                "disk_free": disk.free / (1024 * 1024 * 1024),  # GB
                "disk_total": disk.total / (1024 * 1024 * 1024)  # GB
            }
        },
        "database": {
            "status": db_status,
            "metrics": {
                "connection_pool": "N/A",  # Replace with actual DB metrics if applicable
                "active_connections": "N/A"
            }
        }
    }
    
    # Get active alerts
    active_alerts = alert_manager.get_active_alerts()
    
    # Determine overall health status
    critical_subsystems = ["system", "application", "storage"]
    degraded_subsystems = [name for name, info in subsystems.items()
                          if name in critical_subsystems and info["status"] == "degraded"]
    
    overall_status = "healthy"
    if degraded_subsystems:
        overall_status = "degraded"
    if active_alerts and any(a["severity"] in ["error", "critical"] for a in active_alerts):
        overall_status = "critical"
    
    return {
        "status": overall_status,
        "timestamp": current_time,
        "version": "1.1.0",
        "uptime": current_time - metrics['system']['uptime'],
        "subsystems": subsystems,
        "active_alerts": active_alerts,
        "last_check": {
            "time": datetime.now().isoformat(),
            "timezone": time.tzname[0]
        }
    }

@app.get("/metrics")
async def get_metrics():
    """Get detailed system metrics."""
    return metrics_collector.get_metrics()

@app.get("/alerts")
async def get_alerts():
    """Get active system alerts."""
    return {
        "active_alerts": alert_manager.get_active_alerts(),
        "alert_history": alert_manager.get_alert_history()
    }

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