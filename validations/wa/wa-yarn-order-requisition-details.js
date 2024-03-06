const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (waYarnOrderRequisitionDetails) => {
    const waYarnOrderRequisitionDetailsSchema = joi.object({
        id: validations.joiText(15, 30),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            yarnId: validations.joiText(15, 30),
            quantity: validations.joiNumber(1, 60),
            note: validations.joiNotRequiredNumber(0, 50),
        })
    });
    const joiErrors = waYarnOrderRequisitionDetailsSchema.validate(waYarnOrderRequisitionDetails);

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

exports.isValidUpdate = (waYarnOrderRequisitionDetails) => {
    const waYarnOrderRequisitionDetailsSchema = joi.object({
        sellerId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        name: validations.joiText(1, 90),
        note: validations.joiNotRequiredText(0, 100000),
        quantity: validations.joiNumber(1, 60),
        note2: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
    });
    const joiErrors = waYarnOrderRequisitionDetailsSchema.validate(waYarnOrderRequisitionDetails);

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