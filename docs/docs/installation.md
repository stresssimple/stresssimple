---
comments: true
---
# Installation Guide

## Quick Start

To install StressSimple, execute the following commands:

```bash
git clone https://github.com/your-repo/stresssimple.git
cd stresssimple
npm run compose:up:app
```

This will clone the repository, navigate to the project directory, and initialize the necessary Docker containers.

Once the setup is complete, you can access the StressSimple dashboard at [http://localhost:5000](http://localhost:5000).

## Detailed Instructions

The repository includes three Docker Compose files:

1. **`docker-compose.infra.yml`**: Manages infrastructure services required for the application:
    - **InfluxDB**: A time-series database for storing test results.
    - **MySQL**: A relational database for user data.
    - **Redis**: A key-value store for inter-process communication.
2. **`docker-compose.app.yml`**: Deploys the StressSimple application using pre-built images from `ghcr.io`.
3. **`docker-compose.dev.yml`**: Builds and runs Docker containers directly from the source code.

To start the application, use one of the following commands:

```bash
npm run compose:up:app 
# or for development
npm run compose:build
npm run compose:up
```

## Local Development Setup

Follow these steps to run the application locally:

1. Clone the repository.
2. Navigate to the project directory.
3. Install dependencies using `npm install`.
4. Start the required services with `npm run compose:up:infra`.
5. Launch the backend with `npm start:backend`.
6. Launch the frontend with `npm start:front`.

The StressSimple dashboard will be available at [http://localhost:5173/](http://localhost:5173/).

## Uninstalling StressSimple

To remove the application and its associated containers, run:

```bash
npm run compose:delete
```

> **Warning**: This will permanently delete all data stored in the databases. Installation Guide
