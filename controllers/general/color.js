// Validation
const colorValidation = require("../../validations/general/color");

// Services
const colorService = require("../../services/general/color");

// Util
const constants = require("../../util/constants");

exports.select = async (request, response) => {
  // logging

  // call service
  const results = await colorService.select();
  response.status(200).json(results);
};

exports.selectDeleted = async (request, response) => {
  // logging

  // call service
  const results = await colorService.selectDeleted();
  response.status(200).json(results);
};

exports.selectByDeying = async (request, response) => {
  // logging
  const { deyingId } = request.params;
  console.log("deyingId ::::::: ", deyingId);

  // call service
  const results = await colorService.selectByDeying(deyingId);
  response.status(200).json(results);
};

exports.selectByCategoryAndDeying = async (request, response) => {
  // logging
  const { deyingId } = request.params;
  const { colorCategoryId } = request.params;

  // call service
  const results = await colorService.selectByCategoryAndDeying(deyingId, colorCategoryId);
  response.status(200).json(results);
};

exports.selectByCategory = async (request, response) => {
  // logging
  const { colorCategoryId } = request.params;

  // call service
  const results = await colorService.selectByCategory(colorCategoryId);
  response.status(200).json(results);
};

exports.selectDyersAndRequisitionsColorOfFabrics = async (request, response) => {
  // logging
  const { supplierId } = request.params;
  const { fabricId } = request.params;
  const { colorCategoryId } = request.params;
  const { requisitionId } = request.params;
  
  // call service
  const results = await colorService.selectDyersAndRequisitionsColorOfFabrics(fabricId, supplierId, colorCategoryId, requisitionId);
  response.status(200).json(results);
};

exports.selectByOrderByDyedFabricByColorCategoryWe = async (request, response) => {
  // logging
  const { orderRequisitionId } = request.params;
  const { dyedFabricId } = request.params;
  const { colorCategoryId } = request.params;

  // call service
  const results = await colorService.selectByOrderByDyedFabricByColorCategoryWe(orderRequisitionId, dyedFabricId, colorCategoryId);
  response.status(200).json(results);
};

exports.create = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!colorValidation.isValid(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await colorService.create(bodyPalod);

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
  if (!colorValidation.isValid(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  bodyPalod.id = id
  const updateResults = await colorService.update(bodyPalod);
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

  const results = await colorService.dalete(bodyPalod);
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
    const results = await colorService.restore(bodyPalod);
    if (results === constants.restoreError) {
      return response.status(500).json(constants.restoreError);
    } else if (results === constants.itemNotFound) {
      return response.status(404).json(constants.itemNotFound);
    }

    return response.status(200).json(constants.restoreSuccess);
};