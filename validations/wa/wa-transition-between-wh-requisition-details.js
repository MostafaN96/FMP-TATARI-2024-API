const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (weTransitionBetweenWHRequisitionDetails) => {
    const weTransitionBetweenWHRequisitionDetailsSchema = joi.object({
        id: validations.joiText(15, 30),
        personid: validations.joiText(1, 50),
        ipaddress: validations.joiText(3, 50),
        items: joi.array().items({
            fromWarehouseId: validations.joiText(15, 30),
            yarnId: validations.joiText(15, 30),
            consigmentYarnId: validations.joiNotRequiredText(0, 10000),
            newConsigmentYarnNumber: validations.joiNotRequiredText(0, 10000),
            fromConsigmentYarnId: validations.joiText(15, 30),
            yarnLotId: validations.joiText(15, 30),
            yarnName: validations.joiNotRequiredText(0, 50),
            yarnCode: validations.joiNotRequiredText(0, 50),
            price: validations.joiText(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity: validations.joiText(1, 60),
            validQuantity: validations.joiNotRequiredText(0, 10000),
            document: validations.joiNotRequiredText(0, 50),
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