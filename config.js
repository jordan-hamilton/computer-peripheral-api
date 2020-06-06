const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

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

module.exports = {
  COMPUTER_KIND: "Computer",
  COMPUTERS_PATH: "/computers",
  CLIENT_ID: "CFjoUVz2WlxWveTk6stnQj7SwNSO6k72",
  CLIENT_SECRET:
    "1btdJDXf7ovAs6Otg9pM7uk19waZB-ccBtTPW3JuS1uc_HFCNaV7vB-ejKbkyhiK",
  DOMAIN: "hamiltj2.auth0.com",
  checkJwt,
  USER_KIND: "User",
  USERS_PATH: "/users",
};
