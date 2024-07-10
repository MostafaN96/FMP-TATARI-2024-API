const router = require("express").Router();
const wbManufacturingOutputController = require("../../controllers/wb/wb-manufacturing-output");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/latest-manufacturing-fee-by-industry-by-fabric/:industryId/:fabricId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbManufacturingOutputController.selectLatestManufacturingFeeByIndustryAndFabric);

router.get("/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbManufacturingOutputController.selectByRequisitionId);

router.get("/for-order/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbManufacturingOutputController.selectByRequisitionIdForOrder);

  
router.get("/select-consigment-manufacturing-by-fabric/:id",
middleWeres.checkAuth(),
middleWeres.checkIdentity(usersType.ADMIN_STR),
wbManufacturingOutputController.selectConsigmentManufacturingByFabric);


router.put(
  "/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  wbManufacturingOutputController.update
);

router.put(
  "/update-for-order/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  wbManufacturingOutputController.updateForOrder
);

router.put(
  "/confirm-received/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  wbManufacturingOutputController.confirmReceived
);

module.exports = router;