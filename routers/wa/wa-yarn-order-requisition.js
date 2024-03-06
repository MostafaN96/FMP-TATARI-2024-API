const router = require("express").Router();
const waYarnOrderRequisitionController = require("../../controllers/wa/wa-yarn-order-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/opened-orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waYarnOrderRequisitionController.selectOpenedOrders);

router.get("/closed-orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waYarnOrderRequisitionController.selectClosedOrders);

  router.get("/yarns-by-yarn-order-requisition/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waYarnOrderRequisitionController.selectYarnsOfYarnOrderRequisition);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waYarnOrderRequisitionController.create
);

router.put(
  "/close-order-by-requisition/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waYarnOrderRequisitionController.closedOrderByRequisition
);

module.exports = router;