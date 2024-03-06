const router = require("express").Router();
const consigmentDyeingController = require("../../controllers/general/consigment-dyeing");

// MiddleWares 
const middleWeres = require("../../middlewares/middlewares");
 
// Utils
const usersType = require("../../util/user-types");

router.get("",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    consigmentDyeingController.select);

module.exports = router;

router.get("/deleted",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  consigmentDyeingController.selectDeleted);

router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  consigmentDyeingController.create
);

router.put(
  "/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  middleWeres.checkInt(),
  consigmentDyeingController.update
);


router.delete(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  consigmentDyeingController.delete
);

router.patch(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  consigmentDyeingController.restore
);

module.exports = router;