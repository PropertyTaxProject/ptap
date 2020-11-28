# PTAP Site

Welcome to the property tax appeal project repository. This is a flask/react project designed for deployment to AWS Elastic Beanstalk which files property tax appeals for low-income homeowners in Detroit and Chicago.

## Deployment Guide

The app requires credentials. api/.env includes SENDGRID_API_KEY and MAIL_DEFAULT_SENDER. api/.googleenv includes google drive service credentials.

To deploy, you need to locally build the sqlite3 database. Run `api/make_db.py` to do this.

## Deploy flask with current (static) frontend

```bash
gunicorn -b 127.0.0.1:5000 -w 1 -k gthread --thread=4 application:application
```

## Rebuild Frontend

### From Scratch

From the frontend directory, run the following lines to build and start the app. Must have yarn and flask installed. Run `yarn start-api` on a separate terminal.

```bash
yarn install
yarn start
yarn start-api
```
### Rebuilding after Install
```bash
yarn build
```
