const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (fabric) => {
  const fabricSchema = joi.object({
    name: validations.joiText(3, 120),
    code: validations.joiText(3, 45),
    dyeingCode: validations.joiNotRequiredText(0, 90),
    fabricQuantityM2: validations.joiNotRequiredText(0, 90),
    wasteRatio: validations.joiNotRequiredText(0, 90),
    isForm: validations.joiNumberAny,
    items: joi.array().items({
      yarnId: validations.joiText(15, 30),
      yarnCode: validations.joiNotRequiredNumber(0, 90),
      ratio: validations.joiNotRequiredNumber(0, 90),
      wastRatio: validations.joiNotRequiredNumber(0, 90)
    }),
    personid: validations.joiText(3, 50),
    ipaddress: validations.joiText(3, 50)
  });
  const joiErrors = fabricSchema.validate(fabric);

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

exports.isValidUpdate = (fabric) => {
  const fabricSchema = joi.object({
    name: validations.joiText(3, 120),
    code: validations.joiText(3, 45),
    dyeingCode: validations.joiNotRequiredText(0, 90),
    fabricQuantityM2: validations.joiNotRequiredText(0, 90),
    wasteRatio: validations.joiNotRequiredText(0, 90),
    personid: validations.joiText(3, 50),
    ipaddress: validations.joiText(3, 50)
  });
  const joiErrors = fabricSchema.validate(fabric);

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