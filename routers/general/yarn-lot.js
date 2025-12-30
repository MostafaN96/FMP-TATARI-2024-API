const router = require("express").Router();
const yarnLotController = require("../../controllers/general/yarn-lot");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnLotController.select);

router.get("/max-code",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnLotController.selectMaxCode);

router.get("/deleted",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnLotController.selectDeleted);

  router.get("/by-yarn/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnLotController.selectByYarn);
  
  router.get("/by-warehouse-by-yarn-wa/:id/:yarnId/:yarnOrderId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnLotController.selectByWarehouseByYarnWa);
  
  router.get("/by-warehouse-by-yarn-wa/:id/:warehouseId/:yarnId/:yarnOrderId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnLotController.selectBySupplierByWarehouseByYarnWa);

  router.get("/by-industry-by-yarn-wb/:id/:yarnId/:yarnOrderId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnLotController.selectByIndustryByYarnWb);
  
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnLotController.create
);

router.put(
  "/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  yarnLotController.update
);  


router.delete(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnLotController.delete
);

router.patch(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnLotController.restore
);

module.exports = router;