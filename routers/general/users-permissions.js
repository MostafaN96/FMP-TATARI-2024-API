const router = require("express").Router();
const usersPermissionsController = require("../../controllers/general/users-permissions");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

router.get("/select-added-users-permissions/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  usersPermissionsController.selectAddedUsersPermissions);

  router.get("/select-new-users-permissions/:id",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  usersPermissionsController.selectNewUsersPermissions);

router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  usersPermissionsController.update
);


module.exports = router;