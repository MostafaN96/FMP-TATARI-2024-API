const router = require("express").Router();
const warehouseController = require("../../controllers/general/warehouse");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  warehouseController.select);

router.get("/deleted",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  warehouseController.selectDeleted);

router.get("/warehouse-in-wa",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  warehouseController.selectWhereInWa);

router.get("/warehouse-in-wa-by-supplier/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  warehouseController.selectWhereInWaBySupplier);

router.get("/warehouse-in-wc",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  warehouseController.selectWhereInWc);

  router.get("/warehouse-in-wc-by-supplier/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  warehouseController.selectWhereInWcBySupplier);
  
router.get("/warehouse-in-we",
middleWeres.checkAuth(),
middleWeres.checkIdentity(usersType.ADMIN_STR),
warehouseController.selectWhereInWe);

router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  warehouseController.create
);

router.put(
  "/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  warehouseController.update
);


router.delete(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  warehouseController.delete
);

router.patch(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  warehouseController.restore
);

module.exports = router;