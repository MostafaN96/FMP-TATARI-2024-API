const router = require("express").Router();
const logsController = require("../../controllers/config/logs");

router.all("*", logsController.log);

module.exports = router;