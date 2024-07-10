const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValidUpdate = (wbManufacturingOutput) => {
    const wbManufacturingOutputSchema = joi.object({
        circularKnittingMachineId: validations.joiNotRequiredText(0, 100),
        circularKnittingMachineName: validations.joiNotRequiredText(0, 100),
        price: validations.joiNumber(1, 60),
        priceDollar: validations.joiNotRequiredText(0, 50),
        quantity:validations.joiNumber(1, 60),
        manufacturingFee:validations.joiText(1, 60),
        manufacturingFeeDollar:validations.joiText(1, 60),
        numberFabricPieces:validations.joiText(1, 60),
        document: validations.joiNotRequiredText(0, 10000),
        statement: validations.joiNotRequiredText(0, 10000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
    });
    const joiErrors = wbManufacturingOutputSchema.validate(wbManufacturingOutput);

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

exports.isValidConfirmReceived = (wbManufacturingOutput) => {
    const wbManufacturingOutputSchema = joi.object({
        isApproved: validations.joiBoolean,
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
    });
    const joiErrors = wbManufacturingOutputSchema.validate(wbManufacturingOutput);

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