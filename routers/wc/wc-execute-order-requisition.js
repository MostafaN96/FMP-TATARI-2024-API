const router = require("express").Router();
const wcExecuteOrderRequisitionController = require("../../controllers/wc/wc-execute-order-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcExecuteOrderRequisitionController.select);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcExecuteOrderRequisitionController.create
);

module.exports = router;