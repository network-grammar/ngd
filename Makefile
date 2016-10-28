.PHONY: clean

default: *.ts
	tsc

%.js: %.ts
	tsc $<

clean:
	# Is this dangerous?
	rm -f *.js

index.html: index.pug
	pug --pretty $<

ngd-parser.js: *.ts
	tsc --outFile ngd-parser.js --module amd
	@echo "Remember to replace with the following:\n\n\
	define(\"DataLayerSync\", [\"require\", \"exports\", \"Nodes\", \"Links\", \"DataConverter\", \"lib/text.min!data/nodes.json\", \"lib/text.min!data/links.json\"], function (require, exports, Nodes_3, Links_3, DC, nodes, links) {\n\
	    \"use strict\";\n\
	    var nodesJSON = JSON.parse(nodes);\n\
	    var linksJSON = JSON.parse(links);"
