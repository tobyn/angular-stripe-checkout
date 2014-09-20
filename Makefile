.PHONY: all clean minified gzipped

BASENAME=angular-stripe-checkout
MINIFIED=$(BASENAME).min.js
GZIPPED=$(MINIFIED).gz

all: minified gzipped

clean:
	rm -rf $(MINIFIED) $(GZIPPED)

minified:
	uglifyjs $(BASENAME).js > $(MINIFIED)

gzipped: minified
	gzip -9c $(MINIFIED) > $(GZIPPED)
