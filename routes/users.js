const express = require("express");
const router = express.Router();

const { checkJwt, DOMAIN } = require("../config");
const users = require("../api/users");
const computers = require("../api/computers");

/* ------------- Begin Controller Functions ------------- */
router.get("/", (req, res) => {
  const accepts = req.accepts("application/json");

  if (!accepts) {
    res.status(406).send("Not Acceptable");
  } else {
    users.get_all().then((data) => res.status(200).json(data));
  }
});

router.all("/", (req, res) => {
  res.set("Allow", "GET");
  res.status(405).end();
});

/* ------------- End Controller Functions ------------- */

module.exports = router;
