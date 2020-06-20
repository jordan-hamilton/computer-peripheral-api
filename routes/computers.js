const express = require("express");
const router = express.Router();

const computers = require("../api/computers");
const peripherals = require("../api/peripherals");

const { checkJwt, PERIPHERALS_PATH } = require("../config");

/* ------------- Begin Controller Functions ------------- */
router.get("/", checkJwt, async (req, res) => {
  const accepts = req.accepts("application/json");

  if (!accepts) {
    res.status(406).send("Not Acceptable");
  } else {
    computers.get_by_property(req, "user", req.user.sub).then(async (data) => {
      data.items.map((entity) => {
        entity.self = `${req.protocol}://${req.get("host")}${req.baseUrl}/${
          entity.id
        }`;
      });

      for (let entity of data.items) {
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

router.get("/:id", checkJwt, (req, res) => {
  const accepts = req.accepts("application/json");
  const forbiddenError = {
    Error: "The specified computer could not be accessed",
  };

  if (!accepts) {
    res.status(406).send("Not Acceptable");
  } else {
    computers
      .get_by_property(req, "__key__", req.params.id)
      .then(async (data) => {
        if (!data.items || data.items.length !== 1) {
          // Set the status code to 403 if a protected resource was not found.
          res.status(403).json(forbiddenError);
        } else if (data.items[0].user && data.items[0].user !== req.user.sub) {
          // Set the status code to 403 if a protected resource does not belong to the current user.
          res.status(403).json(forbiddenError);
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
  }
});

router.post("/", checkJwt, (req, res) => {
  const accepts = req.accepts("application/json");

  if (req.get("Content-Type") !== "application/json") {
    res.status(415).send("Server only accepts application/json data");
  } else if (!accepts) {
    res.status(406).send("Not Acceptable");
  } else {
    const entity = (({ manufacturer, model, serial_number }) => ({
      manufacturer,
      model,
      serial_number,
      user: req.user.sub,
    }))(req.body);

    computers.post_one(entity).then((entity) => {
      entity.self = `${req.protocol}://${req.get("host")}${req.baseUrl}/${
        entity.id
      }`;

      // Append an empty array rather than querying for related entities,
      // since this relationship can't exist yet.
      entity.peripherals = [];

      res.status(201).json(entity);
    });
  }
});

router.patch("/:id", checkJwt, (req, res) => {
  const accepts = req.accepts("application/json");
  const forbiddenError = {
    Error: "The specified computer could not be modified",
  };

  if (req.get("Content-Type") !== "application/json") {
    res.status(415).send("Server only accepts application/json data");
  } else if (!accepts) {
    res.status(406).send("Not Acceptable");
  } else {
    computers.get_by_property(req, "__key__", req.params.id).then((data) => {
      if (!data.items || data.items.length !== 1) {
        // Set the status code to 403 if a protected resource was not found.
        res.status(403).json(forbiddenError);
      } else if (data.items[0].user && data.items[0].user !== req.user.sub) {
        // Set the status code to 403 if a protected resource does not belong to the current user.
        res.status(403).json(forbiddenError);
      } else {
        const originalEntity = data.items[0];
        const updatedEntity = {
          manufacturer: req.body.manufacturer || originalEntity.manufacturer,
          model: req.body.model || originalEntity.model,
          serial_number: req.body.serial_number || originalEntity.serial_number,
          user: req.user.sub,
        };

        computers
          .update_one(req.params.id, updatedEntity)
          .then(async (entity) => {
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
          });
      }
    });
  }
});

router.put("/:id", checkJwt, (req, res) => {
  const accepts = req.accepts("application/json");
  const forbiddenError = {
    Error: "The specified computer could not be modified",
  };

  if (req.get("Content-Type") !== "application/json") {
    res.status(415).send("Server only accepts application/json data");
  } else if (!accepts) {
    res.status(406).send("Not Acceptable");
  } else {
    computers.get_by_property(req, "__key__", req.params.id).then((data) => {
      if (!data.items || data.items.length !== 1) {
        // Set the status code to 403 if a protected resource was not found.
        res.status(403).json(forbiddenError);
      } else if (data.items[0].user && data.items[0].user !== req.user.sub) {
        // Set the status code to 403 if a protected resource does not belong to the current user.
        res.status(403).json(forbiddenError);
      } else {
        const updatedEntity = (({ manufacturer, model, serial_number }) => ({
          manufacturer,
          model,
          serial_number,
          user: req.user.sub,
        }))(req.body);

        computers
          .update_one(req.params.id, updatedEntity)
          .then(async (entity) => {
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
          });
      }
    });
  }
});

router.put("/:computer_id/peripherals/:peripheral_id", checkJwt, (req, res) => {
  const accepts = req.accepts("application/json");
  const forbiddenError = {
    Error: "The specified peripheral could not be assigned to this computer",
  };

  if (!accepts) {
    res.status(406).send("Not Acceptable");
  } else {
    peripherals
      .get_by_property("__key__", req.params.peripheral_id)
      .then((child_data) => {
        if (child_data.length !== 1) {
          // Set the status code to 403 when attempting to assign a nonexistent resource.
          res.status(403).json(forbiddenError);
        } else {
          computers
            .get_by_property(req, "__key__", req.params.computer_id)
            .then((parent_data) => {
              if (!parent_data.items || parent_data.items.length !== 1) {
                // Set the status code to 403 if a protected resource was not found.
                res.status(403).json(forbiddenError);
              } else if (
                parent_data.items[0].user &&
                parent_data.items[0].user !== req.user.sub
              ) {
                // Set the status code to 403 if a protected resource does not belong to the current user.
                res.status(403).json(forbiddenError);
              } else if (child_data[0].computer) {
                // Set the status code to 403 if a resource was not unassigned before attempting to reassign it.
                res.status(403).json(forbiddenError);
              } else {
                const updatedEntity = (({
                  manufacturer,
                  type,
                  serial_number,
                }) => ({
                  manufacturer,
                  type,
                  serial_number,
                  computer: parent_data.items[0].id,
                }))(child_data[0]);

                peripherals
                  .update_one(child_data[0].id, updatedEntity)
                  .then(() => res.status(204).end());
              }
            });
        }
      });
  }
});

router.delete(
  "/:computer_id/peripherals/:peripheral_id",
  checkJwt,
  (req, res) => {
    const accepts = req.accepts("application/json");
    const forbiddenError = {
      Error:
        "The specified peripheral could not be unassigned from this computer",
    };

    if (!accepts) {
      res.status(406).send("Not Acceptable");
    } else {
      computers
        .get_by_property(req, "__key__", req.params.computer_id)
        .then((parent_data) => {
          if (!parent_data.items || parent_data.items.length !== 1) {
            // Set the status code to 403 if a protected resource was not found.
            res.status(403).json(forbiddenError);
          } else if (
            parent_data.items[0].user &&
            parent_data.items[0].user !== req.user.sub
          ) {
            // Set the status code to 403 if a protected resource does not belong to the current user.
            res.status(403).json(forbiddenError);
          } else {
            peripherals
              .get_by_property("__key__", req.params.peripheral_id)
              .then((child_data) => {
                if (child_data.length !== 1) {
                  // Set the status code to 403 when attempting to unassign a nonexistent resource.
                  res.status(403).json(forbiddenError);
                } else {
                  const updatedEntity = (({
                    manufacturer,
                    type,
                    serial_number,
                  }) => ({
                    manufacturer,
                    type,
                    serial_number,
                  }))(child_data[0]);

                  child_data[0].computer !== req.params.computer_id
                    ? // Set the status code to 403 when attempting to unassign a resource that was not assigned.
                      res.status(403).json(forbiddenError)
                    : peripherals
                        .update_one(child_data[0].id, updatedEntity)
                        .then(() => res.status(204).end());
                }
              });
          }
        });
    }
  }
);

router.delete("/:id", checkJwt, async (req, res) => {
  const data = await computers.get_by_property(req, "__key__", req.params.id);

  if (data.items && data.items.length === 1) {
    if (data.items[0].user === req.user.sub) {
      const children = await peripherals.get_by_property(
        "computer",
        req.params.id
      );

      for (let child of children) {
        const updatedEntity = (({ manufacturer, type, serial_number }) => ({
          manufacturer,
          type,
          serial_number,
        }))(child);
        peripherals.update_one(child.id, updatedEntity);
      }

      computers.delete_one(req.params.id).then((data) => {
        if (data.Error) {
          // Set the status code to 403 if the resource could not be deleted.
          res.status(403).end();
        } else {
          res.status(204).end();
        }
      });
    } else {
      // Set the status code to 403 if a protected resource does not belong to the current user.
      res.status(403).end();
    }
  } else {
    // Set the status code to 403 when attempting to unassign a nonexistent resource.
    res.status(403).end();
  }
});

router.all("/", (req, res) => {
  res.set("Allow", "GET, POST");
  res.status(405).end();
});

router.all("/:id", (req, res) => {
  res.set("Allow", "GET, PATCH, PUT, DELETE");
  res.status(405).end();
});

router.all("/:computer_id/peripherals/:peripheral_id", (req, res) => {
  res.set("Allow", "PUT, DELETE");
  res.status(405).end();
});

/* ------------- End Controller Functions ------------- */

module.exports = router;
