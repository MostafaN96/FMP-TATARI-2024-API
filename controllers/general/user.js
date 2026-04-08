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

exports.create = async (request, response) => {
  const bodyPalod = request.body;

  if (!userValidation.isValidCreate(bodyPalod)) {
    return response.status(400).json(constants.invalidDataResponse);
  }

  const results = await userService.create(bodyPalod);

  if (results === constants.duplicatedData) {
    return response.status(200).json(constants.duplicatedData);
  } else if (results === constants.insertError) {
    return response.status(500).json(constants.insertError);
  } else {
    return response.status(201).json(results);
  }
};

exports.update = async (request, response) => {
  const { id } = request.params;
  const bodyPalod = request.body;

  if (!userValidation.isValidUpdate(bodyPalod)) {
    return response.status(400).json(constants.invalidDataResponse);
  }

  bodyPalod.user_id = id;
  const updateResults = await userService.update(bodyPalod);

  switch (updateResults) {
    case constants.itemNotFound:
      return response.status(200).json(constants.itemNotFound);
    case constants.duplicatedData:
      return response.status(200).json(constants.duplicatedData);
    case constants.updateError:
      return response.status(500).json(constants.updateError);
    case constants.updateSuccess:
      return response.status(200).json(constants.updateSuccess);
    default:
      return response.status(200).json(updateResults);
  }
};

exports.select = async (request, response) => {
  // logging

  // call service
  const results = await userService.select();
  response.status(200).json(results);
};

exports.selectDeleted = async (request, response) => {
  const results = await userService.selectDeleted();
  response.status(200).json(results);
};

exports.delete = async (request, response) => {
  const bodyPalod = request.body;

  const results = await userService.dalete(bodyPalod);
  if (results === constants.deleteError) {
    return response.status(500).json(constants.deleteError);
  } else if (results === constants.itemNotFound) {
    return response.status(404).json(constants.itemNotFound);
  } else {
    return response.status(200).json(constants.deleteSuccess);
  }
};

exports.restore = async (request, response) => {
  const bodyPalod = request.body;

  const results = await userService.restore(bodyPalod);
  if (results === constants.restoreError) {
    return response.status(500).json(constants.restoreError);
  } else if (results === constants.itemNotFound) {
    return response.status(404).json(constants.itemNotFound);
  }

  return response.status(200).json(constants.restoreSuccess);
};