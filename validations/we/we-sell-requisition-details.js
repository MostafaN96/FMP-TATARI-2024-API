const joi = require("joi");
const validations = require("../../helpers/validations");

exports.isValid = (wcSellRequisition) => {
    const wcSellRequisitionSchema = joi.object({
        id: validations.joiText(15, 30),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items: joi.array().items({
            ordersRequisitionsId: validations.joiText(15, 30),
            dyedFabricOrderId: validations.joiText(15, 30),
            dyedFabricOrderName: validations.joiNotRequiredText(0, 10000),
            weId: validations.joiText(15, 30),
            dyedFabricId: validations.joiText(15, 30),
            colorId: validations.joiText(15, 30),
            warehouseId: validations.joiText(15, 30),
            gradeItemName:validations.joiNotRequiredText(0, 60),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity: validations.joiNumber(1, 60),
            numberFabricPieces: validations.joiNumber(1, 60),
            document: validations.joiNotRequiredNumber(0, 50),
            statement: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = wcSellRequisitionSchema.validate(wcSellRequisition);

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

exports.isValidUpdate = (wcSellRequisition) => {
    const wcSellRequisitionSchema = joi.object({
        weSellRequisitionId: validations.joiText(15, 30),
        deliveryCarId: validations.joiNotRequiredText(0, 10000),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        price: validations.joiNumber(1, 60),
        priceDollar: validations.joiNotRequiredText(0, 50),
        quantity: validations.joiNumber(1, 60),
        numberFabricPieces: validations.joiNumber(1, 60),
        document: validations.joiNotRequiredNumber(0, 50),
        statement: validations.joiNotRequiredText(0, 10000),
        personid: validations.joiText(1, 90),
        ipaddress: validations.joiText(1, 90)
    });
    const joiErrors = wcSellRequisitionSchema.validate(wcSellRequisition);

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
