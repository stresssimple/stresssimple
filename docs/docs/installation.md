# Installation Guide

## TL;DR
Run the following commands to install StressJs:

```bash
    git clone https://github.com/your-repo/stressjs.git
    cd stressjs
    npm run compose:up:app
```
The above will clone the repository, navigate to the project directory, and start a few docker containers.

After a few seconds, you should be able to access the StressJs dashboard at [http://localhost:5000](http://localhost:5000).

## More in depth

The repo contains 3 docker compose files:

1. `docker-compose.infra.yml` - Infrastructure services like required for the application to run.
    1. InfluxDB - A time-series database used to store the test results.
    1. MySQL - A relational database used to store user data.
    1. Redis - A key-value store used for cross process communication.
1. `docker-compose.app.yml` - The StressJs application itself, using the latest release of the code. Images are from ghcr.io.
1. `docker-compose.dev.yml` - Building and running docker containers from source.

To start the application, run the following command:

```bash
    npm run compose:up:app 
    #or
    npm run compose:build # for development
    npm run compose:up # for development
```

## Running the application locally
1. Clone the repository
1. Navigate to the project directory
1. Run `npm install` to install dependencies
1. Run `npm compose:up:infra` to start required services
1. Run `npm start:backend` to start the application
1. Run `npm start:front` to start the application

You should now be able to access the StressJs dashboard at [http://localhost:5173/](http://localhost:5173/).


## Removing the application
To remove the application and all associated containers, run the following command:

```bash
    npm run compose:delete 
```

**this will delete all data stored in the database.**