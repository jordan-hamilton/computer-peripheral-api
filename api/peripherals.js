const ds = require("../datastore");
const datastore = ds.datastore;

const { PERIPHERAL_KIND } = require("../config");

/* ------------- Begin Model Functions ------------- */
function get_all() {
  const q = datastore.createQuery(PERIPHERAL_KIND);

  return datastore
    .runQuery(q)
    .then((entities) => entities[0].map(ds.fromDatastore));
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

function post_one(name, type, length, owner) {
  const key = datastore.key(PERIPHERAL_KIND);
  const entity = { name, type, length, owner };
  return datastore.save({ key: key, data: entity }).then(() => {
    entity.id = key.id;
    return entity;
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
  delete_one,
};
