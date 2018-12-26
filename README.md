# es-observable

[ES Observable proposal](https://github.com/tc39/proposal-observable)
implementation

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

## Flow

It works good only with

```diff
  [libs]
+ node_modules/es-observable/flow-typed

  [lints]
```

in `.flowconfig`.

### API

```ts
import {
  Observable,
  type SubscriptionObserver,  // Class declaration
  type Subscription,          // Class declaration
  type Observer,              // Type declaration
  type ObservableCompatible,  // Type declaration
  type ObservableLike,        // Type declaration
  type SubscriptionLike,      // Interface declaration
} from 'es-observable'
```

### `ObservableCompatible`

```ts
import type { SymbolObservable } from 'symbol-observable'

type ObservableCompatible<T> = {
  +[SymbolObservable]: () => ObservableLike<T>,
}
```

### `ObservableLike`

```ts
import type { SymbolObservable } from 'symbol-observable'

type ObservableLike<T> = {
  subscribe(
    onNext: (value: T) => mixed,
    onError?: (error: Error) => mixed,
    onComplete?: () => mixed,
  ): SubscriptionLike<T>,

  subscribe(observer: Observer<T>): SubscriptionLike<T>,

  +[SymbolObservable]: () => ObservableLike<T>,
}
```

[status-url]: https://travis-ci.org/bigslycat/es-observable
[status-img]: https://travis-ci.org/bigslycat/es-observable.svg?branch=master
