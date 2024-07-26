const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (gradeItem) => {
  const gradeItemSchema = joi.object({
    name: validations.joiText(1, 90),
    personid: validations.joiText(3, 50),
    ipaddress: validations.joiText(3, 50)
  });
  const joiErrors = gradeItemSchema.validate(gradeItem);

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