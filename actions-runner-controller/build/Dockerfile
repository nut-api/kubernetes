FROM summerwind/actions-runner-dind:latest

RUN sudo wget https://go.dev/dl/go1.20.3.linux-amd64.tar.gz \
    && sudo tar -C /usr/local -xzf go1.20.3.linux-amd64.tar.gz \
    && sudo rm go1.20.3.linux-amd64.tar.gz

RUN sudo apt-get update &&  sudo apt-get -y install curl libnss3-tools build-essential
RUN sudo wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64 && sudo cp mkcert-v1.4.3-linux-amd64 /usr/local/bin/mkcert && sudo chmod +x /usr/local/bin/mkcert

ENV PATH="/usr/local/go/bin:${PATH}"
ENV PATH="/home/runner/go/bin:${PATH}"

COPY ./daemon.json /etc/docker/daemon.json

RUN sudo wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 && \
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

RUN sudo chmod a+x /usr/local/bin/yq

RUN sudo curl -LO https://dl.k8s.io/release/v1.26.0/bin/linux/amd64/kubectl && \
    sudo curl -LO "https://dl.k8s.io/v1.26.0/bin/linux/amd64/kubectl.sha256"

RUN echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check

RUN sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

COPY --from=docker/buildx-bin:latest /buildx /usr/libexec/docker/cli-plugins/docker-buildx
