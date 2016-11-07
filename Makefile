dist: dist/ngd-parser.js dist/index.html

default: dist

%.js: %.ts
	tsc $<

dist/index.html: index.pug
	pug --pretty $< --out dist

dist/ngd-parser.js: *.ts
	tsc --outFile dist/ngd-parser.js --module amd Parser.ts
