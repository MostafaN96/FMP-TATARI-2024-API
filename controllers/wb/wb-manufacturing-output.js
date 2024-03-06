
// Services
const wbManufacturingOutputService = require("../../services/wb/wb-manufacturing-output");

// Validations
const wbManufacturingOutputValidation = require("../../validations/wb/wb-manufacturing-output");

// Util
const constants = require("../../util/constants");

exports.selectLatestManufacturingFeeByIndustryAndFabric = async (request, response) => {
  // logging
  const { industryId } = request.params;
  const { fabricId } = request.params;

  // call service
  const results = await wbManufacturingOutputService.selectLatestManufacturingFeeByIndustryAndFabric(industryId, fabricId);
  response.status(200).json(results);
};

exports.selectByRequisitionId = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await wbManufacturingOutputService.selectByRequisitionId(id);
  response.status(200).json(results);
};

exports.selectByRequisitionIdForOrder = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await wbManufacturingOutputService.selectByRequisitionIdForOrder(id);
  response.status(200).json(results);
};

exports.selectConsigmentManufacturingByFabric = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await wbManufacturingOutputService.selectConsigmentManufacturingByFabric(id);
  response.status(200).json(results);
};

exports.update = async (request, response) => {
  // logging
  const { id } = request.params;
  const bodyPalod = request.body;

  // Validation
  if (!wbManufacturingOutputValidation.isValidUpdate(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  bodyPalod.id = id;
  const updateResults = await wbManufacturingOutputService.update(bodyPalod);
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

exports.updateForOrder = async (request, response) => {
  // logging
  const { id } = request.params;
  const bodyPalod = request.body;

  // Validation
  if (!wbManufacturingOutputValidation.isValidUpdate(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  bodyPalod.id = id;
  const updateResults = await wbManufacturingOutputService.updateForOrder(bodyPalod);
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