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
            yarnLotCode: validations.joiText(1, 60),
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
        orderId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            warehouseId: validations.joiText(15, 30),
            orderDetailsId: validations.joiText(15, 30),
            yarnId: validations.joiText(15, 30),
            yarnCode: validations.joiNotRequiredText(0, 60),
            yarnName: validations.joiNotRequiredText(0, 60),
            yarnLotCode: validations.joiText(1, 60),
            consigmentYarnNumber: validations.joiText(1, 60),
            price: validations.joiNotRequiredNumber(0, 50),
            quantity: validations.joiNumber(1, 60),
            neededQuantity: validations.joiNotRequiredText(0, 50),
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