const joi = require("joi");
const validations = require("../../helpers/validations");

exports.isValid = (weReconciliationRequisition) => {
    const weReconciliationRequisitionSchema = joi.object({
        id: validations.joiText(15, 30),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items: joi.array().items({
            weId: validations.joiText(15, 30),
            dyedFabricId: validations.joiText(15, 30),
            warehouseId: validations.joiText(15, 30),
            colorCategoryId: validations.joiText(15, 30),
            colorId: validations.joiText(15, 30),
            gradeItemId: validations.joiText(15, 30),
            colorCode: validations.joiNumber(1, 60),
            consigmentDyeingNumber: validations.joiNotRequiredText(0, 60),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity: validations.joiNumber(1, 60),
            numberFabricPieces: validations.joiNumber(1, 60),
            workOrderNumber: validations.joiText(1, 60),
            statement: validations.joiNotRequiredText(0, 10000),
            inputOutput: validations.joiNumberStartByZero(1, 60),
        })
    });
    const joiErrors = weReconciliationRequisitionSchema.validate(weReconciliationRequisition);

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

exports.isValidUpdate = (weReconciliationRequisition) => {
    const weReconciliationRequisitionSchema = joi.object({
        colorCategoryId: validations.joiText(15, 30),
        colorId: validations.joiText(15, 30),
        colorCode: validations.joiNumber(1, 60),
        numberFabricPieces: validations.joiNumber(1, 60),
        workOrderNumber:validations.joiNotRequiredText(0, 60),
        storagePlace:validations.joiNotRequiredText(0, 60),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        price: validations.joiNumber(1, 60),
        priceDollar: validations.joiNotRequiredText(0, 50),
        quantity: validations.joiNumber(1, 60),
        statement: validations.joiNotRequiredText(0, 10000),
        inputOutput: validations.joiNumberStartByZero(1, 60),
        personid: validations.joiText(1, 90),
        ipaddress: validations.joiText(1, 90)
    });
    const joiErrors = weReconciliationRequisitionSchema.validate(weReconciliationRequisition);

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