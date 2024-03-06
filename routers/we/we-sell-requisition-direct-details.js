const router = require("express").Router();
const weSellRequisitionDirectDetailsController = require("../../controllers/we/we-sell-requisition-direct-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    weSellRequisitionDirectDetailsController.selectByRequisitionId);

// Post Queries
router.post(
    "",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    weSellRequisitionDirectDetailsController.create
);

router.post(
    "/confirm",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    weSellRequisitionDirectDetailsController.confirm
);

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    weSellRequisitionDirectDetailsController.update
);

module.exports = router;