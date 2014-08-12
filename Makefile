test:
	node ./test/testrunner.js

lint:
	jshint --show-non-errors backbone-proxy.js test/testrunner.js

.PHONY: test lint