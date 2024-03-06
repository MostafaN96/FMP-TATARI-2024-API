const router = require("express").Router();
const wdFormDyeingRequisitionDetailsController = require("../../controllers/wd/wd-form-dyeing-requisition-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");


// get Queries
router.get("/order-by-requisition/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdFormDyeingRequisitionDetailsController.selectOrderByRequisitionId);

// get Queries
router.get("/by-dyeing/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdFormDyeingRequisitionDetailsController.selectByDyeing);

// get Queries
router.get("/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdFormDyeingRequisitionDetailsController.selectByRequisitionId);


// Post Queries
router.post(
    "",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wdFormDyeingRequisitionDetailsController.create
);

router.post(
    "/add-by-order",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wdFormDyeingRequisitionDetailsController.createForOrder
);

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdFormDyeingRequisitionDetailsController.update
);

router.put(
    "/update-by-order/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdFormDyeingRequisitionDetailsController.updateByOrder
);
module.exports = router;