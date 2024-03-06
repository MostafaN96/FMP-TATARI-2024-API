const router = require("express").Router();
const wdTransportRequisitionWdWcController = require("../../controllers/wd/wd-transport-requisition-wd-wc");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdTransportRequisitionWdWcController.select);


// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdTransportRequisitionWdWcController.create
);

module.exports = router;