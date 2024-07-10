const router = require("express").Router();
const wdDyeingRequisitionDetailsController = require("../../controllers/wd/wd-dyeing-requisition-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries

router.get("/max-work-order-number",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wdDyeingRequisitionDetailsController.selectMaxWorkOrderNumber);
    
router.get("/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdDyeingRequisitionDetailsController.selectByRequisitionId);


// Post Queries
router.post(
    "",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wdDyeingRequisitionDetailsController.create
);

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdDyeingRequisitionDetailsController.update
);

router.put(
    "/update-dyeing-cost-price/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdDyeingRequisitionDetailsController.updateDyeingCostPrice
);

module.exports = router;