FROM public.ecr.aws/lambda/python:3.11

COPY pyproject.toml poetry.lock ./

RUN pip install -U poetry && \
    poetry config virtualenvs.create false && \
    poetry install --only main

COPY . ./

# TODO: Remove this once data build works
RUN sqlite3 ./api/database/data.sqlite "VACUUM;"

CMD ["application.lambda_handler"]
