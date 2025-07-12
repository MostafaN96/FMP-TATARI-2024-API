const router = require("express").Router();
const weTransitionBetweenOrdersRequisitionController = require("../../controllers/we/we-transition-between-orders-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weTransitionBetweenOrdersRequisitionController.select);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weTransitionBetweenOrdersRequisitionController.create
);

module.exports = router;