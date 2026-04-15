const router = require("express").Router();
const weDyedFabricOrderRequisitionDetailsController = require("../../controllers/we/we-dyed-fabric-order-requisition-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/opened-orders/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    weDyedFabricOrderRequisitionDetailsController.selectByRequisitionIdOpenedOrder);

router.get("/closed-orders/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    weDyedFabricOrderRequisitionDetailsController.selectByRequisitionIdClosedOrder);

router.get("/orders-by-seller/:sellerId",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    weDyedFabricOrderRequisitionDetailsController.selectOrdersBySeller);

router.get("/waste-ratio",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    weDyedFabricOrderRequisitionDetailsController.getWasteRatio);

// router.get("/by-fabric-by-seller/:fabricId/:sellerId",
//     middleWeres.checkAuth(),
//     middleWeres.checkIdentity(usersType.ADMIN_STR),
//     weDyedFabricOrderRequisitionDetailsController.selectByFabricBySeller);

// Post Queries
router.post(
    "",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    weDyedFabricOrderRequisitionDetailsController.create
);

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    weDyedFabricOrderRequisitionDetailsController.update
);

router.put(
    "/close-order/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    weDyedFabricOrderRequisitionDetailsController.closeOrder
);

module.exports = router;