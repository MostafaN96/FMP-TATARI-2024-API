const joi = require("joi");
const validations = require("../../helpers/validations");

exports.isValid = (waReconciliationRequisition) => {
    const waReconciliationRequisitionSchema = joi.object({
        id: validations.joiText(15, 30),
        industryId: validations.joiText(15, 30),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            yarnId: validations.joiText(15, 30),
            yarnLotId: validations.joiText(15, 30),
            consigmentYarnId: validations.joiText(15, 30),
            fabricToBeManufacturedId: validations.joiNotRequiredText(15, 30),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity: validations.joiNumber(1, 60),
            statement: validations.joiNotRequiredText(0, 10000),
            inputOutput: validations.joiNumberStartByZero(1, 60),
        })
    });
    const joiErrors = waReconciliationRequisitionSchema.validate(waReconciliationRequisition);

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

exports.isValidUpdate = (waReconciliationRequisition) => {
    const waReconciliationRequisitionSchema = joi.object({
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        price: validations.joiNumber(1, 60),
        priceDollar: validations.joiNotRequiredText(0, 50),
        quantity: validations.joiNumber(1, 60),
        statement: validations.joiNotRequiredText(0, 10000),
        inputOutput: validations.joiNumberStartByZero(1, 60),
        personid: validations.joiText(1, 90),
        ipaddress: validations.joiText(1, 90)
    });
    const joiErrors = waReconciliationRequisitionSchema.validate(waReconciliationRequisition);

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