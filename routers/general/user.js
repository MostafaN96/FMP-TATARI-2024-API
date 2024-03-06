const router = require("express").Router();
const userController = require("../../controllers/general/user");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  userController.select);

router.post(
  "/login",
  userController.login
);


module.exports = router;