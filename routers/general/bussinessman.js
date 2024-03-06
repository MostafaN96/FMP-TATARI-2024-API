const router = require("express").Router();
const bussinessmanController = require("../../controllers/general/bussinessman");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

router.get("/supplier",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.selectSuppliers);

router.get("/seller",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.selectSellers);

  router.get("/manufacturer-manufactured", 
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.selectManufacturerManufactured)

router.get("/yarn-suppliers-bought-from",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.selectYarnSuppliersBoughtFromWa);
  
router.get("/manufacturer",
middleWeres.checkAuth(),
middleWeres.checkIdentity(usersType.ADMIN_STR),
bussinessmanController.selectManufacturer);

router.get("/transported-manufacturers-wb",
middleWeres.checkAuth(),
middleWeres.checkIdentity(usersType.ADMIN_STR),
bussinessmanController.selectTransportedManufacturersInWb);

router.get("/transported-manufacturers-not-selected-wb/:id",
middleWeres.checkAuth(),
middleWeres.checkIdentity(usersType.ADMIN_STR),
bussinessmanController.selectTransportedManufacturersNotSelectedInWb);

router.get("/seller-manufacturing-ordered",
middleWeres.checkAuth(),
middleWeres.checkIdentity(usersType.ADMIN_STR),
bussinessmanController.selectSellerManufacturingOrdered);
  
router.get("/fabric-suppliers-bought-from",
middleWeres.checkAuth(),
middleWeres.checkIdentity(usersType.ADMIN_STR),
bussinessmanController.selectFabricSuppliersBoughtFromWc);

router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.select);

  router.get("/dyer",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.selectDyer);

  router.get("/dyer-dyeing", 
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.selectDyerDyeing)

  router.get("/dyeing-from-wd", 
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.selectDyeingFromWd)
  
  router.get("/dyer-has-services",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.selectDyerHasServices);
  
  router.get("/sellers-ordered-from-dyeing",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.selectSellersOrderedFromDyeing);

  router.get("/dyer-has-form",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.selectDyerHasForm);
  
  
router.get("/not-selected-dyer-wd/:id",
middleWeres.checkAuth(),
middleWeres.checkIdentity(usersType.ADMIN_STR),
bussinessmanController.selectNotSelectedDyeingWd);

router.get("/suppliers-bought-from-we",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.selectFabricSuppliersBoughtFromWe);

router.get("/sellers-sell-from-we",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.selectSellersSellFromWe);

router.get("/deleted",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.selectDeleted);

router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.create
);

router.put(
  "/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  bussinessmanController.update
);


router.delete(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.delete
);

router.patch(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  bussinessmanController.restore
);

module.exports = router;