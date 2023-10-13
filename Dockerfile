FROM python:3.11-slim-bullseye

RUN apt-get update -y && \
    apt-get install -y sqlite3 spatialite-bin libsqlite3-mod-spatialite binutils libproj-dev gdal-bin

COPY pyproject.toml poetry.lock ./

RUN pip install -U poetry && \
    poetry config virtualenvs.create false && \
    poetry install --only main

COPY . ./

# TODO: Remove this once data build works
RUN sqlite3 ./api/database/data.sqlite "VACUUM;"

ENTRYPOINT ["/usr/local/bin/python", "-m", "awslambdaric"]

CMD ["application.lambda_handler"]
