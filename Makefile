.PHONY: clean
clean:
	rm -f api/database/data.db

.PHONY: data
data: api/database/data.db

.PHONY: deploy-data
deploy-data: api/database/data.db
	aws s3 cp $< s3://$(S3_BUCKET)/data.db

.PHONY: download-data
download-data:
	aws s3 cp s3://$(S3_BUCKET)/data.db api/database/data.db

api/database/data.db:
	PYTHONPATH=$(CURDIR) poetry run python api/scripts/load_data.py

.PHONY: start
start:
	$(MAKE) -j 2 start-py start-js

.PHONY: start-py
start-py:
	poetry run flask --app application.py --debug run

.PHONY: start-js
start-js:
	REACT_APP_BASE_URL=http://localhost:5000 npm start

.PHONY: install
install: install-js install-py

.PHONY: install-js
install-js:
	npm install

.PHONY: install-py
install-py:
	poetry self add poetry-dotenv-plugin
	poetry install
