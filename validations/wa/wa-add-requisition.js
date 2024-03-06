const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (waAddRequisition) => {
    const waAddRequisitionSchema = joi.object({
        supplierId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            yarnId: validations.joiText(15, 30),
            warehouseId: validations.joiText(15, 30),
            yarnLotId: validations.joiText(15, 30),
            consigmentYarnNumber: validations.joiText(1, 60),
            price: validations.joiNotRequiredNumber(0, 50),
            quantity: validations.joiNumber(1, 60),
            document: validations.joiNotRequiredNumber(0, 50),
            statement: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = waAddRequisitionSchema.validate(waAddRequisition);

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

exports.isValidOrder = (waAddRequisition) => {
    const waAddRequisitionSchema = joi.object({
        supplierId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            yarnId: validations.joiText(15, 30),
            warehouseId: validations.joiText(15, 30),
            yarnLotId: validations.joiText(15, 30),
            consigmentYarnNumber: validations.joiText(1, 60),
            price: validations.joiNotRequiredNumber(0, 50),
            quantity: validations.joiNumber(1, 60),
            document: validations.joiNotRequiredNumber(0, 50),
            statement: validations.joiNotRequiredText(0, 10000),
        }),
        itemsOrder:joi.array().items({
            yarnOrderRequisitionId: validations.joiText(15, 30),
            yarnOrderRequisitionDetailsId: validations.joiText(15, 30),
            neededQuantity:validations.joiNumber(1, 60),
            currentQuantity:validations.joiNumber(1, 60),
            quantity:validations.joiNumber(1, 60),
        })
    });
    const joiErrors = waAddRequisitionSchema.validate(waAddRequisition);

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