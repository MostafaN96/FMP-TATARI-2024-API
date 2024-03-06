const router = require("express").Router();
const circularKnittingMachineBussinessmanController = require("../../controllers/general/circular-knitting-machine-bussinessman");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  circularKnittingMachineBussinessmanController.select);

  router.get("/deleted",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  circularKnittingMachineBussinessmanController.selectDeleted);


router.get("/by-manufacture/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  circularKnittingMachineBussinessmanController.selectByManufacture);

router.delete(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  circularKnittingMachineBussinessmanController.delete
);

router.patch(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  circularKnittingMachineBussinessmanController.restore
);

module.exports = router;