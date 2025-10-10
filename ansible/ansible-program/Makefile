install:
	ansible-playbook ./playbooks/installation.yaml

setup:
	ansible-playbook ./playbooks/setup.yaml

test:
	ansible-playbook ./playbooks/test.yaml

deps:
	ansible-galaxy install gantsign.minikube
	ansible-galaxy install gantsign.golang
	ansible-galaxy install gantsign.visual-studio-code
	ansible-galaxy install gantsign.postman
	ansible-galaxy install darkwizard242.googlechrome
	ansible-galaxy collection install community.general