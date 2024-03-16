const router = require("express").Router();
const waAddRequisitionDetailsController = require("../../controllers/wa/wa-add-requisition-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries

router.get("/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waAddRequisitionDetailsController.selectByRequisitionId);

    router.get("/for-order/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waAddRequisitionDetailsController.selectByRequisitionIdForOrder);

    
// Post Queries
router.post(
    "",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waAddRequisitionDetailsController.create
);

router.post(
    "/by-order",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waAddRequisitionDetailsController.createByOrder
);

router.put(
    "/by-order/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waAddRequisitionDetailsController.updateForOrder
);

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waAddRequisitionDetailsController.update
);

module.exports = router;