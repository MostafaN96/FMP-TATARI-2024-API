const router = require("express").Router();
const wbTransportWaWbDetailsController = require("../../controllers/wb/wb-transport-wa-wb-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wbTransportWaWbDetailsController.selectByRequisitionId);

router.get("/select-with-fabric-manufactured/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wbTransportWaWbDetailsController.selectWithFabricManufacturedByRequisitionId);

    // Post Queries
    router.post(
        "",
        middleWeres.checkAuth(),
        middleWeres.checkIdentity(usersType.ADMIN_STR),
        wbTransportWaWbDetailsController.create
    );

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wbTransportWaWbDetailsController.update
);

module.exports = router;