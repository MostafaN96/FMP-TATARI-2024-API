const joi = require("joi");
const validations = require("../../helpers/validations");

exports.isValidUpdateFabricToBeManufactured = (wb) => {
    const wbSchema = joi.object({
        industryId: validations.joiText(15, 30),
        yarnId: validations.joiText(15, 30),
        yarnLotId: validations.joiText(15, 30),
        consigmentYarnId: validations.joiText(15, 30),
        fabricToBeManufacturedId: validations.joiText(15, 30),
        quantity:validations.joiNumber(1, 60),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
    });
    const joiErrors = wbSchema.validate(wb);

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