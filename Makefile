.PHONY: clean

default: *.ts
	tsc

%.js: %.ts
	tsc $<

clean:
	# Is this dangerous?
	rm -f *.js

index.html: index.pug
	pug $<

ngd-parser.js: *.ts
	tsc --outFile ngd-parser.js --module amd
