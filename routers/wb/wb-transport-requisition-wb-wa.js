const router = require("express").Router();
const wbTransportRequisitionWbWaController = require("../../controllers/wb/wb-transport-requisition-wb-wa");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbTransportRequisitionWbWaController.select);


// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbTransportRequisitionWbWaController.create
);

module.exports = router;