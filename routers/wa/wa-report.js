const router = require("express").Router();
const waReportController = require("../../controllers/wa/wa-report");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// Get Queries
router.get(
  "/select-inventory-total-by-yarn-by-warehouse/:id/:warehouseId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  waReportController.selectInventoryTotalByYarnByWarehouse
);

// Get Queries
router.get(
  "/select-inventory-details-by-warehouse-by-yarn-by-lot/:id/:yarnId/:yarnLotId/:consigmentYarnId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  waReportController.selectInventoryDetailsByWarehouseByYarnByLot
);

router.post(
  "/select-inventory-total-by-date",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waReportController.selectInventoryTotalByDate
);

// Get Queries
router.get(
  "/select-price/:yarnId/:consigmentYarnId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waReportController.selectPriceWa
);

router.get(
  "/purchases-by-yarn/:yarnId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waReportController.purchasesByYarn
);

router.get(
  "/purchases-by-supplier/:supplierId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waReportController.purchasesBySupplier
);

router.get(
  "/purchases-by-suppliers",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waReportController.purchasesBySuppliers
);

// Post Queries
router.post(
  "/select-inventory-total",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waReportController.selectInventoryTotal
);

// Post Queries
router.post(
  "/select-inventory-details",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waReportController.selectInventoryDetails
);

module.exports = router;