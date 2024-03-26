const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (weTransitionBetweenWHRequisitionDetails) => {
    const weTransitionBetweenWHRequisitionDetailsSchema = joi.object({
        id: validations.joiText(15, 30),
        personid: validations.joiText(1, 50),
        ipaddress: validations.joiText(3, 50),
        items: joi.array().items({
            warehouseId: validations.joiText(15, 30),
            weId: validations.joiText(15, 30),
            dyedFabricId: validations.joiText(15, 30),
            colorCategoryId: validations.joiText(15, 30),
            colorId: validations.joiText(15, 30),
            colorName: validations.joiNotRequiredText(0, 60),
            colorCode: validations.joiNotRequiredNumber(0, 60),
            fromConsigmentDyeingId: validations.joiText(15, 30),
            fromConsigmentDyeingNumber: validations.joiNotRequiredText(0, 60),
            consigmentDyeingId: validations.joiNotRequiredText(0, 30),
            consigmentDyeingNumber: validations.joiNotRequiredText(0, 60),
            newConsigmentDyeingNumber: validations.joiText(1, 60),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity: validations.joiNumber(1, 60),
            numberFabricPieces: validations.joiNumber(1, 60),
            workOrderNumber:validations.joiNotRequiredText(0, 60),
            document: validations.joiNotRequiredNumber(0, 50),
            statement: validations.joiNotRequiredText(0, 10000),
            index: validations.joiNotRequiredText(0, 1000),
            warehouseName: validations.joiNotRequiredText(0, 1000),
            dyedFabricName: validations.joiNotRequiredText(0, 1000),
            dyedFabricCode: validations.joiNotRequiredText(0, 1000),
            colorName: validations.joiNotRequiredText(0, 1000),
            validQuantity: validations.joiNotRequiredText(0, 1000),
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
        colorCode: validations.joiNumber(1, 60),
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