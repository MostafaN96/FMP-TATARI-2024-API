const router = require("express").Router();
const weReportController = require("../../controllers/we/we-report");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

router.post(
  "/select-inventory-total-by-date",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weReportController.selectInventoryTotalByDate
);

// Get Queries
router.get(
  "/select-inventory-total-by-fabric/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  weReportController.selectInventoryTotalByFabric
);

// Get Queries
router.get(
  "/select-inventory-details-by-warehouse-by-fabric/:id/:warehouseId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  weReportController.selectInventoryDetailsByWarehouseByFabric
);

// Get Queries
router.get(
  "/select-price/:fabricId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weReportController.selectPriceWe
);

router.get(
  "/dyeing-report-by-fabric/:dyedFabricId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weReportController.dyeingReportByFabric
);

router.get(
  "/sales-report",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weReportController.salesReport
);

// Post Queries
router.post(
  "/select-inventory-total",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weReportController.selectInventoryTotal
);

// Post Queries
router.post(
  "/select-inventory-details",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weReportController.selectInventoryDetails
);

router.post(
  "/inquire-fabric-avilability-report-we",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weReportController.inquireFabricAvilabilityReportWe
);

router.post(
  "/inquire-fabric-avilability-total-report-we",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weReportController.inquireFabricAvilabilityTotalReportWe
);

router.post(
  "/inquire-fabric-avilability-by-dyeing-order-requisition-report-we",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weReportController.inquireFabricAvilabilityByDyeingOrderRequisitionReportWe
);

router.post(
  "/inquire-fabric-avilability-by-dyeing-order-requisition-total-report-we",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weReportController.inquireFabricAvilabilityByDyeingOrderRequisitionTotalReportWe
);

module.exports = router;