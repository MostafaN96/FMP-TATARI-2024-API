const router = require("express").Router();
const wdSettlingFormController = require("../../controllers/wd/wd-settling-form");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");


// Post Queries
router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdSettlingFormController.create
);

module.exports = router;