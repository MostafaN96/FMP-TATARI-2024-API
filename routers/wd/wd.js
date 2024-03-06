const router = require("express").Router();
const wdController = require("../../controllers/wd/wd");

// MiddleWares
const middleWeres = require("../../middlewares/middlewares");

// Utils
const usersType = require("../../util/user-types");

// get Queries
router.get("/select-consigment-dyeing-by-fabric-by-dyeing/:fabricId/:dyeingId",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wdController.selectConsigmentDyeingQuantityByFabricByDyeingWd);


router.get("/select-by-dyeing/:dyeingId",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wdController.selectQuantityByDyeingWd);

router.get("/select-by-dyeing-group-by-fabric/:dyeingId",
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    wdController.selectQuantityByDyeingGroupByFabricWd);

module.exports = router;