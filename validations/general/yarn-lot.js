const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (cotton) => {
  const cottonSchema = joi.object({
    yarn_id: validations.joiText(15, 30),
    code: validations.joiText(1, 1000),
    creator_id: validations.joiText(1, 90),
    ip_address: validations.joiText(1, 90)
  });
  const joiErrors = cottonSchema.validate(cotton);

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

exports.isValidUpdate = (cotton) => {
  const cottonSchema = joi.object({
    code: validations.joiText(3, 1000),
    personid: validations.joiText(1, 90),
    ipaddress: validations.joiText(1, 90)
  });
  const joiErrors = cottonSchema.validate(cotton);

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