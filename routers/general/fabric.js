const router = require("express").Router();
const fabricController = require("../../controllers/general/fabric");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  fabricController.select);

router.get("/max-code",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  fabricController.selectMaxCode);

router.get("/deleted",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  fabricController.selectDeleted);

router.get("/select-fabric-to-be-manufactured-by-industry/:industryId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  fabricController.selectFabricToBeManufacturedWb);

router.get("/fabric-by-order/:orderRequisitionId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  fabricController.selectFabricsByOrderWc);
  
  router.get("/by-warehouse-wc/:id/:fabricOrderId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  fabricController.selectByWarehouseWc);
  
  router.get("/by-warehouse-wc-for-transition-between-order/:id/:fabricOrderId/:toFabricOrderId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  fabricController.selectByWarehouseWcForTransitionBetweenOrder);
  
  router.get("/stored-fabrics-by-fabric-wc/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  fabricController.selectStoredFabricsByFabricIdWc);

  router.get("/stored-wc-fabrics/:id/:warehouseId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  fabricController.selectStoredWcFabricsBySupplierByWarehouse);

  router.get("/select-manufactured-fabric",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  fabricController.selectManufacturedFabricWb);

  router.get("/select-fabric-by-dyed-fabric/:dyedFabricId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  fabricController.selectFabricByDyedFabric);
  
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  fabricController.create
);

router.put(
  "/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  fabricController.update
);


router.delete(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  fabricController.delete
);

router.patch(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  fabricController.restore
);

module.exports = router;