FROM ubuntu:focal

RUN apt-get update && apt-get install -y curl wget gnupg

RUN curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# This is the only way to pin to Node 14.6.0, the nodesource repository removes
# old point versions whenever they do a minor update (which breaks our attempt to 
# pin to a specific version with apt-get)
RUN wget --quiet --output-document=node-latest.deb 'https://deb.nodesource.com/node_14.x/pool/main/n/nodejs/nodejs_14.6.0-deb-1nodesource1_amd64.deb' \
    && apt install -y ./node-latest.deb \
    && rm node-latest.deb
    
RUN apt-get update && apt-get install -y \
    yarn=1.22.1-1 \
    build-essential

RUN ./build-prod.sh
RUN node ./dist/packages/server/main.js

ENV PATH "$PATH:/opt/pulpd/node_modules/.bin"

EXPOSE 3333
EXPOSE 4200
EXPOSE 3000
EXPOSE 9229

WORKDIR /opt/pulpd
