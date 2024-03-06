const UserLoginModel = require("../../models/general/user-login");
const userValidation = require("../../validations/general/user");
const userService = require("../../services/general/user");
const constants = require("../../util/constants");

exports.login = async (request, response) => {
  const bodyPalod = request.body;

  // create Model
  const user = new UserLoginModel(bodyPalod.email, bodyPalod.password);
  // Validation

  if (!userValidation.isValidLogin(user)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await userService.login(user);

  if (results === constants.itemNotFound) {
    return response.status(200).json(constants.itemNotFound);
  } else if (results === constants.unauthorized) {
    return response.status(200).json(constants.unauthorized);
  } else {
    return response.status(200).json({...constants.loginSuccess , ...results});
  }
};

exports.select = async (request, response) => {
  // logging

  // call service
  const results = await userService.select();
  response.status(200).json(results);
};