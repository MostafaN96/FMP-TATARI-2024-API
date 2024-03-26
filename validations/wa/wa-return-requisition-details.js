const joi = require("joi");
const validations = require("../../helpers/validations");

exports.isValid = (waReturnRequisition) => {
    const waReturnRequisitionSchema = joi.object({
        id: validations.joiText(15, 30),
        warehouseId: validations.joiText(15, 30),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items: joi.array().items({
            yarnId: validations.joiText(15, 30),
            yarnLotId: validations.joiText(15, 30),
            consigmentYarnId: validations.joiText(15, 30),
            price: validations.joiNotRequiredNumber(0, 50),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity: validations.joiNumber(1, 60),
            statement: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = waReturnRequisitionSchema.validate(waReturnRequisition);

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

exports.isValidUpdate = (waReturnRequisition) => {
    const waReturnRequisitionSchema = joi.object({
        waReturnRequisitionId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        price: validations.joiNotRequiredNumber(0, 50),
        priceDollar: validations.joiNotRequiredText(0, 50),
        quantity: validations.joiNumber(1, 60),
        statement: validations.joiNotRequiredText(0, 10000),
        personid: validations.joiText(1, 90),
        ipaddress: validations.joiText(1, 90)
    });
    const joiErrors = waReturnRequisitionSchema.validate(waReturnRequisition);

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