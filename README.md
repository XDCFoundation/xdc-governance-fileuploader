# XDC Governance File Uploader

## Usage

This microservice handle API requests related to file uploading to aws s3. Following are the apis included in this microservice.

- Upload File
- Update url
- Get signed url

## Steps for local setup

- clone the repository in your local system
- run `npm install` : To install the dependencies
- run `npm run start` : It will start your server on your local machine
- Configuration : `config/env` directory contains files to define environment specific variables
- Dependencies : Defined under `package.json`
- Database configuration : Defined under `config/dbConnection`
- Deployment instructions : Docker based deployment, Dockerfile is there in parent directory

## About env folder

This folder is having different types of variables like DB url, PORT, microservice url etc.

- **development** : Variables which are used in development environment.
- **local** : Variables which are used for local system.
- **production** : Variables which are used for production environment.
- **test** : Variables which are used for testing purpose.
