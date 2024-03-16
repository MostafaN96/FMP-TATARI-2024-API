const router = require("express").Router();
const wcFabricOrderRequisitionDetailsController = require("../../controllers/wc/wc-fabric-order-requisition-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/opened-orders/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wcFabricOrderRequisitionDetailsController.selectByRequisitionIdOpenedOrder);

router.get("/closed-orders/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wcFabricOrderRequisitionDetailsController.selectByRequisitionIdClosedOrder);

router.get("/by-fabric-by-seller/:fabricId/:sellerId",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wcFabricOrderRequisitionDetailsController.selectByFabricBySeller);

// Post Queries
router.post(
    "",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wcFabricOrderRequisitionDetailsController.create
);

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wcFabricOrderRequisitionDetailsController.update
);

router.put(
    "/close-order/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wcFabricOrderRequisitionDetailsController.closeOrder
);

module.exports = router;