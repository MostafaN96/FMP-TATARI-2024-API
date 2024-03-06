const router = require("express").Router();
const weReturnRequisitionDetailsController = require("../../controllers/we/we-return-requisition-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    weReturnRequisitionDetailsController.selectByRequisitionId);

// Post Queries
router.post(
    "",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    weReturnRequisitionDetailsController.create
);

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    weReturnRequisitionDetailsController.update
);

module.exports = router;