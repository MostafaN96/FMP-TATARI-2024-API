const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (weReturnSellRequisition) => {
    const weReturnSellRequisitionSchema = joi.object({
        sellerId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            weSellRequisitionDetailsId: validations.joiText(15, 30),
            dyedFabricId: validations.joiText(15, 30),
            warehouseId: validations.joiText(15, 30),
            price: validations.joiNumber(1, 60),
            quantity: validations.joiNumber(1, 60),
            numberFabricPieces: validations.joiNumber(1, 60),
            workOrderNumber:validations.joiNotRequiredText(0, 60),
            statement: validations.joiNotRequiredText(0, 10000),
            isDefect: validations.joiBoolean,
        })
    });
    const joiErrors = weReturnSellRequisitionSchema.validate(weReturnSellRequisition);

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