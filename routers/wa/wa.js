const router = require("express").Router();
const waController = require("../../controllers/wa/wa");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

  router.get("/remaining-by-warehouse-by-yarn-by-lot-wa/:warehouseId/:yarnId/:yarnLotId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waController.selectYarnLotQuantityByWarehouseByYarnByLotWa);
  
  router.get("/remaining-by-warehouse-by-yarn-by-lot-by-supplier-for-return-wa/:id/:warehouseId/:yarnId/:yarnLotId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waController.selectYarnLotQuantityByWarehouseByYarnByLotForReturn);

  module.exports = router;