const router = require("express").Router();
const wbReconciliationRequisitionController = require("../../controllers/wb/wb-reconciliation-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbReconciliationRequisitionController.select);


// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbReconciliationRequisitionController.create
);

module.exports = router;