const router = require("express").Router();
const consigmentYarnController = require("../../controllers/general/consigment-yarn");

// MiddleWares 
const middleWeres = require("../../middlewares/middlewares");
 
// Utils
const usersType = require("../../util/user-types");

router.get("",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    consigmentYarnController.select);

module.exports = router;

router.get("/deleted",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  consigmentYarnController.selectDeleted);

router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  consigmentYarnController.create
);

router.put(
  "/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  consigmentYarnController.update
);


router.delete(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  consigmentYarnController.delete
);

router.patch(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  consigmentYarnController.restore
);

module.exports = router;