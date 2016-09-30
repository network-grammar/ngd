# Network Grammar Demonstrator

[![Build Status](https://travis-ci.org/network-grammar/ngd.svg?branch=master)](https://travis-ci.org/network-grammar/ngd)

First attempt at an implementation of Richard Harber's "Network Grammar" theory, as described at <http://www.languidslog.com/>.  
This demo will only cover a small toy language, with a manually built lexicon.

## Lexicon

The lexicon is currently hardcoded in the `data` directory; see files `nodes.json` and `links.json`.

## Requirements

- Node.js
- TypeScript: `npm install --global typescript`
- Package dependencies: `npm install`

## Compiling

Simply call the TypeScript compiler:

```shell
$ tsc
```

## Running

Run the Main module with Node.js:

```shell
$ node Main
```
