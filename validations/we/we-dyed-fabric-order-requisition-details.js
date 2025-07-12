const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (weDyedFabricOrderRequisitionDetails) => {
    const weDyedFabricOrderRequisitionDetailsSchema = joi.object({
        id: validations.joiText(15, 30),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items: joi.array().items({
            dyedFabricId: validations.joiText(15, 30),
            dyedFabricCode: validations.joiNotRequiredText(0, 50),
            colorCategoryId: validations.joiText(15, 30),
            colorId: validations.joiText(15, 30),
            colorCode: validations.joiText(1, 90),
            quantity: validations.joiNumber(1, 60),
            wasteRatio: validations.joiNotRequiredText(0, 90),
            fabricWidth: validations.joiNotRequiredNumber(0, 50),
            fabricQuantityM2: validations.joiNotRequiredNumber(0, 50),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            note: validations.joiNotRequiredText(0, 100000),
        })
    });
    const joiErrors = weDyedFabricOrderRequisitionDetailsSchema.validate(weDyedFabricOrderRequisitionDetails);

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

exports.isValidUpdate = (weDyedFabricOrderRequisitionDetails) => {
    const weDyedFabricOrderRequisitionDetailsSchema = joi.object({
        sellerId: validations.joiText(15, 30),
        sellerName: validations.joiText(1, 90),
        colorCategoryId: validations.joiText(15, 30),
        colorId: validations.joiText(15, 30),
        colorCode: validations.joiText(1, 90),
        colorName: validations.joiNotRequiredText(0, 10000),
        dyedFabricId: validations.joiText(15, 30),
        dyedFabricName: validations.joiText(1, 90),
        date: validations.joiText(5, 50),
        name: validations.joiText(1, 90),
        note: validations.joiNotRequiredText(0, 100000),
        quantity: validations.joiNumber(1, 60),
        wasteRatio: validations.joiNotRequiredText(0, 90),
        fabricWidth: validations.joiNotRequiredNumber(0, 50),
        fabricQuantityM2: validations.joiNotRequiredNumber(0, 50),
        price: validations.joiNumber(1, 60),
        priceDollar: validations.joiNotRequiredText(0, 50),
        detailsNote: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
    });
    const joiErrors = weDyedFabricOrderRequisitionDetailsSchema.validate(weDyedFabricOrderRequisitionDetails);

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