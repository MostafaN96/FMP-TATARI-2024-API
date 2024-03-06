const router = require("express").Router();
const colorController = require("../../controllers/general/color");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");


router.get("/:deyingId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  colorController.selectByDeying);

  router.get("/by-category/:colorCategoryId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  colorController.selectByCategory);
  
router.get("/:deyingId/:colorCategoryId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  colorController.selectByCategoryAndDeying);


router.get("/:fabricId/:supplierId/:colorCategoryId/:requisitionId",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  colorController.selectDyersAndRequisitionsColorOfFabrics);

  
router.get("",
middleWeres.checkAuth(),
middleWeres.checkIdentity(usersType.ADMIN_STR),
colorController.select);

router.get("/deleted",
middleWeres.checkAuth(),
middleWeres.checkIdentity(usersType.ADMIN_STR),
colorController.selectDeleted);

router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  colorController.create
);

router.put(
  "/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  colorController.update
);


router.delete(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  colorController.delete
);

router.patch(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  colorController.restore
);

module.exports = router;