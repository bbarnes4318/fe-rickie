#!/bin/bash
DOMAIN=107-170-36-116.sslip.io
CERT_DIR=/etc/letsencrypt/live/$DOMAIN
cat $CERT_DIR/fullchain.pem $CERT_DIR/privkey.pem > /root/wss.pem
DOCKER_FS=$(docker ps -qf name=freeswitch)
# Create certs dir if not exists (inside container usually it exists)
docker exec $DOCKER_FS mkdir -p /usr/local/freeswitch/certs
docker cp /root/wss.pem $DOCKER_FS:/usr/local/freeswitch/certs/wss.pem
docker cp /root/wss.pem $DOCKER_FS:/usr/local/freeswitch/certs/agent.pem
docker restart $DOCKER_FS
systemctl start nginx
echo "FreeSWITCH SSL Configuration Complete"
