const router = require("express").Router();
const exchangeRateController = require("../../controllers/general/exchange-rate");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

router.get("",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  exchangeRateController.select);


router.post(
  "",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  exchangeRateController.insert
);

module.exports = router;