const ds = require("../datastore");
const datastore = ds.datastore;

const { PERIPHERAL_KIND } = require("../config");

/* ------------- Begin Model Functions ------------- */
function get_count() {
  const q = datastore.createQuery(PERIPHERAL_KIND);

  return datastore.runQuery(q).then((data) => data[0].length);
}

function get_all(req) {
  const results = {};
  const q = datastore.createQuery(PERIPHERAL_KIND).limit(5);

  if (req.query && Object.keys(req.query).includes("cursor")) {
    q.start(req.query.cursor);
  }

  return datastore.runQuery(q).then(async (data) => {
    results.items = data[0].map(ds.fromDatastore);

    if (data[1].moreResults !== ds.Datastore.NO_MORE_RESULTS) {
      results.next = data[1].endCursor;
    }

    results.total_records = await get_count();

    return results;
  });
}

function get_by_property(propKey, propValue) {
  let value;

  propKey === "__key__"
    ? (value = datastore.key([PERIPHERAL_KIND, datastore.int(propValue)]))
    : (value = propValue);

  const q = datastore.createQuery(PERIPHERAL_KIND).filter(propKey, "=", value);

  return datastore.runQuery(q).then((data) => {
    return data[0]
      ? data[0].map(ds.fromDatastore)
      : { Error: "No peripheral with this peripheral_id exists" };
  });
}

function post_one(manufacturer, type, serial_number) {
  //TODO: Take entity object instead of parameters
  const key = datastore.key(PERIPHERAL_KIND);
  const entity = { manufacturer, type, serial_number };
  return datastore.save({ key: key, data: entity }).then(() => {
    entity.id = key.id;
    return entity;
  });
}

function update_one(id, manufacturer, type, serial_number, computer) {
  //TODO: Take entity object instead of parameters
  const key = datastore.key([PERIPHERAL_KIND, parseInt(id, 10)]);
  const entity = { manufacturer, type, serial_number, computer };

  if (entity.computer === null) delete entity.computer;

  return datastore
    .update({ key: key, data: entity })
    .then(() => {
      entity.id = key.id.toString();
      return entity;
    })
    .catch((err) => {
      return { Error: "No peripheral with this peripheral_id exists" };
    });
}

async function delete_one(id) {
  const entity = await get_by_property("__key__", id);

  if (entity.Error || entity.length !== 1) {
    return { Error: "No peripheral with this peripheral_id exists" };
  } else {
    const key = datastore.key([PERIPHERAL_KIND, parseInt(id, 10)]);
    return datastore.delete(key);
  }
}
/* ------------- End Model Functions ------------- */

module.exports = {
  get_all,
  get_by_property,
  post_one,
  update_one,
  delete_one,
};
