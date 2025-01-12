const router = require("express").Router();
const wcController = require("../../controllers/wc/wc");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

  router.get("/select-by-warehouse-by-fabric-wc/:warehouseId/:fabricId/:fabricOrderId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcController.selectConsigmentManufacturingQuantityByWarehouseByFabricWc);
  
  router.get("/select-by-warehouse-by-fabric-by-supplier-for-return-wc/:id/:warehouseId/:fabricId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcController.selectConsigmentManufacturingQuantityByWarehouseByFabricForReturn);


  module.exports = router;