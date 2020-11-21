# PTAP Site

## Build sqlite3 database

Run `api/make_db.py`

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
