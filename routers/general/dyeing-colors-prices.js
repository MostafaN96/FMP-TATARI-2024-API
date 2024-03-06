const router = require("express").Router();
const dyeingColorsPricesController = require("../../controllers/general/dyeing-colors-prices");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  dyeingColorsPricesController.select);

router.get("/deleted",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  dyeingColorsPricesController.selectDeleted);

  router.get("/select-by-color/:colorId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  dyeingColorsPricesController.selectByColorId);

router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  dyeingColorsPricesController.create
);

router.put(
  "/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  dyeingColorsPricesController.update
);


router.delete(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  dyeingColorsPricesController.delete
);

router.patch(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  dyeingColorsPricesController.restore
);

module.exports = router;