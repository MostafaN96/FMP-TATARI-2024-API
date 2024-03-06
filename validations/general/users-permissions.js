const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (dyeingPhasesUsers) => {
  const dyeingPhasesUsersSchema = joi.object({
    userId: validations.joiText(1, 50),
    name: validations.joiText(1, 50),
    newUserPermissions: joi.any(),
    deletedUserPermissions: joi.any(),
    personid: validations.joiText(1, 50),
    ipaddress: validations.joiText(3, 50),
  });
  const joiErrors = dyeingPhasesUsersSchema.validate(dyeingPhasesUsers);

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
