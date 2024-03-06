const router = require("express").Router();
const wbTransitionBetweenIndustriesRequisitionDetailsController = require("../../controllers/wb/wb-transition-between-industries-requisition-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wbTransitionBetweenIndustriesRequisitionDetailsController.selectByRequisitionId);

// Post Queries
router.post(
    "",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wbTransitionBetweenIndustriesRequisitionDetailsController.create
);

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wbTransitionBetweenIndustriesRequisitionDetailsController.update
);

module.exports = router;