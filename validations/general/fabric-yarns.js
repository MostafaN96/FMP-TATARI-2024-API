const joi = require("joi");
const validations = require("../../helpers/validations");

exports.isValid = (fabricYarns) => {
  const fabricYarnsSchema = joi.object({
    items: joi.array().items({
      yarnId: validations.joiText(15, 30),
      yarnName: validations.joiNotRequiredText(0, 90),
      yarnCode: validations.joiNotRequiredText(0, 90),
      ratio: validations.joiNotRequiredText(0, 90),
      wastRatio: validations.joiNotRequiredText(0, 90)
    }),
    personid: validations.joiText(3, 50),
    ipaddress: validations.joiText(3, 50)
  });
  const joiErrors = fabricYarnsSchema.validate(fabricYarns);

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


// exports.isValidUpdate = (fabricYarns) => {
//   const fabricYarnsSchema = joi.object({
//     yarnId: validations.joiText(15, 30),
//     yarnName: validations.joiNotRequiredText(0, 90),
//     yarnCode: validations.joiNotRequiredText(0, 90),
//     ratio: validations.joiNotRequiredText(0, 90),
//     wastRatio: validations.joiNotRequiredText(0, 90),
//     personid: validations.joiText(3, 50),
//     ipaddress: validations.joiText(3, 50),
//   });
//   const joiErrors = fabricYarnsSchema.validate(fabricYarns);

//   try {
//     if (joiErrors.error) {
//       console.log(joiErrors.error.details);
//       return false;
//     } else {
//       return true;
//     }
//   } catch (error) {
//     console.log(joiErrors.error.details);
//     return false;
//   }
// };