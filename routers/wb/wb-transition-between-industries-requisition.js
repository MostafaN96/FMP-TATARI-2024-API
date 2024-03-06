const router = require("express").Router();
const wbTransitionBetweenIndustriesRequisitionController = require("../../controllers/wb/wb-transition-between-industries-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbTransitionBetweenIndustriesRequisitionController.select);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbTransitionBetweenIndustriesRequisitionController.create
);

module.exports = router;