const joi = require("joi");
const validations = require("../../helpers/validations");

exports.isValid = (wdReconciliationRequisition) => {
    const wdReconciliationRequisitionSchema = joi.object({
        id: validations.joiText(15, 30),
        dyeingId: validations.joiText(15, 30),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            fabricId: validations.joiText(15, 30),
            consigmentDyeingId: validations.joiText(15, 30),
            price: validations.joiNumber(1, 60),
            quantity: validations.joiNumber(1, 60),
            statement: validations.joiNotRequiredText(0, 10000),
            inputOutput: validations.joiNumberStartByZero(1, 60),
        })
    });
    const joiErrors = wdReconciliationRequisitionSchema.validate(wdReconciliationRequisition);

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

exports.isValidUpdate = (wdReconciliationRequisition) => {
    const wdReconciliationRequisitionSchema = joi.object({
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        price: validations.joiNumber(1, 60),
        quantity: validations.joiNumber(1, 60),
        statement: validations.joiNotRequiredText(0, 10000),
        inputOutput: validations.joiNumberStartByZero(1, 60),
        personid: validations.joiText(1, 90),
        ipaddress: validations.joiText(1, 90)
    });
    const joiErrors = wdReconciliationRequisitionSchema.validate(wdReconciliationRequisition);

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