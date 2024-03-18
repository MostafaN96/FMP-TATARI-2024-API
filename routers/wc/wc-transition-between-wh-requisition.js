const router = require("express").Router();
const wcTransitionBetweenWHRequisitionController = require("../../controllers/wc/wc-transition-between-wh-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcTransitionBetweenWHRequisitionController.select);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcTransitionBetweenWHRequisitionController.create
);

module.exports = router;