import pytest
import time
from app.utils.monitoring import MetricsCollector, PerformanceMonitor, SystemMonitor
from concurrent.futures import ThreadPoolExecutor, as_completed

def test_metrics_collector_singleton():
    """Test that MetricsCollector implements singleton pattern correctly."""
    # Create multiple instances
    collector1 = MetricsCollector()
    collector2 = MetricsCollector()
    
    # Verify they are the same instance
    assert collector1 is collector2
    
    # Verify metrics are shared
    collector1.add_metric('test_metric', 1.0)
    assert len(collector2.metrics['test_metric']['queue']) == 1

def test_concurrent_metric_collection():
    """Test concurrent access to metrics collector."""
    collector = MetricsCollector(history_size=100)
    
    def add_metrics(i):
        collector.add_metric('test_metric', float(i))
    
    # Add metrics from multiple threads
    with ThreadPoolExecutor(max_workers=10) as executor:
        executor.map(add_metrics, range(100))  # Use map for more controlled execution
    
    # Verify metrics collection is correct
    with collector.metrics['test_metric']['lock']:
        queue = collector.metrics['test_metric']['queue']
        assert len(queue) == min(100, queue.maxlen)  # Should respect maxlen
        # Values should be sequential but may be in any order due to threading
        values = sorted(m.value for m in queue)
        assert values[-1] == 99.0  # Last value should be 99
        assert values[0] >= 0.0  # First value should be >= 0
        assert len(set(values)) == len(values)  # All values should be unique

def test_performance_monitor():
    """Test performance monitoring across endpoints."""
    collector = MetricsCollector()
    monitor = PerformanceMonitor(collector)
    
    # Record some test data
    monitor.record_request(0.1, '/analyze')
    monitor.record_request(0.2, '/analyze/file')
    monitor.record_inference(0.15, 'roberta-base')
    
    metrics = collector.get_metrics()
    
    # Verify request latencies were recorded
    assert len(collector.metrics['request_latency']['queue']) == 2
    
    # Verify inference times were recorded
    assert len(collector.metrics['model_inference_time']['queue']) == 1
    
    # Check average latency
    avg_latency = metrics['performance']['average_latency']
    assert avg_latency is not None
    assert 150 <= avg_latency <= 200  # Average should be around 150ms

def test_error_tracking():
    """Test error tracking functionality."""
    collector = MetricsCollector()
    monitor = PerformanceMonitor(collector)
    
    # Record some errors
    monitor.record_error('validation_error')
    monitor.record_error('system_error')
    
    metrics = collector.get_metrics()
    
    # Verify errors were recorded
    assert len(collector.metrics['error_rate']) == 2
    
    # Check error rate calculation
    error_rate = metrics['performance']['error_rate']
    assert error_rate is not None
    assert error_rate > 0

def test_metrics_retention():
    """Test that metrics are properly retained within history size."""
    collector = MetricsCollector(history_size=5)
    
    # Add metrics sequentially
    for i in range(10):
        collector.add_metric('test_metric', float(i))
    
    # Verify retention
    with collector.metrics['test_metric']['lock']:
        queue = collector.metrics['test_metric']['queue']
        assert len(queue) == queue.maxlen == 5  # Size should match maxlen
        values = [m.value for m in queue]
        assert values == [5.0, 6.0, 7.0, 8.0, 9.0]  # Should keep the latest 5 values

def test_system_monitor_lifecycle():
    """Test system monitor start/stop functionality."""
    collector = MetricsCollector()
    monitor = SystemMonitor(collector)
    
    # Start monitoring
    monitor.start_monitoring(interval=0.1)
    time.sleep(0.3)  # Allow some metrics to be collected
    
    # Verify metrics are being collected
    assert len(collector.metrics['cpu_usage']) > 0
    assert len(collector.metrics['memory_usage']) > 0
    
    # Stop monitoring
    monitor.stop_monitoring()
    
    # Verify monitoring has stopped
    current_cpu_metrics = len(collector.metrics['cpu_usage'])
    time.sleep(0.3)
    assert len(collector.metrics['cpu_usage']) == current_cpu_metrics