const router = require("express").Router();
const weTransitionBetweenWHRequisitionController = require("../../controllers/we/we-transition-between-wh-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weTransitionBetweenWHRequisitionController.select);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weTransitionBetweenWHRequisitionController.create
);

module.exports = router;