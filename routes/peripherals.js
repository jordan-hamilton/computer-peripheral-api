const express = require("express");
const router = express.Router();

const { COMPUTERS_PATH } = require("../config");
const computers = require("../api/computers");
const peripherals = require("../api/peripherals");

/* ------------- Begin Controller Functions ------------- */
router.get("/", (req, res) => {
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
            self: `${req.protocol}://${req.get("host")}${COMPUTERS_PATH}/${id}`,
          }))(parent.items[0]);
        }
      }
    }

    if (data.next) {
      data.next = `${req.protocol}://${req.get("host")}${req.baseUrl}?cursor=${
        data.next
      }`;
    }

    res.status(200).json(data);
  });
});

router.get("/:id", (req, res) => {
  peripherals.get_by_property("__key__", req.params.id).then(async (entity) => {
    if (entity.Error || entity.length !== 1) {
      res
        .status(404)
        .json({ Error: "No peripheral with this peripheral_id exists" });
    } else {
      entity[0].self = `${req.protocol}://${req.get("host")}${req.baseUrl}/${
        entity[0].id
      }`;

      if (entity[0].computer) {
        const parent = await computers.get_by_property(
          req,
          "__key__",
          entity[0].computer
        );
        if (parent.items && parent.items.length === 1) {
          entity[0].computer = (({ id }) => ({
            id,
            self: `${req.protocol}://${req.get("host")}${COMPUTERS_PATH}/${id}`,
          }))(parent.items[0]);
        }
      }

      res.status(200).json(entity[0]);
    }
  });
});

router.post("/", (req, res, next) => {
  peripherals
    .post_one(req.body.manufacturer, req.body.type, req.body.serial_number)
    .then((entity) => {
      entity.self = `${req.protocol}://${req.get("host")}${req.baseUrl}/${
        entity.id
      }`;
      res.status(201).json(entity);
    });
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
/* ------------- End Controller Functions ------------- */

module.exports = router;
