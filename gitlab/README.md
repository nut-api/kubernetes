Edit gateway to passthrough trffic without termenating TLS.
```bash
kind: Gateway
metadata:
  name: mygateway
spec:
  selector:
    istio: ingressgateway # use istio default ingress gateway
  servers:
  - port:
      number: 443
      name: passthrough-gitlab-tls
      protocol: HTTPS
    tls:
      mode: PASSTHROUGH
    hosts:
    - minio.vongjon.com
    - registry.vongjon.com
    - gitlab.vongjon.com
```