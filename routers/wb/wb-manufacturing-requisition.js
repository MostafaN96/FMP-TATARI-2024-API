const router = require("express").Router();
const wbManufacturingRequisitionController = require("../../controllers/wb/wb-manufacturing-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbManufacturingRequisitionController.select);

  router.get("/orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbManufacturingRequisitionController.selectOrders);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbManufacturingRequisitionController.create
);

router.post(
  "/add-by-order",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbManufacturingRequisitionController.createForOrder
);

module.exports = router;