Import Cloudflare Origin CA key
```bash
kubectl create secret generic \
    --dry-run \
    -n default service-key \
    --from-literal key=v1.0-FFFFFFF-FFFFFFFF -oyaml
```
