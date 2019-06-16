const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

var client = null;
var db = null;

module.exports = {
  connect: (url, database) => {
    if (client !== null)
      return;

     client = new MongoClient(url, {
      useNewUrlParser: true
    });

    client.connect((err) => {
      assert.equal(err, null);
      db = client.db(database);
      console.log('connected to db');
    });
  },

  close: () => {
    if (client === null)
      return;
    client.close();
  },

  client: () => {
    return client;
  },

  selectDb: (database) => {
    db = client.db(database);
  },

  collection: (collection) => {
    if (db === null)
      return;

    return db.collection(collection);
  }
}
