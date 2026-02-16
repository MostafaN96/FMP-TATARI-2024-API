const router = require("express").Router();
const wdFormDyeingRequisitionController = require("../../controllers/wd/wd-form-dyeing-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdFormDyeingRequisitionController.select);


// Post Queries
router.post("/select-lazy",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdFormDyeingRequisitionController.selectAllLazy);

router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdFormDyeingRequisitionController.create
);

// Post Queries
router.post(
  "/add-by-order",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdFormDyeingRequisitionController.createForOrder
);

module.exports = router;