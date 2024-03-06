// Validation
const usersPermissionsValidation = require("../../validations/general/users-permissions");

// Services
const usersPermissionsService = require("../../services/general/users-permissions");

// Util
const constants = require("../../util/constants");

exports.update = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!usersPermissionsValidation.isValid(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await usersPermissionsService.update(bodyPalod);

  if (results === constants.insertError) {
    return response.status(500).json(results);
  } else if (results === constants.duplicatedData) {
    return response.status(200).json(constants.duplicatedData);
  } else {
    return response.status(201).json(constants.insertSuccess);
  }
};

exports.selectAddedUsersPermissions = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await usersPermissionsService.selectAddedUsersPermissions(id);
    response.status(200).json(results);
  };

exports.selectNewUsersPermissions = async (request, response) => {
    // logging
    const { id } = request.params;

    // call service
    const results = await usersPermissionsService.selectNewUsersPermissions(id);
    response.status(200).json(results);
  };