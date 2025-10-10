```bash
curl -g 'http://127.0.0.1:9090/api/v1/query?query=sum(container_cpu_usage_seconds_total{namespace="actions-runner-system"})by(pod)'
```