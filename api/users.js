const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const ds = require("../datastore");
const datastore = ds.datastore;

const { USER_KIND } = require("../config");

function makeId() {
  return uuidv4();
}

async function getJwt(url, data) {
  try {
    const response = await axios.post(url, data);
    return response.data && response.data.id_token
      ? response.data.id_token
      : null;
  } catch (error) {
    console.error(error);
  }
}

/* ------------- Begin Model Functions ------------- */
function get_all() {
  const q = datastore.createQuery(USER_KIND);

  return datastore.runQuery(q).then((entities) => entities[0]);
}

function get_by_property(propKey, propValue) {
  let value;

  propKey === "__key__"
    ? (value = datastore.key([USER_KIND, datastore.int(propValue)]))
    : (value = propValue);

  const q = datastore.createQuery(USER_KIND).filter(propKey, "=", value);
  return datastore.runQuery(q).then((data) => {
    return data[0]
      ? data[0].map(ds.fromDatastore)
      : { Error: "No user with this user_id exists" };
  });
}

async function post_one(entity) {
  const key = datastore.key(USER_KIND);

  const duplicate = await get_by_property("userId", entity.userId);

  return duplicate && duplicate.length
    ? { Error: "A user with this user_id already exists" }
    : datastore.save({ key: key, data: entity }).then(() => entity);
}
/* ------------- End Model Functions ------------- */

module.exports = {
  makeId,
  getJwt,
  get_all,
  post_one,
};
