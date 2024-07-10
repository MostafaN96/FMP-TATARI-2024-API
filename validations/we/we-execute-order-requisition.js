const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (weExecuteOrderRequisition) => {
    const weExecuteOrderRequisitionSchema = joi.object({
        warehouseId: validations.joiText(15, 30),
        weDyedFabricOrderRequisitionId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(1, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            weRequisitionDetailsId: validations.joiText(15, 30),
            weDyedFabricOrderRequisitionId: validations.joiText(15, 30),
            weDyedFabricOrderRequisitionDetailsId: validations.joiText(15, 30),
            dyedFabricId: validations.joiText(15, 30),
            fromWarehouseId: validations.joiText(15, 30),
            fromConsigmentDyeingId: validations.joiText(15, 30),
            weId: validations.joiText(15, 30),
            typeOfRequisition: validations.joiNotRequiredText(0, 60),
            typeOfRequisitionTrans: validations.joiNotRequiredText(0, 60),
            dyedFabricCode: validations.joiNotRequiredText(0, 60),
            dyedFabricName: validations.joiNotRequiredText(0, 60),
            consigmentDyeingNumber: validations.joiNotRequiredText(0, 60),
            newConsigmentDyeingNumber: validations.joiText(1, 60),
            colorCategoryId: validations.joiText(15, 30),
            colorCategoryName: validations.joiNotRequiredText(0, 60),
            colorId: validations.joiText(15, 30),
            colorName: validations.joiNotRequiredText(0, 60),
            colorCode: validations.joiText(1, 60),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity: validations.joiText(1, 60),
            validQuantity: validations.joiText(1, 60),
            numberFabricPieces:validations.joiText(1, 60),
            note: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = weExecuteOrderRequisitionSchema.validate(weExecuteOrderRequisition);
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