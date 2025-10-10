```bash
export SHA=$(head -c 16 /dev/urandom | shasum | cut -d " " -f 1)
export USER=admin

echo $USER > registry-creds.txt
echo $SHA >> registry-creds.txt

docker run --entrypoint htpasswd registry:2 -Bbn admin $SHA > ./htpasswd

helm repo add twuni https://helm.twun.io
helm install private-registry twuni/docker-registry -f values.yaml

```
```bash
export DOCKER_PASSWORD="" # Populate this with your password used above
export DOCKER_USERNAME="admin"
export SERVER="registry.example.com"
# Login to local registry
echo $DOCKER_PASSWORD | docker login $SERVER --username $DOCKER_USERNAME --password-stdin
# To use local registry in kubernetes
kubectl create secret docker-registry private-repo \
    --docker-username=$DOCKER_USERNAME \
    --docker-password=$DOCKER_PASSWORD \
    --docker-server=$SERVER \
    --namespace default
# Add imagePullSecrets in ServiceAccount or Deployment
imagePullSecrets:
- name: private-repo
```
[reg](https://www.civo.com/learn/set-up-a-private-docker-registry-with-tls-on-kubernetes)