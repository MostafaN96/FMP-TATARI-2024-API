const router = require("express").Router();
const weSellRequisitionDirectController = require("../../controllers/we/we-sell-requisition-direct");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weSellRequisitionDirectController.select);


// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weSellRequisitionDirectController.create
);

module.exports = router;