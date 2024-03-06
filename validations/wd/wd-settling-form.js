const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (wdTransportWcWdRequisition) => {
    const wdTransportWcWdRequisitionSchema = joi.object({
        dyeingId: validations.joiText(15, 30),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items( {
            wdFormDyeingRequisitionDetailsId: validations.joiText(15, 30),
            wdFormDyeingOrderRequisitionDetailsId: validations.joiNotRequiredText(0, 30),
            quantity: validations.joiNumber(1, 60),
        })
    });
    const joiErrors = wdTransportWcWdRequisitionSchema.validate(wdTransportWcWdRequisition);

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