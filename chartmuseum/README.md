# Installing Chartmuseum
```bash
helm repo add chartmuseum https://chartmuseum.github.io/charts
helm install chartmuseum/chartmuseum
```

# Installing Charts into Kubernetes
Add the URL to your ChartMuseum installation to the local repository list:

        helm repo add chartmuseum http://localhost:8080
Search for charts:

        helm search repo chartmuseum/
Install chart:

        helm install chartmuseum/mychart --generate-name