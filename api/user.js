const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

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

module.exports = {
  makeId,
  getJwt,
};
