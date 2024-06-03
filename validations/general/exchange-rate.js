const joi = require("joi");
const validations = require("../../helpers/validations");

exports.isValid = (exchangeRate) => {
  const exchangeRateSchema = joi.object({
    dollarPrice: validations.joiNumber(1, 1000),
    personid: validations.joiText(1, 90),
    ipaddress: validations.joiText(1, 90)
  });
  const joiErrors = exchangeRateSchema.validate(exchangeRate);

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