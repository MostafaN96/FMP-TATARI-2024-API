const router = require("express").Router();
const waReturnRequisitionDetailsController = require("../../controllers/wa/wa-return-requisition-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waReturnRequisitionDetailsController.selectByRequisitionId);

// Post Queries
router.post(
    "",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waReturnRequisitionDetailsController.create
);

router.put(
    "/:id/:supplierId",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waReturnRequisitionDetailsController.update
);

module.exports = router;