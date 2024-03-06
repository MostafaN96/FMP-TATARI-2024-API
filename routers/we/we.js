const router = require("express").Router();
const weController = require("../../controllers/we/we");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

  router.get("/select-store-we",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weController.selectStoreWe);

  router.get("/select-store-with-dyeing-services-we",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weController.selectStoreWithDyeingServicesWe);

  router.get("/select-store-by-supplier-for-return-we/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weController.selectStoreBySupplierForReturnWe);

  router.get("/select-store-for-direct-sell-we/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weController.selectStoreForDirectSellWe);

  router.get("/select-solded-by-seller-for-return-sell-we/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weController.selectSoldedBySellerForReturnSellWe);
  
  router.put("/",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  weController.update);

  module.exports = router;