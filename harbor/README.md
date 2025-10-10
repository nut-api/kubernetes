- create containerd default config
```
/usr/bin/containerd config default > /etc/containerd/config.toml
```
- add http registry endpoint
```
sudo vi /etc/containerd/config.toml
#find  [plugins."io.containerd.grpc.v1.cri".registry] and add the following configuration
  [plugins."io.containerd.grpc.v1.cri".registry]
    [plugins."io.containerd.grpc.v1.cri".registry.mirrors]
      [plugins."io.containerd.grpc.v1.cri".registry.mirrors."harbor.registry.local"]
        endpoint = ["http://harbor.registry.local"]
```
- restart containerd service
```
systemctl restart containerd
containerd config dump
```