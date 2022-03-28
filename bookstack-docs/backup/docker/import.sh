#!/bin/bash

DB_USER=${DB_USER:-${MYSQL_ENV_DB_USER}}
DB_PASS=${DB_PASS:-${MYSQL_ENV_DB_PASS}}
DB_NAME=${DB_NAME:-${MYSQL_ENV_DB_NAME}}
DB_HOST=${DB_HOST:-${MYSQL_ENV_DB_HOST}}

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

# download backup from b2
B2_ACC_ID="${AWS_ACCESS_KEY_ID}"
B2_APP_KEY="${AWS_SECRET_ACCESS_KEY}"
B2_BUCKET_NAME="${AWS_BUCKET_NAME}"

echo "starting download db from b2 at $(date +'%d-%m-%Y')"
b2 authorize-account $B2_ACC_ID $B2_APP_KEY
b2 download-file-by-name $B2_BUCKET_NAME $FILENAME /mysqldump/$FILENAME
echo "finished downloading db from b2 at $(date +'%d-%m-%Y')"

# restore database
mysql --user="${DB_USER}" --password="${DB_PASS}" --host="${DB_HOST}" "$@" "${DB_NAME}" < $BACKUP_DIR

exit 0