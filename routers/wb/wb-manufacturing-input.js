
const router = require("express").Router();
const wbManufacturingInputController = require("../../controllers/wb/wb-manufacturing-input");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbManufacturingInputController.selectByRequisitionId);

  // Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbManufacturingInputController.create
);

router.put(
  "/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  wbManufacturingInputController.update
);

module.exports = router;