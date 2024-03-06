const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (circularKnittingMachine) => {
  const circularKnittingMachineSchema = joi.object({
    fabricId: validations.joiText(15, 30),
    manufactureId: validations.joiText(15, 30),
    fabricCode: validations.joiNotRequiredText(0, 10000),
    type: validations.joiText(1, 90),
    number: validations.joiNotRequiredText(0, 10000),
    diameter: validations.joiNotRequiredText(0, 10000),
    smoothness: validations.joiNotRequiredText(0, 10000),
    model: validations.joiNotRequiredText(0, 10000),
    personid: validations.joiText(3, 50),
    ipaddress: validations.joiText(3, 50)
  });
  const joiErrors = circularKnittingMachineSchema.validate(circularKnittingMachine);

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