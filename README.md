# The Property Tax Appeal Project

Welcome to the property tax appeal project repository. This is a Flask/React project designed for deployment to AWS Lambda through Terraform which files property tax appeals for low-income homeowners in Detroit and Chicago.

## Setup

To install Python dependencies and run locally, you'll need [Poetry](https://python-poetry.org/) installed. Then you can run:

```
poetry install
poetry run python application.py
```

## Rebuild Frontend

### From Scratch

Run the following lines to build and start the app. Must have npm and flask installed. Run `npm start` on a separate terminal.

```bash
npm install
npm start
```

### Rebuilding after Install

```bash
npm run build
```

## Deployment Guide

The app requires credentials. api/.env includes SENDGRID_API_KEY and MAIL_DEFAULT_SENDER. api/.googleenv includes google drive service credentials.

To deploy, you need to locally build the sqlite3 database. Run `api/make_db.py` to do this.
