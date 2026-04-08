const router = require("express").Router();
const wcFabricOrderRequisitionController = require("../../controllers/wc/wc-fabric-order-requisition");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/opened-orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcFabricOrderRequisitionController.selectOpenedOrders);

router.get("/closed-orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcFabricOrderRequisitionController.selectClosedOrders);

router.get("/fabrics-order-requisition/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  wcFabricOrderRequisitionController.selectFabricsOrderRequisition);

router.get("/inquire-fabrics-order-requisition/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  wcFabricOrderRequisitionController.inquireFabricsForOrderWc);

router.get("/by-warehouse-wc/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcFabricOrderRequisitionController.selectByWarehouseWc);

router.get("/by-dyeing-wd/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcFabricOrderRequisitionController.selectByDyeingWd);

// جلب الطلبيات المدموجة تحت parent معين
router.get("/merged-orders/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcFabricOrderRequisitionController.selectMergedOrders);

// جلب الطلبيات المفتوحة مع معلومات parent
router.get("/with-parent-info/opened",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcFabricOrderRequisitionController.selectOrdersWithParentInfo);

// جلب جميع الطلبيات مع معلومات parent
router.get("/with-parent-info",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcFabricOrderRequisitionController.selectOrdersWithParentInfo);

// جلب جميع الطلبيات مع معلومات الدمج (فقط parent و regular، بدون children)
// Query params: ?status=opened أو ?status=closed (اختياري)
router.get("/all-with-merge-info",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcFabricOrderRequisitionController.selectAllWithMergeInfo);

// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcFabricOrderRequisitionController.create
);

router.put(
  "/close-order-by-requisition/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcFabricOrderRequisitionController.closedOrderByRequisition
);

// دمج طلبيات متعددة
router.put(
  "/merge-orders",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcFabricOrderRequisitionController.mergeOrders
);

// فصل طلبية من parent
router.put(
  "/detach-order/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wcFabricOrderRequisitionController.detachOrder
);

module.exports = router;