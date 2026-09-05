const router = require('express').Router();
const scanReceiptController = require('../../controllers/general/scan-receipt');
const middleWeres = require('../../middlewares/middlewares');
const usersType = require('../../util/user-types');

router.post(
    '/',
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    scanReceiptController.scanReceipt
);

router.post(
    '/enrich',
    middleWeres.checkAuth(),
    middleWeres.checkIdentity(usersType.ADMIN_STR),
    scanReceiptController.enrichScanData
);

module.exports = router;
