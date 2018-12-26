/* @flow */

import type { Subscriber } from './Observable'
import type { Observer } from './Observer'
import {
  SubscriptionObserver,
  cleanupSubscriptionObserver,
} from './SubscriptionObserver'
import { getSet } from './getSet'

const [getClosed, setClosed] = getSet<Subscription<any>, boolean>('closed')

const [getCleanup, setCleanup] = getSet<
  /* :: Subscription<any>, */
  () => void,
>('cleanup')

const [getSubscriptionObserver, setSubscriptionObserver] = getSet<
  /* :: Subscription<any>, */
  SubscriptionObserver<any>,
>('subscriptionObserver')

// eslint-disable-next-line no-unused-vars
export interface SubscriptionLike<T> {
  unsubscribe(): void;
  +closed: boolean;
}

const emptyFn = () => {}

function cleanupSubscription(subscription: Subscription<any>) {
  getCleanup(subscription)()
  setCleanup(subscription, emptyFn)
  setClosed(subscription, true)
  cleanupSubscriptionObserver(getSubscriptionObserver(subscription))
}

// eslint-disable-next-line no-unused-vars
export class Subscription<T> implements SubscriptionLike<T> {
  constructor(observer: Observer<T>, subscriber: Subscriber<T>) {
    setClosed(this, false)
    setCleanup(this, emptyFn)

    try {
      if (observer.start) observer.start(this)
    } catch (e) {
      if (!observer.error) throw e
      observer.error(e)
    }

    if (this.closed) return

    const subscriptionObserver = new SubscriptionObserver(observer, this)

    try {
      setSubscriptionObserver(this, subscriptionObserver)

      const cleanup = subscriber(subscriptionObserver)

      setCleanup(
        this,
        typeof cleanup == 'function' ? cleanup : () => cleanup.unsubscribe(),
      )
    } catch (e) {
      subscriptionObserver.error(e)
      return
    }

    if (this.closed) cleanupSubscription(this)
  }

  unsubscribe(): void {
    cleanupSubscription(this)
  }

  get closed(): boolean {
    return getClosed(this)
  }
}
