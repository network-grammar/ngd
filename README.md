# Network Grammar Demonstrator

[![Build Status](https://travis-ci.org/network-grammar/ngd.svg?branch=master)](https://travis-ci.org/network-grammar/ngd)

First attempt at an implementation of Richard Harber's "Network Grammar" theory, as described at <http://www.languidslog.com/>.  
This demo will only cover a small toy language, with a manually built lexicon.

## Lexicon

The lexicon is currently hardcoded in the `data` directory; see files `nodes.json` and `links.json`.

## Requirements

- Node.js
- TypeScript & Typings: `npm install --global typescript typings`
- Package dependencies: `npm install`
- Typings: `typings install`


## Compiling & running

### Local

Simply call the TypeScript compiler:

```sh
$ tsc
```

Run the Main module with Node.js:

```shell
$ node Main
```

### Web interface

```sh
$ make ngd-parser.js
```

Then open `index.html` in a browser.
