const express = require("express");
const router = express.Router();

const { checkJwt, DOMAIN } = require("../config");
const users = require("../api/users");
const computers = require("../api/computers");

/* ------------- Begin Controller Functions ------------- */
router.get("/", (req, res) => {
  users.get_all().then((data) => res.status(200).json(data));
});

router.get("/:user_id/computers", checkJwt, (req, res) => {
  let statusCode = 200;
  computers
    .get_by_property("user", req.user.sub)
    .then((data) => res.status(statusCode).json(data));
});

router.all("/", (req, res) => {
  res.set("Allow", "GET");
  res.status(405).end();
});

// router.all("/:user_id", (req, res) => {
//   res.set("Allow", "GET, PATCH, PUT, DELETE");
//   res.status(405).end();
// });

/* ------------- End Controller Functions ------------- */

module.exports = router;
