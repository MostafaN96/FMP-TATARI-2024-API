const router = require("express").Router();
const waAddRequisitionController = require("../../controllers/wa/wa-add-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waAddRequisitionController.select);

  
  router.get("/orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waAddRequisitionController.selectOrders);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waAddRequisitionController.create
);

module.exports = router;