.PHONY: clean
clean:
	rm -f api/database/data.db

.PHONY: data
data: api/database/data.db

api/database/data.db:
	PYTHONPATH=$(CURDIR) poetry run python api/scripts/load_data.py

.PHONY: start
start:
	$(MAKE) -j 2 start-py start-js

.PHONY: start-py
start-py:
	poetry run python application.py

.PHONY: start-js
start-js:
	npm start

.PHONY: install
install: install-js install-py

.PHONY: install-js
install-js:
	npm install

.PHONY: install-py
install-py:
	poetry self add poetry-dotenv-plugin
	poetry install
