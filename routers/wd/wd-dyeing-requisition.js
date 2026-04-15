const router = require("express").Router();
const wdDyeingRequisitionController = require("../../controllers/wd/wd-dyeing-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdDyeingRequisitionController.select);

// Post Queries
router.post("/select-lazy",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdDyeingRequisitionController.selectAllLazy);

router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdDyeingRequisitionController.create
);

module.exports = router;