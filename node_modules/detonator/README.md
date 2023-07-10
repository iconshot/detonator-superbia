# [Detonator](https://detonator.dev/)

JavaScript library for handling state management efficiently.

## Installation

```
npm i detonator
```

## Get started

### Atom

An `Atom` is an object that will keep some data.

```js
import { Atom } from "detonator";

class CounterAtom extends Atom {
  constructor(store) {
    super(store);

    this.number = 0;
  }

  increment() {
    this.number++;

    this.update(); // notify the store of an update
  }
}
```

### Store

A `Store` is formed by a group of `Atom`s.

```js
import { Store } from "detonator";

import CounterAtom from "./CounterAtom";

const store = new Store({ counter: CounterAtom }); // actual objects will be created internally

const state = store.getState();

// state.counter.number = 0
```

Every time there's a change in one of the `Atom`s, `Store` will emit a `state` event.

```js
setTimeout(() => {
  const state = store.getState();

  state.counter.increment();
}, 5000); // execute after 5 seconds

store.on("state", (state) => {
  // state.counter.number = 1
});
```

### Persistor

`Persistor` will add persistence to your `Store`.

```js
import { Store, Persistor } from "detonator";

import CounterAtom from "./CounterAtom";

const store = new Store({ counter: CounterAtom });

const persistor = new Persistor(store, window.localStorage, {
  name: "app", // storage item
  version: 1, // content version
  migrations: { 1: (data) => data }, // data migrations
});

persistor.init().then(() => {
  // persistor has been loaded
});
```

For `Persistor` to work the `Atom` we want to persist has to override two methods: `hydrate` and `persist`.

```js
import { Atom } from "detonator";

class CounterAtom extends Atom {
  constructor(store) {
    super(store);

    this.number = 0;
  }

  // hydrate will be called when we have read the data from Storage
  // so we can update the atom properties accordingly

  hydrate(data) {
    this.number = data;
  }

  // persist will be called every time there's an update in the store,
  // the data this method returns is what will be saved in Storage

  persist() {
    return this.number;
  }

  // handlers

  increment() {
    this.number++;

    this.update(); // notify the store of an update
  }
}
```
