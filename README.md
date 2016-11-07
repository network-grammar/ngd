# Network Grammar Demonstrator

[![Build Status](https://travis-ci.org/network-grammar/ngd.svg?branch=master)](https://travis-ci.org/network-grammar/ngd)

**Network Grammar** (NG) is a linguistic theory developed by Richard Harber and Michael Wilkinson, as described at <http://www.languidslog.com/>.

This is a first attempt at a working implementation of a parser for NG.
This demo covers a small toy language with a manually built lexicon.

## Live demo

Try out the [live demo](https://rawgit.com/network-grammar/ngd/master/dist/index.html) and experiment with the parser.

## Lexicon

The lexicon is currently hardcoded in the `data` directory; see files `nodes.json` and `links.json`.

## Requirements

For running locally, you will need:

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

```shell
$ make dist
```

Then open `dist/index.html` in a browser.
