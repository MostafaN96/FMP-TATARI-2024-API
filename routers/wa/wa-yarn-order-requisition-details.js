const router = require("express").Router();
const waYarnOrderRequisitionDetailsController = require("../../controllers/wa/wa-yarn-order-requisition-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/opened-orders/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waYarnOrderRequisitionDetailsController.selectByRequisitionIdOpenedOrder);

router.get("/closed-orders/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waYarnOrderRequisitionDetailsController.selectByRequisitionIdClosedOrder);

router.get("/by-yarn-by-seller/:yarnId/:sellerId",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waYarnOrderRequisitionDetailsController.selectByYarnySeller);

// Post Queries
router.post(
    "",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waYarnOrderRequisitionDetailsController.create
);

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waYarnOrderRequisitionDetailsController.update
);

router.put(
    "/close-order/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waYarnOrderRequisitionDetailsController.closeOrder
);

module.exports = router;