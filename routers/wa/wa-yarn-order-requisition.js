const router = require("express").Router();
const waYarnOrderRequisitionController = require("../../controllers/wa/wa-yarn-order-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/opened-orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waYarnOrderRequisitionController.selectOpenedOrders);

router.get("/closed-orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waYarnOrderRequisitionController.selectClosedOrders);

  router.get("/yarns-by-yarn-order-requisition/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waYarnOrderRequisitionController.selectYarnsOfYarnOrderRequisition);

  router.get("/inquire-yarns-by-yarn-order-requisition/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    waYarnOrderRequisitionController.inquireYarnsOfFabricForOrderWa);

    
  router.get("/by-yarn-wa/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waYarnOrderRequisitionController.selectByYarnWa);
    
  router.get("/by-warehouse-wa/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waYarnOrderRequisitionController.selectByWarehouseWa);
    
  router.get("/by-warehouse-by-supplier-wa/:id/:supplierId",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waYarnOrderRequisitionController.selectByWarehouseBySupplierWa);
    
  router.get("/by-industry-wb/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waYarnOrderRequisitionController.selectByIndustryWb);
    
  router.get("/by-industry-by-fabric-wb/:id/:fabricId",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    waYarnOrderRequisitionController.selectByIndustryByFabricWb);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waYarnOrderRequisitionController.create
);

router.put(
  "/close-order-by-requisition/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  waYarnOrderRequisitionController.closedOrderByRequisition
);

module.exports = router;