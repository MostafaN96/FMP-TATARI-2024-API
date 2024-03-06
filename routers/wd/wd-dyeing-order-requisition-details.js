const router = require("express").Router();
const wdDyeingOrderRequisitionDetailsController = require("../../controllers/wd/wd-dyeing-order-requisition-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/opened-orders/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdDyeingOrderRequisitionDetailsController.selectByRequisitionIdOpenedOrder);

router.get("/closed-orders/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdDyeingOrderRequisitionDetailsController.selectByRequisitionIdClosedOrder);

router.get("/orders-by-seller/:sellerId",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wdDyeingOrderRequisitionDetailsController.selectOrdersBySeller);

// router.get("/by-fabric-by-seller/:fabricId/:sellerId",
//     middleWeres.checkAuth(),
//     middleWeres.checkIdentity(usersType.ADMIN_STR),
//     wdDyeingOrderRequisitionDetailsController.selectByFabricBySeller);

// Post Queries
router.post(
    "",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wdDyeingOrderRequisitionDetailsController.create
);

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdDyeingOrderRequisitionDetailsController.update
);

router.put(
    "/close-order/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdDyeingOrderRequisitionDetailsController.closeOrder
);

module.exports = router;