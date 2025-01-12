const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (wbTransportWaWbRequisition) => {
    const wbTransportWaWbRequisitionSchema = joi.object({
        warehouseId: validations.joiText(15, 30),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            ordersRequisitionsId: validations.joiText(15, 30),
            yarnOrderId: validations.joiText(15, 30),
            yarnId: validations.joiText(15, 30),
            industryId: validations.joiText(15, 30),
            fabricToBeManufacturedId: validations.joiText(15, 30),
            yarnLotId: validations.joiText(15, 30),
            consigmentYarnId: validations.joiNotRequiredText(0, 60),
            consigmentYarnNumber: validations.joiText(1, 60),
            fromConsigmentYarnId: validations.joiText(15, 30),
            price: validations.joiNotRequiredNumber(0, 50),
            priceDollar: validations.joiNotRequiredText(0, 50),
            quantity: validations.joiNumber(1, 60),
            document: validations.joiNotRequiredNumber(0, 50),
            statement: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = wbTransportWaWbRequisitionSchema.validate(wbTransportWaWbRequisition);

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