FROM python:3.11-slim-bullseye

# TODO: Figure out asset building in here

RUN apt-get update -y && \
    apt-get install -y sqlite3 spatialite-bin libsqlite3-mod-spatialite binutils libproj-dev gdal-bin

COPY pyproject.toml poetry.lock ./

RUN pip install -U poetry && \
    poetry config virtualenvs.create false && \
    poetry install --only main && \
    make data

COPY . ./

ENTRYPOINT ["/usr/local/bin/python", "-m", "awslambdaric"]

CMD ["application.lambda_handler"]
