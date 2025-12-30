const router = require("express").Router();
const dyedFabricController = require("../../controllers/general/dyed-fabric");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  dyedFabricController.select);

router.get("/max-code",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  dyedFabricController.selectMaxCode);

router.get("/deleted",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  dyedFabricController.selectDeleted);

  
  router.get("/dyed-fabric", 
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  dyedFabricController.selectDyedFabric)

  router.get("/stored-dyed-fabrics-by-dyed-fabric-by-color-by-color-code-we/:id/:colorId/:colorCode",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  dyedFabricController.selectStoredDyedFabricsByDyedFabricByColorByColorCodeWe);

router.get("/dyed-fabric-by-order/:orderRequisitionId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  dyedFabricController.selectDyedFabricsByOrderWe);

router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  dyedFabricController.create
);

router.put(
  "/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  dyedFabricController.update
);  


router.delete(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  dyedFabricController.delete
);

router.patch(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  dyedFabricController.restore
);

module.exports = router;