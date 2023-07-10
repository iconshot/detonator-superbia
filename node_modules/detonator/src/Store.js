const { EventEmitter } = require("eventemitter3");

class Store extends EventEmitter {
  constructor(Atoms) {
    super();

    this.state = {};

    this.updateTimeout = null;

    this.populate(Atoms);
  }

  getState() {
    return this.state;
  }

  // create Atom objects

  populate(Atoms) {
    for (const key in Atoms) {
      const Atom = Atoms[key];

      this.state[key] = new Atom(this);
    }
  }

  // group multiple calls into a single "emit" call

  update() {
    clearTimeout(this.updateTimeout);

    this.updateTimeout = setTimeout(() => {
      this.emit("state", this.state);
    });
  }
}

module.exports = Store;
