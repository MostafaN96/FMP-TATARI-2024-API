const router = require("express").Router();
const wdFormDyeingRequisitionDetailsDyeingServicesController = require("../../controllers/wd/wd-form-dyeing-requisition-details-dyeing-services");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// Update Queries
router.put(
  "/update-dyeing-services",
  middleWeres.checkAuth(),
  middleWeres.checkIdentity(usersType.ADMIN_STR),
  wdFormDyeingRequisitionDetailsDyeingServicesController.updateDyeingServcies
);

module.exports = router;