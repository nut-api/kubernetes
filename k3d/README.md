# For remote dev box
```
k3d cluster create --api-port 10.1.20.203:6443 --k3s-arg "--disable=traefik@server:*" -p '80:80@loadbalancer' -p '443:443@loadbalancer' --registry-create local-registry
```

--registry-create is requried to make Tilt build image and push to the registry. If local registry not created, Tilt will push development images directly to ghcr.io

