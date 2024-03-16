const router = require("express").Router();
const wbManufacturingOrderRequisitionController = require("../../controllers/wb/wb-manufacturing-order-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/opened-orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbManufacturingOrderRequisitionController.selectOpenedOrders);

router.get("/closed-orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbManufacturingOrderRequisitionController.selectClosedOrders);

  
  router.get("/inquire-fabrics-by-dyeing-order-requisition/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wbManufacturingOrderRequisitionController.inquireFabricsByDyeingOrderForOrderWb);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbManufacturingOrderRequisitionController.create
);

router.put(
  "/close-order-by-requisition/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbManufacturingOrderRequisitionController.closedOrderByRequisition
);

module.exports = router;