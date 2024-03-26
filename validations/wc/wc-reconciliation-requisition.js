const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (wcReconciliationRequisition) => {
    const wcReconciliationRequisitionSchema = joi.object({
        warehouseId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            fabricId: validations.joiText(15, 30),
            consigmentManufacturingId: validations.joiText(15, 30),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity: validations.joiNumber(1, 60),
            statement: validations.joiNotRequiredText(0, 10000),
            inputOutput: validations.joiNumberStartByZero(1, 60),
        })
    });
    const joiErrors = wcReconciliationRequisitionSchema.validate(wcReconciliationRequisition);

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