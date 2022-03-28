#!/bin/bash

DB_USER=${DB_USER:-${MYSQL_ENV_DB_USER}}
DB_PASS=${DB_PASS:-${MYSQL_ENV_DB_PASS}}
DB_NAME=${DB_NAME:-${MYSQL_ENV_DB_NAME}}
DB_HOST=${DB_HOST:-${MYSQL_ENV_DB_HOST}}

TODAY_DATE="$(date +'%d_%m_%Y')"
FILENAME="$DB_NAME".sql
BACKUP_DIR="/mysqldump/$FILENAME"



if [[ ${DB_USER} == "" ]]; then
	echo "Missing DB_USER env variable"
	exit 1
fi
if [[ ${DB_PASS} == "" ]]; then
	echo "Missing DB_PASS env variable"
	exit 1
fi
if [[ ${DB_HOST} == "" ]]; then
	echo "Missing DB_HOST env variable"
	exit 1
fi
if [[ ${DB_NAME} == "" ]]; then
	echo "Missing DB_NAME env variable"
	exit 1
fi

mysqldump --user="${DB_USER}" --password="${DB_PASS}" --host="${DB_HOST}" "$@" "${DB_NAME}" > $BACKUP_DIR

# upload to b2
B2_ACC_ID="${AWS_ACCESS_KEY_ID}"
B2_APP_KEY="${AWS_SECRET_ACCESS_KEY}"
B2_BUCKET_NAME="${AWS_BUCKET_NAME}"

echo "starting upload db to b2 at $(date +'%d-%m-%Y')"
b2 authorize-account $B2_ACC_ID $B2_APP_KEY
b2 upload_file $B2_BUCKET_NAME $BACKUP_DIR $FILENAME
# b2 sync --keepDays 30 --replaceNewer /mysqldump b2://$B2_BUCKET_NAME
echo "finished uploading db to b2 at $(date +'%d-%m-%Y')"

exit 0