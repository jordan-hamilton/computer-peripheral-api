const express = require("express");
const router = express.Router();

const computers = require("../api/computers");
const peripherals = require("../api/peripherals");

const { checkJwt, PERIPHERALS_PATH } = require("../config");

/* ------------- Begin Controller Functions ------------- */
router.get("/", (req, res) => {
  computers.get_all(req).then(async (data) => {
    data.items.map((entity) => {
      entity.self = `${req.protocol}://${req.get("host")}${req.baseUrl}/${
        entity.id
      }`;
    });

    for (let entity of data.items) {
      const children = await peripherals.get_by_property("computer", entity.id);
      children && children.length
        ? (entity.peripherals = children.map(({ id }) => ({
            id,
            self: `${req.protocol}://${req.get(
              "host"
            )}${PERIPHERALS_PATH}/${id}`,
          })))
        : (entity.peripherals = []);
    }

    if (data.next) {
      data.next = `${req.protocol}://${req.get("host")}${req.baseUrl}?cursor=${
        data.next
      }`;
    }

    res.status(200).json(data);
  });
});

router.post("/", checkJwt, (req, res, next) => {
  computers
    .post_one(req.body.name, req.body.type, req.body.length, req.user.sub)
    .then((entity) => {
      if (!entity.Error) {
        statusCode = 201;
        res.status(statusCode).json(entity);
      }
    });
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
