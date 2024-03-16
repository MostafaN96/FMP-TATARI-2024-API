const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (waExecuteOrderRequisitionDetails) => {
    const waExecuteOrderRequisitionDetailsSchema = joi.object({
        id: validations.joiText(15, 30),
        warehouseId: validations.joiText(15, 30),
        waYarnOrderRequisitionId: validations.joiText(15, 30),        
        personid: validations.joiText(1, 50),
        ipaddress: validations.joiText(3, 50),
        items: joi.array().items({
            waRequisitionDetailsId: validations.joiText(15, 30),
            waYarnOrderRequisitionId: validations.joiText(15, 30),
            waYarnOrderRequisitionDetailsId: validations.joiText(15, 30),
            yarnId: validations.joiText(15, 30),
            fromWarehouseId: validations.joiText(15, 30),
            fromConsigmentYarnId: validations.joiText(15, 30),
            yarnLotId: validations.joiText(15, 30),
            waId: validations.joiText(15, 30),
            typeOfRequisition: validations.joiNotRequiredText(0, 60),
            typeOfRequisitionTrans: validations.joiNotRequiredText(0, 60),
            yarnCode: validations.joiNotRequiredText(0, 60),
            yarnName: validations.joiNotRequiredText(0, 60),
            consigmentYarnNumber: validations.joiNotRequiredText(0, 60),
            newConsigmentYarnNumber: validations.joiText(1, 60),
            yarnLotCode: validations.joiNotRequiredText(0, 60),
            price: validations.joiNumber(1, 60),
            quantity: validations.joiText(1, 60),
            validQuantity: validations.joiText(1, 60),
            note: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = waExecuteOrderRequisitionDetailsSchema.validate(waExecuteOrderRequisitionDetails);

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

exports.isValidUpdate = (waExecuteOrderRequisitionDetails) => {
    const waExecuteOrderRequisitionDetailsSchema = joi.object({
        waYarnOrderRequisitionId: validations.joiText(15, 30),
        waYarnOrderRequisitionDetailsId: validations.joiText(15, 30),
        waId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        requisitionNote: validations.joiNotRequiredText(0, 100000),
        price: validations.joiNumber(1, 60),
        quantity: validations.joiNumber(1, 60),
        note: validations.joiNotRequiredText(0, 10000),
        personid: validations.joiText(1, 50),
        ipaddress: validations.joiText(3, 50),
    });
    const joiErrors = waExecuteOrderRequisitionDetailsSchema.validate(waExecuteOrderRequisitionDetails);

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