const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (deliveryCar) => {
  const deliveryCarSchema = joi.object({
    model: validations.joiText(2, 90),
    plateNumber: validations.joiText(3, 15),
    driversName: validations.joiText(3, 90),
    phone: validations.joiNotRequiredText(0, 45),
    nationalId: validations.joiNotRequiredText(0, 30),
    personid: validations.joiText(3, 50),
    ipaddress: validations.joiText(3, 50)
  });
  const joiErrors = deliveryCarSchema.validate(deliveryCar);

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