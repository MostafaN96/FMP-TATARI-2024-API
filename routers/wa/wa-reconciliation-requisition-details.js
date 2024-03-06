const router = require("express").Router();
const waReconciliationRequisitionDetailsController = require("../../controllers/wa/wa-reconciliation-requisition-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waReconciliationRequisitionDetailsController.selectByRequisitionId);

    // Post Queries
    router.post(
        "",
        middleWeres.checkAuth(),
        middleWeres.checkIdentity(usersType.ADMIN_STR),
        waReconciliationRequisitionDetailsController.create
    );

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waReconciliationRequisitionDetailsController.update
);

module.exports = router;