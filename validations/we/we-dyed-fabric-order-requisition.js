const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (weDyedFabricOrderRequisition) => {
    const weDyedFabricOrderRequisitionSchema = joi.object({
        sellerId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        name: validations.joiText(1, 90),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            dyedFabricId: validations.joiText(15, 30),
            dyedFabricCode: validations.joiNotRequiredText(0, 50),
            colorCategoryId: validations.joiText(15, 30),
            colorId: validations.joiText(15, 30),
            colorCode: validations.joiText(1, 90),
            wastRatio: validations.joiNotRequiredText(0, 90),
            quantity: validations.joiNumber(1, 60),
            fabricWidth: validations.joiNotRequiredText(0, 50),
            fabricQuantityM2: validations.joiNotRequiredText(0, 50),
            note: validations.joiNotRequiredText(0, 50),
        })
    });
    const joiErrors = weDyedFabricOrderRequisitionSchema.validate(weDyedFabricOrderRequisition);

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