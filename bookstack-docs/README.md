# Bookstack in kubernetes with backup and restore (backblaze) feature.
## TL;DR
To deploy new bookstack.
```
make up-new-app
```
Delete bookstack.
```
make down-app-all
```
Restore bookstack from backup-data in backblaze.
> deploy backblazeSecrets (key ID, secret key) to access backbleze before restore bookstack.
```
make up-restore-app
```
- then copy all resource (picture, uploaded-files, etc.) which is backup on backblaze to directory that mount bookstack container.
---
## Requirements
### Docker Containners
 Community docker setups are available for those that would prefer to use a containerised version of BookStack: **solidnerd/bookstack**
 ### Volume for container
 This project will use PersistantVolume with **local-storage** (StorageClassName) which is local host in directory /mnt/bookstack on worker machine.
 > see configuration in deployment/volume/persistantVolume.yaml
 ### Secrets keys 
 To connect to Backblaze, backblaze secret keys are store in kubernetes secret (backblazeSecrets.yaml).
 Deploy secret with your aws secret keys.
 - Change aws access keyID and secret key in backblazeSecrets.yaml to your aws keys.
 - Change b2 busket name in backupConfigmap.yaml to your busket that store bookstack backup.

## Installation
Deploy bookstack with following command: 
```
make up-new-app
```
This will deploy configuration, application and backup job.
By default, this deployment will backup database to backblaze everyday (ever midnight).
> see configuration about b in backup/backupDatabase.yaml

## Restore
### Database
To restore the database you simply need to execute the sql in the output file from the *mysqldump* you performed above. To do this download backup file and restore database with folling command:
```
make up-restore-app
```
This will restore all docs which store in database but this not restore resource (picture, uploaded-file, etc.)
### Files
To restore resource, download resource which backup in backblaze with
```bash
# authourise account
b2 authorize-account <aws-key-ID> <aws-secret-key>
# download backup files
b2 download-file-by-name <busket-name> <filename> <localfilename>
```
To restore the files you simple need to copy them from the backup archive back to their original locations. If you created a compressed bookstack-files-backup.tar.gz archive as per the backup instructions above you can simply copy that file to your BookStack folder then run the following command:
```
tar -xvzf bookstack-files-backup.tar.gz
```
