const express = require("express");
const router = express.Router();

const { checkJwt, DOMAIN } = require("../config");
const users = require("../api/users");

/* ------------- Begin Controller Functions ------------- */
router.get("/", (req, res) => {
  users.get_all().then((data) => res.status(200).json(data));
});

router.get("/:user_id/computers", checkJwt, (req, res) => {
  let statusCode = 401;
  if (req.user && req.user.sub) {
    statusCode = 200;
    boats
      .get_by_property("user", req.user.sub)
      .then((data) => res.status(200).json(data));
  } else {
    res.status(statusCode).end();
  }
});

/* ------------- End Controller Functions ------------- */

module.exports = router;
