FROM python:3.13-slim-bullseye

RUN apt-get update -y && \
    apt-get install -y gcc libpq-dev gdal-bin

COPY pyproject.toml poetry.lock ./

RUN pip install -U poetry && \
    poetry config virtualenvs.create false && \
    poetry install --only main

COPY . ./

ENTRYPOINT ["/usr/local/bin/python", "-m", "awslambdaric"]

CMD ["app.lambda_handler"]
