#!/bin/bash

# Installing dependencies for workspace
printf "Acquiring all dependences...\n"
rm -rf node_modules
curl https://sh.rustup.rs -sSf |  bash -s -- -y
echo 'source $HOME/.cargo/env' >> $HOME/.bashrc
yarn global add @angular/cli@10.0.4
yarn global add @nestjs/cli@7.4.1
yarn install
yarn add @nrwl/node
yarn add inquirer
printf "Done!\n"

# Building everything
printf "Building the server and client...\n"
nx build server
nx build client --prod
printf "Done!\n"

# Copying .env file to server
printf "Copying .env file to server...\n"
cp .env ./dist/packages/server/.env
printf "Done!\n"

# Copying client to server and moving into it
printf "Copying client files to server folder for static file serving...\n"
rsync -r ./dist/packages/client/* ./dist/packages/server/static
printf "Done!\n\n"

# Exit message
printf "Ready for blastoff!\n"
