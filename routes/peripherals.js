const express = require("express");
const router = express.Router();

const { COMPUTERS_PATH } = require("../config");
const computers = require("../api/computers");
const peripherals = require("../api/peripherals");

/* ------------- Begin Controller Functions ------------- */
router.get("/", (req, res) => {
  const accepts = req.accepts("application/json");

  if (!accepts) {
    res.status(406).send("Not Acceptable");
  } else {
    peripherals.get_all(req).then(async (data) => {
      data.items.map((entity) => {
        entity.self = `${req.protocol}://${req.get("host")}${req.baseUrl}/${
          entity.id
        }`;
      });

      for (let entity of data.items) {
        if (entity.computer) {
          const parent = await computers.get_by_property(
            req,
            "__key__",
            entity.computer
          );
          if (parent.items && parent.items.length === 1) {
            entity.computer = (({ id }) => ({
              id,
              self: `${req.protocol}://${req.get(
                "host"
              )}${COMPUTERS_PATH}/${id}`,
            }))(parent.items[0]);
          }
        }
      }

      if (data.next) {
        data.next = `${req.protocol}://${req.get("host")}${
          req.baseUrl
        }?cursor=${data.next}`;
      }

      res.status(200).json(data);
    });
  }
});

router.get("/:id", (req, res) => {
  const accepts = req.accepts("application/json");

  if (!accepts) {
    res.status(406).send("Not Acceptable");
  } else {
    peripherals.get_by_property("__key__", req.params.id).then(async (data) => {
      if (data.Error || data.length !== 1) {
        // Set the status code to 404 if an unprotected resource was not found.
        res
          .status(404)
          .json({ Error: "No peripheral with this peripheral_id exists" });
      } else {
        const entity = data[0];
        entity.self = `${req.protocol}://${req.get("host")}${req.baseUrl}/${
          entity.id
        }`;

        if (entity.computer) {
          const parent = await computers.get_by_property(
            req,
            "__key__",
            entity.computer
          );
          if (parent.items && parent.items.length === 1) {
            entity.computer = (({ id }) => ({
              id,
              self: `${req.protocol}://${req.get(
                "host"
              )}${COMPUTERS_PATH}/${id}`,
            }))(parent.items[0]);
          }
        }

        res.status(200).json(entity);
      }
    });
  }
});

router.post("/", (req, res, next) => {
  const accepts = req.accepts("application/json");

  if (req.get("Content-Type") !== "application/json") {
    res.status(415).send("Server only accepts application/json data");
  } else if (!accepts) {
    res.status(406).send("Not Acceptable");
  } else {
    const entity = (({ manufacturer, type, serial_number }) => ({
      manufacturer,
      type,
      serial_number,
    }))(req.body);

    peripherals.post_one(entity).then((entity) => {
      entity.self = `${req.protocol}://${req.get("host")}${req.baseUrl}/${
        entity.id
      }`;
      res.status(201).json(entity);
    });
  }
});

router.patch("/:id", (req, res) => {
  const accepts = req.accepts("application/json");

  if (req.get("Content-Type") !== "application/json") {
    res.status(415).send("Server only accepts application/json data");
  } else if (!accepts) {
    res.status(406).send("Not Acceptable");
  } else {
    peripherals.get_by_property("__key__", req.params.id).then((data) => {
      if (data.Error || data.length !== 1) {
        // Set the status code to 404 if an unprotected resource was not found.
        res
          .status(404)
          .json({ Error: "No peripheral with this peripheral_id exists" });
      } else {
        const originalEntity = data[0];
        const updatedEntity = {
          manufacturer: req.body.manufacturer || originalEntity.manufacturer,
          type: req.body.type || originalEntity.type,
          serial_number: req.body.serial_number || originalEntity.serial_number,
        };

        peripherals
          .update_one(req.params.id, updatedEntity)
          .then(async (entity) => {
            entity.self = `${req.protocol}://${req.get("host")}${req.baseUrl}/${
              entity.id
            }`;

            if (entity.computer) {
              const parent = await computers.get_by_property(
                "__key__",
                entity.computer
              );

              if (parent.items && parent.items.length === 1) {
                entity.computer = (({ id }) => ({
                  id,
                  self: `${req.protocol}://${req.get(
                    "host"
                  )}${COMPUTERS_PATH}/${id}`,
                }))(parent.items[0]);
              }
            }

            res.status(200).json(entity);
          });
      }
    });
  }
});

router.put("/:id", (req, res) => {
  const accepts = req.accepts("application/json");

  if (req.get("Content-Type") !== "application/json") {
    res.status(415).send("Server only accepts application/json data");
  } else if (!accepts) {
    res.status(406).send("Not Acceptable");
  } else {
    peripherals.get_by_property("__key__", req.params.id).then((data) => {
      if (data.Error || data.length !== 1) {
        // Set the status code to 404 if an unprotected resource was not found.
        res
          .status(404)
          .json({ Error: "No peripheral with this peripheral_id exists" });
      } else {
        const updatedEntity = (({ manufacturer, type, serial_number }) => ({
          manufacturer,
          type,
          serial_number,
        }))(req.body);

        peripherals
          .update_one(req.params.id, updatedEntity)
          .then(async (entity) => {
            entity.self = `${req.protocol}://${req.get("host")}${req.baseUrl}/${
              entity.id
            }`;

            if (entity.computer) {
              const parent = await computers.get_by_property(
                "__key__",
                entity.computer
              );

              if (parent.items && parent.items.length === 1) {
                entity.computer = (({ id }) => ({
                  id,
                  self: `${req.protocol}://${req.get(
                    "host"
                  )}${COMPUTERS_PATH}/${id}`,
                }))(parent.items[0]);
              }
            }

            res.status(200).json(entity);
          });
      }
    });
  }
});

router.delete("/:id", (req, res) => {
  peripherals.delete_one(req.params.id).then((data) => {
    if (data.Error) {
      res.status(404).end();
    } else {
      res.status(204).end();
    }
  });
});

router.all("/", (req, res) => {
  res.set("Allow", "GET, POST");
  res.status(405).end();
});

router.all("/:id", (req, res) => {
  res.set("Allow", "GET, PATCH, PUT, DELETE");
  res.status(405).end();
});
/* ------------- End Controller Functions ------------- */

module.exports = router;
