release: clear
	@mkdir -p ./out/release
	@rsync -av . ./out/release --exclude .git --exclude tests --exclude test --exclude out --exclude node_modules
	@cd ./out/release && npm install
	@cd ./out/release/assets && npm install

clear:
	@rm -rf out/

.PHONY: release clear