const joi = require("joi");
const validations = require("../../helpers/validations");

exports.isValidLogin = (user) => {
  const userSchema = joi.object({
    email: validations.joiEmail,
    password: validations.joiText(3, 90),
  });
  const joiErrors = userSchema.validate(user);

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

exports.isValidCreate = (user) => {
  const userSchema = joi.object({
    userName: validations.joiText(1, 50),
    userEmail: validations.joiEmail,
    userPassword: validations.joiText(3, 100),
    userMobile: validations.joiText(1, 45),
    personid: validations.joiText(1, 50),
    ipaddress: validations.joiText(1, 15),
  });
  const joiErrors = userSchema.validate(user);

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

exports.isValidUpdate = (user) => {
  const userSchema = joi.object({
    userName: validations.joiText(1, 50),
    userEmail: validations.joiEmail,
    userPassword: validations.joiNotRequiredText(0, 100),
    userMobile: validations.joiText(1, 45),
    personid: validations.joiText(1, 50),
    ipaddress: validations.joiText(1, 15),
  });
  const joiErrors = userSchema.validate(user);

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