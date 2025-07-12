const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (waPurchaseOrder) => {
    const waPurchaseOrderSchema = joi.object({
        addType: validations.joiNotRequiredText(0, 1000),
        supplierId: validations.joiText(15, 30),
        orderId:joi.array(),
        // orderId: validations.joiNotRequiredText(0, 100000),
        orderName: validations.joiNotRequiredText(0, 100000),
        date: validations.joiText(5, 50),
        name: validations.joiText(1, 90),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            warehouseId: validations.joiText(15, 30),
            yarnId: validations.joiText(15, 30),
            yarnName: validations.joiNotRequiredText(0, 100000),
            yarnCode: validations.joiNotRequiredText(0, 100000),
            quantity: validations.joiText(1, 60),
            price: validations.joiNotRequiredNumber(0, 50),
            priceDollar: validations.joiNotRequiredNumber(0, 50),
            yarnLotCode: validations.joiText(1, 60),
            consigmentYarnNumber: validations.joiNotRequiredText(0, 60),
            note: validations.joiNotRequiredText(0, 100000),
        })
    });
    const joiErrors = waPurchaseOrderSchema.validate(waPurchaseOrder);

    try {
        if (joiErrors.error) {
            console.log(joiErrors.error.details);
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.log(joiErrors.error.details);
        return false;
    }
};