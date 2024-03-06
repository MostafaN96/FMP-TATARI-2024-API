const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (weSellRequisition) => {
    const weSellRequisitionSchema = joi.object({
        sellerId: validations.joiText(15, 30),
        deliveryCarId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            dyedFabricId: validations.joiText(15, 30),
            warehouseId: validations.joiText(15, 30),
            colorCategoryId: validations.joiText(15, 30),
            colorId: validations.joiText(15, 30),
            colorCode: validations.joiNumber(1, 60),
            quantity: validations.joiNumber(1, 60),
            numberFabricPieces: validations.joiNumber(1, 60),
            workOrderNumber:validations.joiNotRequiredText(0, 60),
            document: validations.joiNotRequiredNumber(0, 50),
            statement: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = weSellRequisitionSchema.validate(weSellRequisition);

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