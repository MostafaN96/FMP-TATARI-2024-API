const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (anointedServicesPrices) => {
  const anointedServicesPricesSchema = joi.object({
    dyerId: validations.joiText(15, 50),
    items: joi.array().items({
      colorCategoryId: validations.joiText(15, 50),
      colorId: validations.joiText(15, 50),
      code: validations.joiText(1, 45),
      price: validations.joiNumber(1, 60),
    }),
    personid: validations.joiText(3, 50),
    ipaddress: validations.joiText(3, 50),
  });
  const joiErrors = anointedServicesPricesSchema.validate(anointedServicesPrices);

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

exports.isValidUpdate = (anointedServicesPrices) => {
  const anointedServicesPricesSchema = joi.object({
    code: validations.joiText(2, 45),
    price: validations.joiNumber(1, 45),
    personid: validations.joiText(1, 90),
    ipaddress: validations.joiText(1, 90)
  });
  const joiErrors = anointedServicesPricesSchema.validate(anointedServicesPrices);

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