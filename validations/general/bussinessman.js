const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (bussinessman) => {
  const bussinessmanSchema = joi.object({
    name: validations.joiText(2, 90),
    phone: validations.joiNotRequiredText(0, 1000),
    address: validations.joiNotRequiredText(0, 1000),
    is_supplier: validations.joiNumberAny,
    is_seller: validations.joiNumberAny,
    is_manufacturer: validations.joiNumberAny,
    is_dyer: validations.joiNumberAny,
    is_calc_dyeing_net: validations.joiNumberAny,
    is_stock: validations.joiNumberAny,
    creator_id: validations.joiText(1, 90),
    ip_address: validations.joiText(1, 90)
  });
  const joiErrors = bussinessmanSchema.validate(bussinessman);

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