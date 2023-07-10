import SuperbiaAtom from "./SuperbiaAtom";

export class DocumentAtom extends SuperbiaAtom {
  constructor(client, documentKeys) {
    super(documentKeys);

    this.data = {};

    client
      .on("request", (endpoints, emitter) => {
        emitter.on("data", (data) => {
          this.parseData(data);
        });
      })
      .on("subscribe", (endpoint, emitter) => {
        emitter.on("data", (data) => {
          this.parseData(data);
        });
      });
  }

  parseData(data) {
    const newData = {};

    Object.values(data).forEach((result) => {
      this.parseResult(result, newData);
    });

    const types = Object.keys(newData);

    if (types.length === 0) {
      return;
    }

    for (const type of types) {
      if (!(type in this.data)) {
        this.data[type] = {};
      }

      const newDocuments = newData[type];

      for (const id in newDocuments) {
        this.data[type][id] = newDocuments[id];
      }
    }

    this.update();
  }
}
