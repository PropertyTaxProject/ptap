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
	poetry install
