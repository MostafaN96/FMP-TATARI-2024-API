const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (waPurchaseOrderDetails) => {
    const waPurchaseOrderDetailsSchema = joi.object({
        addType: validations.joiNotRequiredText(0, 1000),
        id: validations.joiText(15, 30),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            warehouseId: validations.joiText(15, 30),
            yarnId: validations.joiText(15, 30),
            yarnCode: validations.joiNotRequiredText(0, 100000),
            quantity: validations.joiText(1, 60),
            price: validations.joiNotRequiredNumber(0, 50),
            priceDollar: validations.joiNotRequiredNumber(0, 50),
            yarnLotCode: validations.joiText(1, 60),
            consigmentYarnNumber: validations.joiNotRequiredText(0, 60),
            note: validations.joiNotRequiredNumber(0, 50),
        })
    });
    const joiErrors = waPurchaseOrderDetailsSchema.validate(waPurchaseOrderDetails);

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

exports.isValidUpdate = (waPurchaseOrderDetails) => {
    const waPurchaseOrderDetailsSchema = joi.object({
        date: validations.joiText(5, 50),
        name: validations.joiText(1, 90),
        note: validations.joiNotRequiredText(0, 100000),
        quantity: validations.joiText(1, 60),
        price: validations.joiNotRequiredNumber(0, 50),
        priceDollar: validations.joiNotRequiredNumber(0, 50),
        note2: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
    });
    const joiErrors = waPurchaseOrderDetailsSchema.validate(waPurchaseOrderDetails);

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