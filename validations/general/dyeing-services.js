const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (color) => {
  const colorSchema = joi.object({
    name: validations.joiText(2, 90),
    personid: validations.joiText(3, 50),
    ipaddress: validations.joiText(3, 50)
  });
  const joiErrors = colorSchema.validate(color);

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