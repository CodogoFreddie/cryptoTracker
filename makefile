SRC = $(shell find src -name "*.js")
LIB = $(SRC:src/%.js=lib/%.js)

.PHONY: run
run: lib
	node --max-old-space-size=8192 lib/index.js

lib: clear $(LIB)

lib/%.js: src/%.js makefile package.json
	@ mkdir -p $(@D)
	babel $< -o $@ --source-maps

clear:
	clear

.PHONY: clean
clean:
	rm -rf lib/*
