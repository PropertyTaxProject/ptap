.PHONY: clean
clean:
	rm -f api/database/data.db

.PHONY: data
data:
	PYTHONPATH=$(CURDIR) poetry run python api/scripts/load_data.py

.PHONY: download-data
download-data:
	wget https://$(S3_BUCKET).s3.amazonaws.com/data.dump

.PHONY: deploy-data
deploy-data: data.dump
	aws s3 cp $< s3://$(S3_BUCKET)/

.PHONY: restore
restore: data.dump
	pg_restore -d $(DATABASE_URL) -F c $<

data.dump:
	pg_dump $(DATABASE_URL) -F c -f $@

.PHONY: start
start:
	$(MAKE) -j 2 start-py start-js

.PHONY: start-py
start-py:
	poetry run flask --debug run

.PHONY: start-js
start-js:
	VITE_PUBLIC_URL="" VITE_BASE_URL=http://localhost:5000 npm start

.PHONY: install
install: install-js install-py

.PHONY: install-js
install-js:
	npm install

.PHONY: install-py
install-py:
	poetry self add poetry-dotenv-plugin
	poetry install
