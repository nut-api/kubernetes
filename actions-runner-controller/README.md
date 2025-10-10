# Installation

## kubectl Deployment

This deployment method utilizes Kubectl to install Action Runner Controller.

### Action Runner Controller

```shell
# REPLACE "v0.25.2" with the version you wish to deploy
kubectl create -f https://github.com/actions/actions-runner-controller/releases/download/v0.25.2/actions-runner-controller.yaml
```

### Action Runner Controller Manager Secrets (GitHub App)

``` shell 
kubectl create secret generic controller-manager \
    -n actions-runner-system \
    --from-literal=github_app_id=${APP_ID} \
    --from-literal=github_app_installation_id=${INSTALLATION_ID} \
    --from-file=github_app_private_key=${PRIVATE_KEY_FILE_PATH}
```

> `App ID` and `Private Key` can be obtained from the page of the GitHub App
> `Installation ID` can be obtained from Github App settings URL
> e.g https://github.com/organizations/apiplustech/settings/installations/23286736 where `23286736` is `Installation ID`

### Deploying the action runner set

```shell
kubectl apply -f runnerSet.yaml
```

## More Info on another Deployment method
- https://github.com/actions-runner-controller/actions-runner-controller/blob/master/README.md#installation

