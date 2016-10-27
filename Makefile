.PHONY: clean

default:
	@echo "Nothing to make"

clean:
	# Is this dangerous?
	rm -f *.js

%.js: %.ts
	tsc $<
