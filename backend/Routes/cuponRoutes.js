const express = require("express");
const router = express.Router();
const cuponCtrl = require("../controllers/cuponController");

router.get("/", cuponCtrl.list);
router.get("/:id", cuponCtrl.getOne);
router.post("/", cuponCtrl.create);
router.put("/:id", cuponCtrl.update);
router.delete("/:id", cuponCtrl.remove);

router.post("/validate", cuponCtrl.validateForOrder);
router.post("/consume", cuponCtrl.consume);

module.exports = router;