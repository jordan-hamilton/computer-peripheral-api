const ds = require("../datastore");
const datastore = ds.datastore;

const { COMPUTER_KIND } = require("../config");

/* ------------- Begin Model Functions ------------- */
function get_count_by_property(propKey, propValue) {
  propKey === "__key__"
    ? (value = datastore.key([COMPUTER_KIND, datastore.int(propValue)]))
    : (value = propValue);

  const q = datastore.createQuery(COMPUTER_KIND).filter(propKey, "=", value);

  return datastore.runQuery(q).then((data) => data[0].length);
}

function get_by_property(req, propKey, propValue) {
  let value;
  const results = {};

  propKey === "__key__"
    ? (value = datastore.key([COMPUTER_KIND, datastore.int(propValue)]))
    : (value = propValue);

  const q = datastore
    .createQuery(COMPUTER_KIND)
    .filter(propKey, "=", value)
    .limit(5);

  if (req.query && Object.keys(req.query).includes("cursor")) {
    q.start(req.query.cursor);
  }

  return datastore.runQuery(q).then(async (entities) => {
    results.items = entities[0].map(ds.fromDatastore);

    if (entities[1].moreResults !== ds.Datastore.NO_MORE_RESULTS) {
      results.next = entities[1].endCursor;
    }

    results.total_records = await get_count_by_property(propKey, propValue);

    return results;
  });
}

function post_one(entity) {
  const key = datastore.key(COMPUTER_KIND);

  return datastore.save({ key: key, data: entity }).then(() => {
    entity.id = key.id;
    return entity;
  });
}

function update_one(entity) {
  const key = datastore.key([COMPUTER_KIND, parseInt(entity.id, 10)]);

  // Remove the ID from the object before updating the datastore to prevent saving
  // a redundant ID property with the entity.
  delete entity.id;

  return datastore
    .update({ key: key, data: entity })
    .then(() => {
      entity.id = key.id.toString();
      return entity;
    })
    .catch((err) => {
      return { Error: "No computer with this computer_id exists" };
    });
}

async function delete_one(id) {
  const key = datastore.key([COMPUTER_KIND, parseInt(id, 10)]);
  return datastore.delete(key);
}
/* ------------- End Model Functions ------------- */

module.exports = {
  get_by_property,
  post_one,
  update_one,
  delete_one,
};
