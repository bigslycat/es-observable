/* @flow */

// eslint-disable-next-line no-unused-vars
import regeneratorRuntime from 'regenerator-runtime'

import $$observable from 'symbol-observable'
import test from 'ava'
import sinon from 'sinon'

import { Observable } from './Observable'

test.cb('subscribe of completed Observable', t => {
  const start = sinon.spy()
  const next = sinon.spy()
  const complete = sinon.spy()

  const subscription = new Observable(observer => {
    observer.next(0)
    observer.next(1)
    observer.next(2)
    observer.complete()
    return () => {}
  }).subscribe({
    start,
    next,
    error: t.end,
    complete,
  })

  t.deepEqual(start.args[0], [subscription])
  t.deepEqual(next.args, [[0], [1], [2]])
  t.true(complete.calledOnce)

  t.end()
})

test.cb('subscribe of failed Observable', t => {
  const start = sinon.spy()
  const subscription = new Observable(observer => {
    observer.error(new Error('Error text'))
    return () => {}
  }).subscribe({
    start,
    next: t.fail,
    error: e => t.deepEqual(e, new Error('Error text')),
    complete: t.fail,
  })

  t.deepEqual(start.args, [[subscription]])

  t.end()
})

test.cb('Crashed Observable in start', t => {
  Observable.of(null).subscribe({
    start() {
      throw new Error('Error text')
    },
    error: e => t.deepEqual(e, new Error('Error text')),
    complete: t.end,
  })
})

test.cb('Crashed Observable in onNext', t => {
  Observable.of(null).subscribe({
    next() {
      throw new Error('Error text')
    },
    error: e => t.deepEqual(e, new Error('Error text')),
    complete: t.fail,
  })

  t.end()
})

test.cb('Observable.of', t => {
  const next = sinon.spy()
  const complete = sinon.spy()

  Observable.of(0, 1, 2).subscribe(next, t.end, complete)

  t.deepEqual(next.args, [[0], [1], [2]])
  t.true(complete.calledOnce)

  t.end()
})

test.cb('Observable.from Array', t => {
  const next = sinon.spy()
  const complete = sinon.spy()

  Observable.from([0, 1, 2]).subscribe(next, t.end, complete)

  t.deepEqual(next.args, [[0], [1], [2]])
  t.true(complete.calledOnce)

  t.end()
})

test.cb('Observable.from Iterable', t => {
  const next = sinon.spy()
  const complete = sinon.spy()

  const iterable: any = {
    *[Symbol.iterator]() {
      yield 0
      yield 1
      yield 2
    },
  }

  Observable.from(iterable).subscribe(next, t.end, complete)

  t.deepEqual(next.args, [[0], [1], [2]])
  t.true(complete.calledOnce)

  t.end()
})

test('Observable.from Observable instance', t => {
  const initial = Observable.of(null)

  t.is(Observable.from(initial), initial)
  t.is(
    Observable.from({
      [$$observable]: (): any => initial,
    }),
    initial,
  )
})

test.cb('Observable.from Observable compatible', t => {
  const next = sinon.spy()
  const complete = sinon.spy()

  const initial = Observable.of(0, 1, 2)

  const observable = Observable.from({
    [$$observable]: () => ({
      subscribe(...args) {
        return initial.subscribe(...args)
      },
      [$$observable]() {
        return this
      },
    }),
  })

  observable.subscribe(next, t.end, complete)

  t.deepEqual(next.args, [[0], [1], [2]])
  t.true(complete.calledOnce)

  t.not(observable, initial)

  t.end()
})

test.cb('Observable Subscriber cleanup function', t => {
  const cleanup = sinon.spy()
  new Observable(observer => {
    setImmediate(() => observer.complete())
    return cleanup
  }).subscribe({
    error: t.end,
    complete: () =>
      setImmediate(() => {
        t.true(cleanup.calledOnce)
        t.end()
      }),
  })
})

test('Unsubscribe from Observable', t => {
  const next = sinon.spy(value => {
    if (value >= 2) subscription.unsubscribe()
  })

  const subscription = Observable.of(0, 1, 2, 3, 4).subscribe({
    next,
  })

  t.deepEqual(next.args, [[0], [1], [2]])
})
