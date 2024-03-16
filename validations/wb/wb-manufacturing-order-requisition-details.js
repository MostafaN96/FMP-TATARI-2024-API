const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (wbManufacturingOrderRequisitionDetails) => {
    const wbManufacturingOrderRequisitionDetailsSchema = joi.object({
        id: validations.joiText(15, 30),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            fabricId: validations.joiText(15, 30),
            fabricName: validations.joiNotRequiredText(0, 100000),
            quantity: validations.joiText(1, 60),
            note: validations.joiNotRequiredNumber(0, 50),
        })
    });
    const joiErrors = wbManufacturingOrderRequisitionDetailsSchema.validate(wbManufacturingOrderRequisitionDetails);

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

exports.isValidUpdate = (wbManufacturingOrderRequisitionDetails) => {
    const wbManufacturingOrderRequisitionDetailsSchema = joi.object({
        sellerId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        name: validations.joiText(1, 90),
        note: validations.joiNotRequiredText(0, 100000),
        quantity: validations.joiText(1, 60),
        note2: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
    });
    const joiErrors = wbManufacturingOrderRequisitionDetailsSchema.validate(wbManufacturingOrderRequisitionDetails);

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