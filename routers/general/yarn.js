const router = require("express").Router();
const yarnController = require("../../controllers/general/yarn");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnController.select);

router.get("/max-code",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnController.selectMaxCode);

router.get("/deleted",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnController.selectDeleted);

  router.get("/stored-wa-yarns",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnController.selectStoredWaYarns);

  router.get("/stored-wa-yarns/:id/:warehouseId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnController.selectStoredWaYarnsBySupplier);

  router.get("/by-warehouse-wa/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnController.selectByWarehouseWa);

  router.get("/stored-wa-yarns-by-yarn/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnController.selectStoredWaYarnsByYarnId);

  router.get("/by-industry-wb/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnController.selectByIndustryWb);

  router.get("/stored-wb-yarns-in-manufacturers",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnController.selectStoredWbYarnsInManufacturers);

router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnController.create
);

router.put(
  "/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  yarnController.update
);  


router.delete(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnController.delete
);

router.patch(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  yarnController.restore
);

module.exports = router;