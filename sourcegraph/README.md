To use the Helm chart, add the Sourcegraph helm repository (on the machine used to interact with your cluster):

    helm repo add sourcegraph https://helm.sourcegraph.com/release
Install the Sourcegraph chart using default values:

    helm install --version 3.40.0 sourcegraph sourcegraph/sourcegraph

Using SSH to clone repositories
Create a Secret that contains the base64 encoded contents of your SSH private key (make sure it doesn’t require a passphrase) and known_hosts file. The [Secret] will be mounted in the gitserver deployment to authenticate with your code host.

If you have access to the ssh keys locally, you can run the command below to create the secret:
```bash
kubectl create secret generic gitserver-ssh \
	    --from-file id_rsa=${HOME}/.ssh/id_rsa \
	    --from-file known_hosts=${HOME}/.ssh/known_hosts
```

Providing the override file to Helm is done with the inclusion of the values flag and the name of the file:

    helm upgrade --install --values ./override.yaml --version 3.40.0 sourcegraph sourcegraph/sourcegraph