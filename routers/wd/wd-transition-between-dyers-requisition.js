const router = require("express").Router();
const wdTransitionBetweenDyersRequisitionController = require("../../controllers/wd/wd-transition-between-dyers-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdTransitionBetweenDyersRequisitionController.select);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdTransitionBetweenDyersRequisitionController.create
);

module.exports = router;