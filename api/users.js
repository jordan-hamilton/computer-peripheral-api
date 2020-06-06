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

  return datastore
    .runQuery(q)
    .then((entities) => entities[0].map(ds.fromDatastore));
}

function post_one(name, type, length, owner) {
  const key = datastore.key(BOAT_KIND);
  const entity = { name, type, length, owner };
  return datastore.save({ key: key, data: entity }).then(() => {
    entity.id = key.id;
    return entity;
  });
}
/* ------------- End Model Functions ------------- */

module.exports = {
  makeId,
  getJwt,
  get_all,
  post_one,
};
