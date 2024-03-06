
// Services
const wbManufacturingInputService = require("../../services/wb/wb-manufacturing-input");

// Validations
const wbManufacturingInputValidation = require("../../validations/wb/wb-manufacturing-input");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
  const bodyPalod = request.body;
  console.log("bodyPalod.isOrder ::: ", bodyPalod.isOrder);

  // Validation
  if (!wbManufacturingInputValidation.isValid(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await wbManufacturingInputService.createInputDetails(bodyPalod, Number(bodyPalod.isOrder));

  if (results === constants.insertError) {
      return response.status(500).json(results);
  } else if (results === constants.duplicatedData) {
      return response.status(200).json(constants.duplicatedData);
  } else if (results === constants.invalidDataResponse) {
      return response.status(400).json(constants.invalidDataResponse);
  } else {
      return response.status(201).json(results);
  }
};

exports.selectByRequisitionId = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await wbManufacturingInputService.selectByRequisitionId(id);
  response.status(200).json(results);
};

exports.update = async (request, response) => {
  // logging
  const { id } = request.params;
  const bodyPalod = request.body;

  // Validation
  if (!wbManufacturingInputValidation.isValidUpdate(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  bodyPalod.id = id;
  const updateResults = await wbManufacturingInputService.update(bodyPalod);
  // response
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