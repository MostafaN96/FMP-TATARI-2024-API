const router = require("express").Router();
const wbManufacturingOrderRequisitionDetailsController = require("../../controllers/wb/wb-manufacturing-order-requisition-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/opened-orders/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wbManufacturingOrderRequisitionDetailsController.selectByRequisitionIdOpenedOrder);

router.get("/closed-orders/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wbManufacturingOrderRequisitionDetailsController.selectByRequisitionIdClosedOrder);

router.get("/by-fabric-by-seller/:fabricId/:sellerId",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wbManufacturingOrderRequisitionDetailsController.selectByFabricBySeller);

// Post Queries
router.post(
    "",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wbManufacturingOrderRequisitionDetailsController.create
);

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wbManufacturingOrderRequisitionDetailsController.update
);

router.put(
    "/close-order/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wbManufacturingOrderRequisitionDetailsController.closeOrder
);

module.exports = router;