const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (waExecuteOrderRequisition) => {
    const waExecuteOrderRequisitionSchema = joi.object({
        warehouseId: validations.joiText(15, 30),
        wcFabricOrderRequisitionId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(1, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            wcRequisitionDetailsId: validations.joiText(15, 30),
            wcFabricOrderRequisitionId: validations.joiText(15, 30),
            wcFabricOrderRequisitionDetailsId: validations.joiText(15, 30),
            fabricId: validations.joiText(15, 30),
            fromConsigmentManufacturingId: validations.joiText(15, 30),
            fromWarehouseId: validations.joiText(15, 30),
            wcId: validations.joiText(15, 30),
            typeOfRequisition:validations.joiNotRequiredText(0, 60),
            typeOfRequisitionTrans:validations.joiNotRequiredText(0, 60),
            fabricCode: validations.joiNotRequiredText(0, 60),
            fabricName: validations.joiNotRequiredText(0, 60),
            consigmentManufacturingNumber: validations.joiNotRequiredText(0, 60),
            newConsigmentManufacturingNumber: validations.joiText(1, 60),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity: validations.joiText(1, 60),
            validQuantity: validations.joiText(1, 60),
            note: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = waExecuteOrderRequisitionSchema.validate(waExecuteOrderRequisition);

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