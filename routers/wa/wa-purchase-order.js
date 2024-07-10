const router = require("express").Router();
const waPurchaseOrderController = require("../../controllers/wa/wa-purchase-order");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/opened-orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waPurchaseOrderController.selectOpenedOrders);

router.get("/closed-orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waPurchaseOrderController.selectClosedOrders);

  router.get("/yarns-by-yarn-order-requisition/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waPurchaseOrderController.selectYarnsOfYarnOrderRequisition);

  router.get("/inquire-yarns-by-yarn-order-requisition/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waPurchaseOrderController.inquireYarnsOfFabricForOrderWa);

  router.post("/inquire-yarns-by-yarn-order-requisition-by-orders",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waPurchaseOrderController.inquireYarnsOfFabricForOrderWaByOrders);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waPurchaseOrderController.create
);

router.put(
  "/close-order-by-requisition/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waPurchaseOrderController.closedOrderByRequisition
);

module.exports = router;