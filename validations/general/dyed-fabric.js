const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (dyedFabric) => {
  const dyedFabricSchema = joi.object({
    fabricId: validations.joiText(15, 30),
    name: validations.joiText(3, 90),
    code: validations.joiText(3, 45),
    dyeingCode: validations.joiNotRequiredText(0, 90),
    fabricQuantityM2: validations.joiNotRequiredText(0, 90),
    wasteRatio: validations.joiNotRequiredText(0, 90),
    personid: validations.joiText(1, 50),
    ipaddress: validations.joiText(3, 50)
  });
  const joiErrors = dyedFabricSchema.validate(dyedFabric);

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