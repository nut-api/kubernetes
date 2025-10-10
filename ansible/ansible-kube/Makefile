all:
#	ansible-playbook -i hosts all.yml --extra-vars "ansible_sudo_pass=root1234" --extra-vars "user=$(USER)"
	ansible-playbook -i ./inventory/cluster  ./playbooks/install-all.yaml
worker:
	ansible-playbook -i ./inventory/cluster ./playbooks/install-worker.yaml

upgrade:
	ansible-playbook -i ./inventory/cluster ./playbooks/upgrade-cluster.yaml

os:
	ansible-playbook -i ./inventory/cluster ./playbooks/upgrade-os.yaml

docker:
	ansible-playbook -i ./inventory/cluster ./playbooks/docker.yaml

test:
	ansible-playbook -i ./inventory/cluster ./playbooks/test.yaml