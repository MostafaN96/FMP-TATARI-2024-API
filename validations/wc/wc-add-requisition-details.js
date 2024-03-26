const joi = require("joi");
const validations = require("../../helpers/validations");

exports.isValid = (waAddRequisition) => {
    const waAddRequisitionSchema = joi.object({
        id: validations.joiText(15, 30),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items: joi.array().items({
            fabricId: validations.joiText(15, 30),
            warehouseId: validations.joiText(15, 30),
            consigmentManufacturingId: validations.joiNotRequiredText(0, 30),
            isNewConsigment: validations.joiBoolean,
            consigmentNumber:validations.joiNotRequiredText(0, 60),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity: validations.joiNumber(1, 60),
            document: validations.joiNotRequiredNumber(0, 50),
            statement: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = waAddRequisitionSchema.validate(waAddRequisition);

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

exports.isValidUpdate = (waAddRequisition) => {
    const waAddRequisitionSchema = joi.object({
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        price: validations.joiNumber(1, 60),
        priceDollar: validations.joiNotRequiredText(0, 50),
        quantity: validations.joiNumber(1, 60),
        document: validations.joiNotRequiredNumber(0, 50),
        statement: validations.joiNotRequiredText(0, 10000),
    });
    const joiErrors = waAddRequisitionSchema.validate(waAddRequisition);

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