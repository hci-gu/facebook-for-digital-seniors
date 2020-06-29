#! /bin/sh

echo 'Gunnar är bäst'

export PARSE_HOST=$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)
echo "This project runs on public domain: ${PARSE_HOST}"
echo "That domain name will be injected as env variable \$PARSE_HOST to docker-compose"

mkdir docker-persistence
sudo -u root chown 1001 ./docker-persistence/

docker-compose up -d