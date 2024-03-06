const router = require("express").Router();
const wcReportController = require("../../controllers/wc/wc-report");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

router.post(
  "/select-inventory-total-by-date",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcReportController.selectInventoryTotalByDate
);

// Get Queries
router.get(
  "/select-inventory-total-by-fabric/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  wcReportController.selectInventoryTotalByFabric
);

// Get Queries
router.get(
  "/select-inventory-details-by-warehouse-by-fabric-by-consigment-manufacturing/:id/:warehouseId/:consigmentManufacturingId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  wcReportController.selectInventoryDetailsByWarehouseByFabricByConsigmentManufacturing
);

// Get Queries
router.get(
  "/select-price/:fabricId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcReportController.selectPriceWc
);

router.get(
  "/select-price-by-fabric-and-consigmnet/:fabricId/:consigmentManufacturingId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcReportController.selectPriceByFabricByConsigmentManufacturingInWc
);

router.get(
  "/purchases-by-fabric/:fabricId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcReportController.purchasesByFabric
);

router.get(
  "/purchases-by-supplier/:supplierId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcReportController.purchasesBySupplier
);

router.get(
  "/purchases-by-suppliers",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcReportController.purchasesBySuppliers
);

router.get(
  "/manufacturing-report-by-fabric/:fabricId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcReportController.manufacturingReportByFabric
);

// Post Queries
router.post(
  "/select-inventory-total",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcReportController.selectInventoryTotal
);

// Post Queries
router.post(
  "/select-inventory-details",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcReportController.selectInventoryDetails
);

module.exports = router;