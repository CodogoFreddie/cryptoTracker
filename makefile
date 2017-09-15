SRC = $(shell find src -name "*.js")
LIB = $(SRC:src/%.js=lib/%.js)

.PHONY: run
run: lib
	node lib/renderers/graph.js 

lib: clear $(LIB)

lib/%.js: src/%.js makefile package.json
	@ mkdir -p $(@D)
	@ echo "babel $<"
	@ NODE_ENV="production" babel $< -o $@ --source-maps

clear:
	#clear

.PHONY: clean
clean:
	rm -rf lib/*
