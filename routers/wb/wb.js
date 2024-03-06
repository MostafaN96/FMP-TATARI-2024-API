const router = require("express").Router();
const wbController = require("../../controllers/wb/wb");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/select-consigment-yarn-by-yarn-by-industry-by-lot/:yarnId/:industryId/:yarnLotId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbController.selectConsigmentYarnQuantityByYarnByIndustryByLotWb);

// get Queries
router.post("/select-not-included-yarn-lot-by-yarn-by-industry/:yarnId/:industryId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbController.selectNotIncludedYarnLotQuantityByYarnByIndustryWb);

router.get("/select-by-industry/:industryId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbController.selectQuantityByIndustryWb);

router.get("/select-quantity-and-fabric-to-be-manufactured-by-industry/:industryId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbController.selectQuantityandFabricToBeManufacturedByIndustryWb);

router.post("/select-by-industry-by-nedded-fabric-not-included-yarns-and-lots/:industryId/:neededFabricId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbController.selectByIndustryByNeededFabricToBeManufacturedNotIncludedYarnsAndLotsWb);

router.get("/select-by-industry-by-fabric/:industryId/:fabricId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbController.selectQuantityByIndustryByFabricWb);

  
router.put(
  "/update-fabric-to-be-manufactured/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  wbController.updateFabricToBeManufactured
);

module.exports = router;