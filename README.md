# The Property Tax Appeal Project

Welcome to the property tax appeal project repository. This is a flask/react project designed for deployment to AWS Elastic Beanstalk which files property tax appeals for low-income homeowners in Detroit and Chicago.

## Setup

To install Python dependencies and run locally, you'll need [Poetry](https://python-poetry.org/) installed. Then you can run:

```
poetry install
poetry run python application.py
```

## Deployment Guide

The app requires credentials. api/.env includes SENDGRID_API_KEY and MAIL_DEFAULT_SENDER. api/.googleenv includes google drive service credentials.

To deploy, you need to locally build the sqlite3 database. Run `api/make_db.py` to do this.

## Deploy flask with current (static) frontend

```bash
gunicorn --bind 127.0.0.1:5000 --workers 2 --threads 3 application:application
```

## Rebuild Frontend

### From Scratch

From the frontend directory, run the following lines to build and start the app. Must have npm and flask installed. Run `npm start` on a separate terminal.

```bash
npm install
npm start
```

### Rebuilding after Install

```bash
npm run build
```

## Deploy AWS Elastic Beanstalk

```bash
eb create ptap
eb deploy
```
