const router = require("express").Router();
const wbTransportRequisitionWbWaDetailsController = require("../../controllers/wb/wb-transport-requisition-wb-wa-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wbTransportRequisitionWbWaDetailsController.selectByRequisitionId);

router.get("/select-with-fabric-manufactured/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wbTransportRequisitionWbWaDetailsController.selectWithFabricManufacturedByRequisitionId);

// Post Queries
router.post(
    "",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wbTransportRequisitionWbWaDetailsController.create
);

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wbTransportRequisitionWbWaDetailsController.update
);

module.exports = router;