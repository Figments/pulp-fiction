#!/bin/bash

# Installing dependencies for workspace
printf "Acquiring all dependences...\n"
echo 'source $HOME/.cargo/env'
yarn install
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
mkdir ./dist/packages/server/static
cp -r ./dist/packages/client/* ./dist/packages/server/static/
printf "Done!\n\n"

# Exit message
printf "Ready for blastoff!\n"
