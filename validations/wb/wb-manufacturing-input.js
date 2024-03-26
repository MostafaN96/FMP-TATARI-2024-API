const joi = require("joi");
const validations = require("../../helpers/validations");

exports.isValid = (wbManufacturingInput) => {
    const wbManufacturingInputSchema = joi.object({
        id: validations.joiText(15, 30),
        wbManufacturingOutputId: validations.joiText(15, 30),
        industryId: validations.joiText(15, 30),
        fabricId: validations.joiText(15, 30),
        isOrder: validations.joiBoolean,
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items({
            yarnId: validations.joiText(15, 30),
            yarnLotId: validations.joiText(15, 30),
            consigmentYarnId: validations.joiText(15, 30),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            wastRatio: validations.joiNumberStartByZero(1, 60),
            quantity:validations.joiNumber(1, 60),
            quantityWithWaste:validations.joiNumber(1, 60),
            statement: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = wbManufacturingInputSchema.validate(wbManufacturingInput);

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

exports.isValidUpdate = (wbManufacturingInput) => {
    const wbManufacturingInputSchema = joi.object({
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        yarnId: validations.joiText(15, 30),
        yarnLotId: validations.joiText(15, 30),
        price: validations.joiNumber(1, 60),
        priceDollar: validations.joiNotRequiredText(0, 50),
        wastRatio: validations.joiNumberStartByZero(1, 60),
        quantity:validations.joiNumber(1, 60),
        quantityWithWaste:validations.joiNumber(1, 60),
        statement: validations.joiNotRequiredText(0, 10000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
    });
    const joiErrors = wbManufacturingInputSchema.validate(wbManufacturingInput);

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