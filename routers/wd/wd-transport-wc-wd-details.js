const router = require("express").Router();
const wdTransportWcWdDetailsController = require("../../controllers/wd/wd-transport-wc-wd-details");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdTransportWcWdDetailsController.selectByRequisitionId);

// router.get("/select-with-fabric-manufactured/:id",
//     middleWeres.checkAuth(),
//     middleWeres.checkIdentity(usersType.ADMIN_STR),
//     middleWeres.checkInt(),
//     wdTransportWcWdDetailsController.selectWithFabricManufacturedByRequisitionId);

    // Post Queries
    router.post(
        "",
        middleWeres.checkAuth(),
        middleWeres.checkIdentity(usersType.ADMIN_STR),
        wdTransportWcWdDetailsController.create
    );

router.put(
    "/:id",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    middleWeres.checkInt(),
    wdTransportWcWdDetailsController.update
);

module.exports = router;