const EventEmitter = require("eventemitter3");

class Persistor extends EventEmitter {
  constructor(
    store,
    Storage,
    { name = "app", version = 0, migrations = {} } = {}
  ) {
    super();

    this.store = store;

    this.Storage = Storage;

    this.name = name; // name of the Storage item

    this.version = version;

    // migrations are sorted in migrate()

    this.migrations = migrations;
  }

  async init() {
    // content can be null when there's not an item found with the name this.name in this.Storage

    const content = await this.read();

    let data = {};

    if (content !== null) {
      data = this.migrate(content.data, content.version);
    }

    const state = this.store.getState();

    for (const key in state) {
      const atom = state[key];

      if (key in data) {
        // hydrate atom with the corresponding data

        atom.hydrate(data[key]);
      }
    }

    // start listening to updates

    this.store.on("state", () => this.persist());

    /*
    
    even if there's no updates yet, we write the content,
    so the Storage item's data replicates the store state from the beginning

    */

    this.persist();

    this.emit("init");
  }

  // generate the content for the Storage item and write it

  async persist() {
    const content = { data: {}, version: this.version };

    const state = this.store.getState();

    for (const key in state) {
      const atom = state[key];

      const data = atom.persist();

      if (data !== null) {
        content.data[key] = data;
      }
    }

    await this.write(content);
  }

  async read() {
    // if found, content is read as a JSON

    const { Storage } = this;

    const value = await Storage.getItem(this.name);

    const content = value !== null ? JSON.parse(value) : null;

    return content;
  }

  async write(content) {
    // content is written as a json

    const { Storage } = this;

    const value = JSON.stringify(content);

    await Storage.setItem(this.name, value);
  }

  migrate(data, version) {
    // get versions from current version (exclusive) to this.version (inclusive)

    const keys = Object.keys(this.migrations)
      .filter((key) => key > version && key <= this.version)
      .sort((a, b) => a - b);

    // migrate data

    return keys.reduce((value, key) => {
      const migrate = this.migrations[key];

      return migrate(value);
    }, data);
  }
}

module.exports = Persistor;
