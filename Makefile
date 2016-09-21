.PHONY: clean

clean:
	# Is this dangerous?
	rm -f *.js

%.js: %.ts
	tsc $<
