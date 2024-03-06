const router = require("express").Router();
const wdTransitionBetweenDyersRequisitionDetailsController = require("../../controllers/wd/wd-transition-between-dyers-requisition-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdTransitionBetweenDyersRequisitionDetailsController.selectByRequisitionId);

// Post Queries
router.post(
    "",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wdTransitionBetweenDyersRequisitionDetailsController.create
);

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdTransitionBetweenDyersRequisitionDetailsController.update
);

module.exports = router;