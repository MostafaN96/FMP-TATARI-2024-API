const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (wdFormDyeingRequisition) => {
    const wdFormDyeingRequisitionSchema = joi.object({
        dyeingId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items({
            ordersRequisitionsId: validations.joiText(15, 30),
            fabricOrderId: validations.joiText(15, 30),
            fabricOrderName: validations.joiNotRequiredText(0, 10000),
            fabricId: validations.joiText(15, 30),
            consigmentDyeingId: validations.joiText(15, 30),
            dyedFabricId: validations.joiText(15, 30),
            dyeingColorsPricesId: validations.joiText(15, 30),
            dyeingServices:joi.array(),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity:validations.joiNumber(1, 60),
            fabricWidth:validations.joiText(1, 60),
            fabricQuantityM2:validations.joiText(1, 60),
            workOrderNumberDetails: validations.joiText(1, 60),
            document: validations.joiNotRequiredNumber(0, 50),
            statement: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = wdFormDyeingRequisitionSchema.validate(wdFormDyeingRequisition);

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

exports.isValidForOrder = (wdFormDyeingRequisition) => {
    const wdFormDyeingRequisitionSchema = joi.object({
        dyeingId: validations.joiText(15, 30),
        sellerId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items({
            fabricId: validations.joiText(15, 30),
            wdFormDyeingOrderRequisitionDetailsId: validations.joiText(15, 30),
            consigmentDyeingId: validations.joiText(15, 30),
            dyedFabricId: validations.joiText(15, 30),
            dyeingColorsPricesId: validations.joiText(15, 30),
            dyeingServices:joi.array(),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity:validations.joiNumber(1, 60),
            fabricWidth:validations.joiText(1, 60),
            fabricQuantityM2:validations.joiText(1, 60),
            document: validations.joiNotRequiredNumber(0, 50),
            statement: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = wdFormDyeingRequisitionSchema.validate(wdFormDyeingRequisition);

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
