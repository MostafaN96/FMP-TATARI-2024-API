const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (wcFabricOrderRequisitionDetails) => {
    const wcFabricOrderRequisitionDetailsSchema = joi.object({
        id: validations.joiText(15, 30),
        ordersRequisitionsId: validations.joiText(15, 30),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items: joi.array().items({
            fabricId: validations.joiText(15, 30),
            fabricCode: validations.joiNotRequiredText(0, 100000),
            fabricWidth: validations.joiNotRequiredText(0, 100000),
            fabricQuantityM2: validations.joiNotRequiredText(0, 100000),
            quantity: validations.joiText(1, 60),
            note: validations.joiNotRequiredText(0, 90),
        })
    });
    const joiErrors = wcFabricOrderRequisitionDetailsSchema.validate(wcFabricOrderRequisitionDetails);

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

exports.isValidUpdate = (wcFabricOrderRequisitionDetails) => {
    const wcFabricOrderRequisitionDetailsSchema = joi.object({
        sellerId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        name: validations.joiText(1, 90),
        note: validations.joiNotRequiredText(0, 100000),
        quantity: validations.joiText(1, 60),
        fabricWidth: validations.joiNotRequiredText(0, 100000),
        fabricQuantityM2: validations.joiNotRequiredText(0, 100000),
        note2: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
    });
    const joiErrors = wcFabricOrderRequisitionDetailsSchema.validate(wcFabricOrderRequisitionDetails);

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