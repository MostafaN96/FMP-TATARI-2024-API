const router = require("express").Router();
const wbReportController = require("../../controllers/wb/wb-report");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");


router.post(
  "/select-inventory-total-by-date",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbReportController.selectInventoryTotalByDate
);

// Get Queries
router.get(
  "/select-by-industry-yarn-total/:id/:yarnId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  wbReportController.selectInventoryTotalByYarnByIndustry
);

// Get Queries
router.get(
  "/select-inventory-details-by-industry-by-yarn-by-lot/:id/:yarnId/:yarnLotId/:consigmentYarnId/:yarnOrderId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  wbReportController.selectInventoryDetailsByIndustryByYarnByLot
);

// Get Queries
router.get(
  "/select-price-by-yarn-and-industry/:yarnId/:industryId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbReportController.selectPriceWb
);

router.get(
  "/select-price-by-yarn-and-industry-and-consigment/:yarnId/:industryId/:consigmentYarnId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbReportController.selectPriceByYarnIdByIndustryIdByConsigmentWb
);

// Post Queries
router.post(
  "/select-inventory-total",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbReportController.selectInventoryTotal
);

// Post Queries
router.post(
  "/select-inventory-details",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbReportController.selectInventoryDetails
);

// Get Queries
router.get(
  "/circular-knitting-machine-manufacturing-report",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbReportController.circularKnittingMachineManufacturingReport
);

router.get(
  "/circular-knitting-machine-report",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbReportController.circularKnittingMachineReport
);

router.get(
  "/manufacturing-orders-report",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbReportController.manufacturingOrdersReport
);

router.get(
  "/manufacturing-orders-details-report",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wbReportController.manufacturingOrdersDetailsReport
);

router.get("/select-by-fabric-by-consigment-manufacturing-report/:id/:consigmentManufacturingId",
middleWeres.checkAuth(),
middleWeres.checkIdentity(usersType.ADMIN_STR),
wbReportController.selectByFabricByConsigmentManufacturing);

module.exports = router;