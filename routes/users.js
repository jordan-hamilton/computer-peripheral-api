var express = require("express");
var router = express.Router();
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const boats = require("../api/boats");
const { DOMAIN } = require("../config.js");

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${DOMAIN}/.well-known/jwks.json`,
  }),
  issuer: `https://${DOMAIN}/`,
  algorithms: ["RS256"],
});

/* ------------- Begin Controller Functions ------------- */
router.get("/", (req, res) => {});

router.get("/:user_id/computers", checkJwt, (req, res) => {
  let statusCode = 401;
  if (req.user && req.user.sub) {
    statusCode = 200;
    boats
      .get_by_property("owner", req.user.sub)
      .then((data) => res.status(200).json(data));
  } else {
    res.status(statusCode).end();
  }
});

/* ------------- End Controller Functions ------------- */

module.exports = router;
