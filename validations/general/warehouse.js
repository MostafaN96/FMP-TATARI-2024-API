const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (cotton) => {
  const warehouseSchema = joi.object({
    name: validations.joiText(1, 90),
    storekeeper_name: validations.joiNotRequiredText(0, 90),
    phone: validations.joiNotRequiredText(0, 45),
    address: validations.joiNotRequiredText(0, 10000),
    is_stock: validations.joiNumberAny,
    is_grade: validations.joiNumberAny,
    creator_id: validations.joiText(1, 90),
    ip_address: validations.joiText(1, 90)
  });
  const joiErrors = warehouseSchema.validate(cotton);

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