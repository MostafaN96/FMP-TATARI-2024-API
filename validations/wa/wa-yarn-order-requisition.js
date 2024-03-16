const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (waYarnOrderRequisition) => {
    const waYarnOrderRequisitionSchema = joi.object({
        sellerId: validations.joiText(15, 30),
        orderId: validations.joiText(15, 30),
        orderName: validations.joiNotRequiredText(0, 100000),
        date: validations.joiText(5, 50),
        name: validations.joiText(1, 90),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            yarnId: validations.joiText(15, 30),
            yarnName: validations.joiNotRequiredText(0, 100000),
            quantity: validations.joiText(1, 60),
            note: validations.joiNotRequiredNumber(0, 50),
        })
    });
    const joiErrors = waYarnOrderRequisitionSchema.validate(waYarnOrderRequisition);

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