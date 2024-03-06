const router = require("express").Router();
const wcReconciliationRequisitionController = require("../../controllers/wc/wc-reconciliation-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcReconciliationRequisitionController.select);


// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcReconciliationRequisitionController.create
);

module.exports = router;