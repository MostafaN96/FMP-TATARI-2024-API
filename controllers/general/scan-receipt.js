const scanReceiptService = require('../../services/general/scan-receipt');
const constants = require('../../util/constants');

exports.scanReceipt = async (request, response) => {
    const { image, mimeType } = request.body;

    if (!image) {
        return response.status(400).json({
            ...constants.invalidDataResponse,
            message: 'يجب إرسال الصورة بتنسيق base64'
        });
    }

    try {
        const data = await scanReceiptService.scanReceipt(image, mimeType);
        return response.status(200).json({ status: 1, data });
    } catch (error) {
        console.error('❌ Error in scanReceipt:', error);
        return response.status(500).json({
            status: 0,
            message: 'فشل في قراءة الإيصال، تأكد من وضوح الصورة'
        });
    }
};

exports.enrichScanData = async (request, response) => {
    const { manufacturerName, fabricName, orderNumber } = request.body;

    try {
        const data = await scanReceiptService.enrichScanData({ manufacturerName, fabricName, orderNumber });
        return response.status(200).json({ status: 1, data });
    } catch (error) {
        console.error('❌ Error in enrichScanData:', error);
        return response.status(500).json({ status: 0, message: 'فشل في البحث في قاعدة البيانات' });
    }
};
