const router = require("express").Router();
const weDyedFabricOrderRequisitionController = require("../../controllers/we/we-dyed-fabric-order-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/opened-orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weDyedFabricOrderRequisitionController.selectOpenedOrders);


router.get("/closed-orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weDyedFabricOrderRequisitionController.selectClosedOrders);

// get Queries
router.get("/opened-orders-for-purchase-wa",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weDyedFabricOrderRequisitionController.selectOpenedOrdersForAddPurchaseWa);

  router.get("/dyed-fabrics-order-requisition/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    weDyedFabricOrderRequisitionController.selectDyedFabricsOrderRequisition);

// Post Queries
router.post("/by-wc-fabric-order-ids",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weDyedFabricOrderRequisitionController.selectDyedFabricsByWcFabricOrderIds);

router.post("/by-orders-requisitions-ids",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weDyedFabricOrderRequisitionController.selectDyedFabricsByOrdersRequisitionsIds);

router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weDyedFabricOrderRequisitionController.create
);

router.put(
  "/close-order-by-requisition/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weDyedFabricOrderRequisitionController.closedOrderByRequisition
);

module.exports = router;