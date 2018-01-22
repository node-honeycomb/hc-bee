install:
	@npm install

test:
	@./node_modules/.bin/_mocha -t 25000 -R spec --recursive ./test

test-cov:
	@./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- -t 25000 -R spec --recursive ./test

cov:
	@open ./coverage/lcov-report/index.html

publish: test
	@cat package.json | xargs -0 node -p 'JSON.parse(process.argv[1]).version' | xargs git tag
	@git push origin --tags
	@npm publish

.PHONY: install test cov publish prepare
