const router = require("express").Router();
const waPurchaseOrderDetailsController = require("../../controllers/wa/wa-purchase-order-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/opened-orders/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waPurchaseOrderDetailsController.selectByRequisitionIdOpenedOrder);

router.get("/closed-orders/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waPurchaseOrderDetailsController.selectByRequisitionIdClosedOrder);

router.get("/by-yarn-by-seller/:yarnId/:sellerId",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waPurchaseOrderDetailsController.selectByYarnySeller);

router.get("/yarns-of-purchase-order/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waPurchaseOrderDetailsController.yarnsOfPurchaseOrderWa);

router.get("/yarns-of-purchase-order-not-added/:id/:addRequisitionId",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waPurchaseOrderDetailsController.yarnsOfPurchaseOrderWaNotAdded);

// Post Queries
router.post(
    "",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waPurchaseOrderDetailsController.create
);

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waPurchaseOrderDetailsController.update
);

router.put(
    "/close-order/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waPurchaseOrderDetailsController.closeOrder
);

module.exports = router;