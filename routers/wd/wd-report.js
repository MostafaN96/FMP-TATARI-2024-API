const router = require("express").Router();
const wdReportController = require("../../controllers/wd/wd-report");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

router.post(
  "/select-inventory-total-by-date",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdReportController.selectInventoryTotalByDate
);

// Get Queries
router.get(
  "/select-by-dyeing-fabric-total/:id/:dyeingId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  wdReportController.selectInventoryTotalByFabricByDyeing
);

// Get Queries
router.get(
  "/select-inventory-details-by-dyeing-by-fabric-by-lot/:id/:fabricId/:consigmentDyeingId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  wdReportController.selectInventoryDetailsByDyeingByFabricByConsigmentDyeing
);

// Get Queries
router.get(
  "/select-price-by-fabric-and-dyeing/:fabricId/:dyeingId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdReportController.selectPriceWd
);

router.get(
  "/select-price-by-fabric-and-dyeing/:fabricId/:dyeingId/:consigmentDyeingId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdReportController.selectPriceByFabricByDyeingByConsigmentDyeingInWd
);

router.get(
  "/dyeing-report-by-dyeing/:dyeingId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdReportController.dyeingReportByDyeing
);

router.get(
  "/dyeing-report-by-dyes",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdReportController.dyeingReportByDyes
);

router.get(
  "/dyeing-orders-report",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdReportController.dyeingOrdersReport
);

router.get(
  "/dyeing-orders-details-report",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdReportController.dyeingOrdersDetailsReport
);

router.post(
  "/form-report-by-fabric",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdReportController.formReportByFabric
);

// Post Queries
router.post(
  "/select-inventory-total",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdReportController.selectInventoryTotal
);

// Post Queries
router.post(
  "/select-inventory-details",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdReportController.selectInventoryDetails
);

module.exports = router;