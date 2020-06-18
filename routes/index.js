const express = require("express");
const router = express.Router();
const path = require("path");
const jwtDecoder = require("jwt-decode");

const users = require("../api/users");
const { CLIENT_ID, CLIENT_SECRET, DOMAIN } = require("../config");

/* GET home page. */
router.get("/", (req, res) => {
  res.render("index");
});

router.get("/register", (req, res) => {
  req.session.state = users.makeId();

  const callbackUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

  const redirectUrl =
    `https://${DOMAIN}/authorize?` +
    `response_type=code&` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
    `state=${req.session.state}`;

  res.redirect(redirectUrl);
});

router.get("/user", async (req, res) => {
  if (!req.session.jwt || !req.session.userId) {
    res.redirect("/");
  } else {
    res.sendFile("user.html", { root: path.join(__dirname, "../", "public") });
  }
});

router.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const data = {
    grant_type: "password",
    username: username,
    password: password,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  };

  const jwt = await users.getJwt(`https://${DOMAIN}/oauth/token`, data);

  if (jwt) {
    req.session.jwt = jwt;
    req.session.userId = jwtDecoder(jwt).sub;
    await users.post_one({ userId: req.session.userId });
    res.redirect("/user");
  } else {
    res.redirect("/");
  }
});

router.get("/api/user", async (req, res) => {
  if (req.session.jwt && req.session.userId) {
    res.json({
      jwt: req.session.jwt,
      userId: req.session.userId,
    });
  } else {
    res.json(null);
  }
});

module.exports = router;
