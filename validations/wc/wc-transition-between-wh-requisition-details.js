const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (wcTransitionBetweenWHRequisitionDetails) => {
    const wcTransitionBetweenWHRequisitionDetailsSchema = joi.object({
        id: validations.joiText(15, 30),
        personid: validations.joiText(1, 50),
        ipaddress: validations.joiText(3, 50),
        items: joi.array().items({
            fromWarehouseId: validations.joiText(15, 30),
            fabricId: validations.joiText(15, 30),
            consigmentManufacturingId: validations.joiNotRequiredText(0, 10000),
            newConsigmentManufacturingNumber: validations.joiNotRequiredText(0, 10000),
            fromConsigmentManufacturingId: validations.joiText(15, 30),
            fabricName: validations.joiNotRequiredText(0, 50),
            fabricCode: validations.joiNotRequiredText(0, 50),
            price: validations.joiText(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity: validations.joiText(1, 60),
            validQuantity: validations.joiNotRequiredText(0, 10000),
            document: validations.joiNotRequiredText(0, 50),
            statement: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = wcTransitionBetweenWHRequisitionDetailsSchema.validate(wcTransitionBetweenWHRequisitionDetails);

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

exports.isValidUpdate = (wcTransitionBetweenWHRequisitionDetails) => {
    const wcTransitionBetweenWHRequisitionDetailsSchema = joi.object({
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        price: validations.joiNumber(1, 60),
        priceDollar: validations.joiNotRequiredText(0, 50),
        quantity: validations.joiNumber(1, 60),
        document: validations.joiNotRequiredNumber(0, 50),
        statement: validations.joiNotRequiredText(0, 10000),
        personid: validations.joiText(1, 50),
        ipaddress: validations.joiText(3, 50),
    });
    const joiErrors = wcTransitionBetweenWHRequisitionDetailsSchema.validate(wcTransitionBetweenWHRequisitionDetails);

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