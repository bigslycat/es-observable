# es-observable

[ES Observable proposal](https://github.com/tc39/proposal-observable) implementation

[![Build Status][status-img]][status-url]
[![Coverage Status](https://coveralls.io/repos/github/bigslycat/es-observable/badge.svg?branch=master)](https://coveralls.io/github/bigslycat/es-observable?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/bigslycat/es-observable.svg)](https://greenkeeper.io/)

## Install

`npm install --save es-observable` or `yarn add es-observable`

## Usage

```js
import { Observable } from 'es-observable'

Observable.of( ... )
Observable.from( ... )
new Observable(observer => { ... })
```

[status-url]: https://travis-ci.org/bigslycat/es-observable
[status-img]: https://travis-ci.org/bigslycat/es-observable.svg?branch=master
