const express = require("express");
const router = express.Router();

const { checkJwt, DOMAIN } = require("../config");
const computers = require("../api/computers");

/* ------------- Begin Controller Functions ------------- */
router.get("/", (req, res) => {
  boats.get_all().then((data) => res.status(200).json(data));
});

router.post("/", checkJwt, (req, res, next) => {
  let statusCode = 401;

  if (req.user && req.user.sub) {
    boats
      .post_one(req.body.name, req.body.type, req.body.length, req.user.sub)
      .then((entity) => {
        if (!entity.Error) {
          statusCode = 201;
          res.status(statusCode).json(entity);
        }
      });
  } else {
    res.status(statusCode).end();
  }
});

router.delete("/:id", checkJwt, async (req, res) => {
  if (req.user && req.user.sub) {
    const data = await boats.get_by_property("__key__", req.params.id);

    if (data && data.length === 1) {
      if (data[0].owner === req.user.sub) {
        boats.delete_one(req.params.id).then((data) => {
          if (data.Error) {
            res.status(403).end();
          } else {
            res.status(204).end();
          }
        });
      } else {
        res.status(403).end();
      }
    } else {
      res.status(403).end();
    }
  } else {
    res.status(401).end();
  }
});
/* ------------- End Controller Functions ------------- */

module.exports = router;
