const router = require("express").Router();
const wcTransitionBetweenOrdersRequisitionController = require("../../controllers/wc/wc-transition-between-orders-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcTransitionBetweenOrdersRequisitionController.select);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcTransitionBetweenOrdersRequisitionController.create
);

module.exports = router;