APP_DATABASE=./deployment/app/datavase.yaml
APP_BOOKSTACK=./deployment/app/bookstack.yaml

PERSISTANT_VOLUME=./deployment/volume/persistantVolume.yaml
PERSISTANT_VOLUME_CLAIM=./deployment/volume/persistantVolumeClaim.yaml

CONFIGMAP_DATABASE=./deployment/config/databaseConfigmap.yaml
SERCERT_BACKBLAZE=./backup/backblazeSecrets.yaml

JOB_BACKUP=./backup/backupDatabase.yaml
JOB_REATORE=./backup/restoreDatabase.yaml

up-new-app: 
	make up-config
	kubectl apply -f $(PERSISTANT_VOLUME)
	kubectl apply -f $(PERSISTANT_VOLUME_CLAIM)
	kubectl apply -f $(APP_DATABASE)
	kubectl apply -f $(APP_BOOKSTACK)
	kubectl apply -f $(JOB_BACKUP)

up-restore-app: 
	make up-config
	kubectl apply -f $(PERSISTANT_VOLUME)
	kubectl apply -f $(PERSISTANT_VOLUME_CLAIM)
	kubectl apply -f $(APP_DATABASE)
	kubectl apply -f $(JOB_REATORE)
	kubectl wait --for=condition=complete job/restore-database
	kubectl apply -f $(APP_BOOKSTACK)
	kubectl apply -f $(JOB_BACKUP)

up-config:
	kubectl apply -f $(CONFIGMAP_DATABASE)
	kubectl apply -f $(SERCERT_BACKBLAZE)

down-app-all:
	kubectl delete -f $(JOB_BACKUP)	
	kubectl delete -f $(APP_BOOKSTACK)
	kubectl delete -f $(APP_DATABASE)
	kubectl delete -f $(PERSISTANT_VOLUME_CLAIM)
	kubectl delete -f $(PERSISTANT_VOLUME)
	kubectl delete -f $(CONFIGMAP_DATABASE)
	make down-config

down-config:
	kubectl delete -f $(CONFIGMAP_DATABASE)
	kubectl delete -f $(SERCERT_BACKBLAZE)	

k8s-regcred:
	kubectl create secret generic regcred	--from-file=.dockerconfigjson=$(HOME)/.docker/config.json 	--type=kubernetes.io/dockerconfigjson