const router = require("express").Router();
const wdDyeingOrderRequisitionController = require("../../controllers/wd/wd-dyeing-order-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/opened-orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdDyeingOrderRequisitionController.selectOpenedOrders);

router.get("/closed-orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdDyeingOrderRequisitionController.selectClosedOrders);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdDyeingOrderRequisitionController.create
);

router.put(
  "/close-order-by-requisition/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdDyeingOrderRequisitionController.closedOrderByRequisition
);

module.exports = router;