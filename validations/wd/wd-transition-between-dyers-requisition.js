const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (wdTransportBetweenDyers) => {
    const wdTransportBetweenDyersRequisition = joi.object({
        fromDyeingId: validations.joiText(15, 30),
        toDyeingId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            ordersRequisitionsId: validations.joiText(15, 30),
            fabricOrderId: validations.joiText(15, 30),
            fabricId: validations.joiText(15, 30),
            consigmentDyeingId:validations.joiText(1, 60),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity: validations.joiNumber(1, 60),
            document: validations.joiNotRequiredNumber(0, 50),
            statement: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = wdTransportBetweenDyersRequisition.validate(wdTransportBetweenDyers);

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