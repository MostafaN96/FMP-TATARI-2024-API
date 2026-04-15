const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (wdDyeingRequisition) => {
    const wdDyeingRequisitionSchema = joi.object({
        dyeingId: validations.joiText(15, 30),
        warehouseId: validations.joiText(15, 30),
        releaseProcess: validations.joiNotRequiredText(0, 30),
        isCalcDyeingNet: validations.joiBoolean,
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items({
            ordersRequisitionsId: validations.joiText(15, 30),
            fabricOrderId: validations.joiText(15, 30),
            fabricOrderName: validations.joiNotRequiredText(0, 10000),
            dyedFabricOrderRequisitionId: validations.joiNotRequiredText(0, 30),
            dyedFabricOrderId: validations.joiNotRequiredText(0, 30),
            wdFormDyeingOrderRequisitionDetailsId: validations.joiNotRequiredText(0, 30),
            wdFormRequisitionDetailsId: validations.joiText(15, 30),
            dyedFabricId: validations.joiText(15, 30),
            gradeItemId: validations.joiText(15, 30),
            dyeingFee:validations.joiText(1, 60),
            dyeingServices:joi.array(),
            price: validations.joiNumber(1, 60),
            costPrice: validations.joiNumber(1, 60),
            addedCost: validations.joiNotRequiredText(0, 60),
            quantity:validations.joiNumber(1, 60),
            dyeingQuantity:validations.joiNumber(1, 60),
            numberFabricPieces:validations.joiText(1, 60),
            fabricWidth:validations.joiText(1, 60),
            fabricQuantityM2:validations.joiText(1, 60),
            workOrderNumber: validations.joiText(1, 60),
            storagePlace:validations.joiNotRequiredText(0, 60),
            note1: validations.joiNotRequiredText(0, 10000),
            note2: validations.joiNotRequiredText(0, 10000),
            statement: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = wdDyeingRequisitionSchema.validate(wdDyeingRequisition);

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