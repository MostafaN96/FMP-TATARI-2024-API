const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (consigmentDyeing) => {
  const consigmentDyeingSchema = joi.object({
    number: validations.joiText(2, 90),
    personid: validations.joiText(3, 50),
    ipaddress: validations.joiText(3, 50)
  });
  const joiErrors = consigmentDyeingSchema.validate(consigmentDyeing);

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