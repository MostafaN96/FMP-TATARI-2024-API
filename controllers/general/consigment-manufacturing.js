// Validation
const consigmentManufacturingValidation = require("../../validations/general/consigment-manufacturing");

// Services
const consigmentManufacturingService = require("../../services/general/consigment-manufacturing");

// Util
const constants = require("../../util/constants");

exports.select = async (request, response) => {
  // logging 

  // call service
  const results = await consigmentManufacturingService.select();
  response.status(200).json(results);
};

exports.selectDeleted = async (request, response) => {
  // logging

  // call service
  const results = await consigmentManufacturingService.selectDeleted();
  response.status(200).json(results);
};


exports.create = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!consigmentManufacturingValidation.isValid(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await consigmentManufacturingService.create(bodyPalod);

  if (results === constants.insertError) {
    return response.status(500).json(results);
  } else if (results === constants.duplicatedData) {
    return response.status(200).json(constants.duplicatedData);
  } else {
    return response.status(201).json(constants.insertSuccess);
  }
};


exports.update = async (request, response) => {
  // logging
  const { id } = request.params;
  const bodyPalod = request.body;

  // Validation
  if (!consigmentManufacturingValidation.isValid(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  bodyPalod.id = id
  const updateResults = await consigmentManufacturingService.update(bodyPalod);
  // response
  switch (updateResults) {
    case constants.itemNotFound:
      return response.status(200).json(constants.itemNotFound)
    case constants.duplicatedData:
      return response.status(200).json(constants.duplicatedData)
    case constants.updateError:
      return response.status(500).json(constants.updateError)
      break;
    case constants.updateSuccess:
      return response.status(200).json(constants.updateSuccess)
  }

};

exports.delete = async (request, response) => {
  // logging
  const bodyPalod = request.body;

  const results = await consigmentManufacturingService.dalete(bodyPalod);
  if (results === constants.deleteError) {
    return response.status(500).json(constants.deleteError);
  } else if (results === constants.itemNotFound) {
    return response.status(404).json(constants.itemNotFound);
  } else {
    return response.status(200).json(constants.deleteSuccess);
  }
};

exports.restore = async (request, response) => {
  // logging
  const bodyPalod = request.body;

  // call services
    const results = await consigmentManufacturingService.restore(bodyPalod);
    if (results === constants.restoreError) {
      return response.status(500).json(constants.restoreError);
    } else if (results === constants.itemNotFound) {
      return response.status(404).json(constants.itemNotFound);
    }

    return response.status(200).json(constants.restoreSuccess);
};