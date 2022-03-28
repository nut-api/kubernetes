FROM alpine:3.15
RUN apk add --update mysql-client bash openssh-client py3-pip && rm -rf /var/cache/apk/* && \
    pip install b2 && \
    mkdir mysqldump
COPY . /
RUN chmod +x /dump.sh /import.sh

