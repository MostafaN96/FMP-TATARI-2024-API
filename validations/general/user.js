const joi = require("joi");
const validations = require("../../helpers/validations");

exports.isValidLogin = (user) => {
  const userSchema = joi.object({
    email: validations.joiEmail,
    password: validations.joiText(3, 90),
  });
  const joiErrors = userSchema.validate(user);

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