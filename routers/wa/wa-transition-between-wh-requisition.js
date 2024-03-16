const router = require("express").Router();
const waTransitionBetweenWHRequisitionController = require("../../controllers/wa/wa-transition-between-wh-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waTransitionBetweenWHRequisitionController.select);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waTransitionBetweenWHRequisitionController.create
);

module.exports = router;