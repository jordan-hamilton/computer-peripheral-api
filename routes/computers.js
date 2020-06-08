const express = require("express");
const router = express.Router();

const computers = require("../api/computers");
const peripherals = require("../api/peripherals");

const { checkJwt, PERIPHERALS_PATH } = require("../config");

/* ------------- Begin Controller Functions ------------- */
router.get("/", checkJwt, (req, res) => {
  const accepts = req.accepts("application/json"); // TODO: update status code
  computers.get_by_property(req, "user", req.user.sub).then(async (data) => {
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

router.get("/:id", checkJwt, (req, res) => {
  computers
    .get_by_property(req, "__key__", req.params.id)
    .then(async (data) => {
      if (data.items.length !== 1) {
        res.status(404).json("No computer with this computer_id exists");
      } else if (data.items[0].user && data.items[0].user !== req.user.sub) {
        res.status(403).end();
      } else {
        const entity = data.items[0];
        entity.self = `${req.protocol}://${req.get("host")}${req.baseUrl}/${
          entity.id
        }`;

        const children = await peripherals.get_by_property(
          "computer",
          entity.id
        );
        children && children.length
          ? (entity.peripherals = children.map(({ id }) => ({
              id,
              self: `${req.protocol}://${req.get(
                "host"
              )}${PERIPHERALS_PATH}/${id}`,
            })))
          : (entity.peripherals = []);

        res.status(200).json(entity);
      }
    });
});

router.post("/", checkJwt, (req, res, next) => {
  computers
    .post_one(
      req.body.manufacturer,
      req.body.model,
      req.body.serial_number,
      req.user.sub
    )
    .then((entity) => res.status(201).json(entity));
});

router.put("/:computer_id/peripherals/:peripheral_id", (req, res) => {
  peripherals
    .get_by_property("__key__", req.params.peripheral_id)
    .then((child_data) => {
      if (child_data.length !== 1) {
        res.status(404).json({
          Error: "The specified computer and/or peripheral don\u2019t exist",
        });
      } else {
        computers
          .get_by_property(req, "__key__", req.params.computer_id)
          .then((parent_data) => {
            if (parent_data.items.length !== 1) {
              res.status(404).json({
                Error:
                  "The specified computer and/or peripheral don\u2019t exist",
              });
            } else if (child_data[0].computer) {
              res.status(403).json({
                Error:
                  "The specified peripheral is already assigned to a computer.",
              });
            } else {
              peripherals
                .update_one(
                  child_data[0].id,
                  child_data[0].manufacturer,
                  child_data[0].type,
                  child_data[0].serial_number,
                  parent_data.items[0].id
                )
                .then(() => res.status(204).end());
            }
          });
      }
    });
});

router.delete("/:computer_id/peripherals/:peripheral_id", (req, res) => {
  computers
    .get_by_property("__key__", req.params.computer_id)
    .then((parent_data) => {
      if (parent_data.length !== 1) {
        res.status(404).json({
          Error:
            "No computer with this computer_id has a peripheral with this peripheral_id",
        });
      } else {
        peripherals
          .get_by_property(req.params.peripheral_id)
          .then((child_data) => {
            if (child_data.length !== 1) {
              res.status(404).json({
                Error:
                  "No computer with this computer_id has a peripheral with this peripheral_id",
              });
            } else {
              child_data[0].computer !== req.params.computer_id
                ? res.status(404).json({
                    Error:
                      "No computer with this computer_id has a peripheral with this peripheral_id",
                  })
                : peripherals
                    .update_one(
                      child_data[0].id,
                      child_data[0].manufacturer,
                      child_data[0].type,
                      child_data[0].serial_number,
                      null
                    )
                    .then(() => res.status(204).end());
            }
          });
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
