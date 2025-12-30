const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (weAddRequisition) => {
    const weAddRequisitionSchema = joi.object({
        supplierId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        workOrderNumber:validations.joiNotRequiredText(0, 60),
        orderId:joi.array(),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            warehouseId: validations.joiText(15, 30),
            dyedFabricId: validations.joiText(15, 30),
            colorCategoryId: validations.joiText(15, 30),
            colorId: validations.joiText(15, 30),
            colorCode: validations.joiText(1, 60),
            consigmentDyeingNumber: validations.joiNumber(1, 60),
            gradeItemId: validations.joiText(15, 30),
            dyeingCode: validations.joiNotRequiredText(0, 60),
            numberFabricPieces: validations.joiNumber(1, 60),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity: validations.joiNumber(1, 60),
            workOrderNumber:validations.joiNotRequiredText(0, 60),
            storagePlace:validations.joiNotRequiredText(0, 60),
            document: validations.joiNotRequiredNumber(0, 50),
            statement: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = weAddRequisitionSchema.validate(weAddRequisition);

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