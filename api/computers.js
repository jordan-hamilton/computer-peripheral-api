const ds = require("../datastore");
const datastore = ds.datastore;

const { COMPUTER_KIND } = require("../config");

/* ------------- Begin Model Functions ------------- */
function get_all() {
  const results = {};
  const q = datastore.createQuery(COMPUTER_KIND).limit(5);

  if (req.query && Object.keys(req.query).includes("cursor")) {
    q.start(req.query.cursor);
  }

  return datastore.runQuery(q).then((entities) => {
    results.items = entities[0].map(ds.fromDatastore);

    if (entities[1].moreResults !== ds.Datastore.NO_MORE_RESULTS) {
      results.next = entities[1].endCursor;
    }

    results.count = -1; // TODO: get unpaginated count

    return results;
  });
}

function get_by_property(req, propKey, propValue) {
  let value;
  const results = {};

  //TODO: get relationship to peripherals

  propKey === "__key__"
    ? (value = datastore.key([COMPUTER_KIND, datastore.int(propValue)]))
    : (value = propValue);

  const q = datastore
    .createQuery(COMPUTER_KIND)
    .filter(propKey, "=", value)
    .limit(5);

  return datastore.runQuery(q).then((entities) => {
    results.items = entities[0].map(ds.fromDatastore);

    if (entities[1].moreResults !== ds.Datastore.NO_MORE_RESULTS) {
      results.next = entities[1].endCursor;
    }

    results.count = -1; // TODO: get unpaginated count

    return results;
  });
}

function post_one(manufacturer, model, serial_number, user) {
  const key = datastore.key(COMPUTER_KIND);
  const entity = {
    manufacturer,
    model,
    serial_number,
    user,
  };
  return datastore.save({ key: key, data: entity }).then(() => {
    entity.id = key.id;
    return entity;
  });
}

async function delete_one(id) {
  const key = datastore.key([COMPUTER_KIND, parseInt(id, 10)]);
  return datastore.delete(key);
}
/* ------------- End Model Functions ------------- */

module.exports = {
  get_all,
  get_by_property,
  post_one,
  delete_one,
};
