class Atom {
  constructor(store) {
    this.store = store;
  }

  // methods used by Persistor

  persist() {
    return null;
  }

  hydrate(data) {}

  // notify store of an update

  update() {
    this.store.update();
  }
}

module.exports = Atom;
