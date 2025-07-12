const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (weTransitionBetweenWHRequisitionDetails) => {
    const weTransitionBetweenWHRequisitionDetailsSchema = joi.object({
        id: validations.joiText(15, 30),
        fabricOrderId: validations.joiText(15, 30),
        ordersRequisitionsId: validations.joiText(15, 30),
        personid: validations.joiText(1, 50),
        ipaddress: validations.joiText(3, 50),
        items: joi.array().items({
            fromOrdersRequisitionsId: validations.joiText(15, 30),
            fromDyedFabricOrderId: validations.joiText(15, 30),
            fromDyedFabricOrderName: validations.joiNotRequiredText(0, 10000),
            warehouseId: validations.joiText(15, 30),
            weId: validations.joiText(15, 30),
            warehouseName: validations.joiNotRequiredText(0, 10000),
            dyedFabricId: validations.joiText(15, 30),
            dyedFabricName: validations.joiNotRequiredText(0, 1000),
            dyedFabricCode: validations.joiNotRequiredText(0, 1000),
            colorCategoryId: validations.joiText(15, 30),
            colorCategoryName: validations.joiNotRequiredText(0, 1000),
            colorId: validations.joiText(15, 30),
            colorName: validations.joiNotRequiredText(0, 60),
            colorCode: validations.joiNotRequiredText(0, 60),
            gradeItemId: validations.joiText(15, 30),
            gradeItemName: validations.joiNotRequiredText(0, 60),
            consigmentDyeingId: validations.joiNotRequiredText(0, 30),
            newConsigmentDyeingNumber: validations.joiText(1, 60),
            fromConsigmentDyeingId: validations.joiText(15, 30),
            fromConsigmentDyeingNumber: validations.joiNotRequiredText(0, 60),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity: validations.joiNumber(1, 60),
            validQuantity: validations.joiNotRequiredText(0, 1000),
            numberFabricPieces: validations.joiNumber(1, 60),
            workOrderNumber: validations.joiNotRequiredText(0, 60),
            document: validations.joiNotRequiredNumber(0, 50),
            statement: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = weTransitionBetweenWHRequisitionDetailsSchema.validate(weTransitionBetweenWHRequisitionDetails);

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

exports.isValidUpdate = (weTransitionBetweenWHRequisitionDetails) => {
    const weTransitionBetweenWHRequisitionDetailsSchema = joi.object({
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        price: validations.joiNumber(1, 60),
        priceDollar: validations.joiNotRequiredText(0, 50),
        quantity: validations.joiNumber(1, 60),
        numberFabricPieces: validations.joiNumber(1, 60),
        document: validations.joiNotRequiredNumber(0, 50),
        statement: validations.joiNotRequiredText(0, 10000),
        personid: validations.joiText(1, 50),
        ipaddress: validations.joiText(3, 50),
    });
    const joiErrors = weTransitionBetweenWHRequisitionDetailsSchema.validate(weTransitionBetweenWHRequisitionDetails);

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