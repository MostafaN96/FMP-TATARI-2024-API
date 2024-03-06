const router = require("express").Router();
const waReturnRequisitionController = require("../../controllers/wa/wa-return-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waReturnRequisitionController.select);


// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waReturnRequisitionController.create
);

module.exports = router;