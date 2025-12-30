// Validation
const colorCategoryValidation = require("../../validations/general/color-category");

// Services
const colorCategoryService = require("../../services/general/color-category");

// Util
const constants = require("../../util/constants");

exports.select = async (request, response) => {
  // logging

  // call service
  const results = await colorCategoryService.select();
  response.status(200).json(results);
};

exports.selectDeleted = async (request, response) => {
  // logging

  // call service
  const results = await colorCategoryService.selectDeleted();
  response.status(200).json(results);
};

exports.selectByDeying = async (request, response) => {
  // logging
  const { deyingId } = request.params;

  // call service
  const results = await colorCategoryService.selectByDeying(deyingId);
  response.status(200).json(results);
};

exports.selectDyersAndRequisitionsColorCategoryOfFabrics = async (request, response) => {
  // logging
  const { fabricId } = request.params;
  const { supplierId } = request.params;

  // call service
  const results = await colorCategoryService.selectDyersAndRequisitionsColorCategoryOfFabrics(fabricId, supplierId);
  response.status(200).json(results);
};

exports.selectByOrderByDyedFabricWe = async (request, response) => {
  // logging
  const { orderRequisitionId } = request.params;
  const { dyedFabricId } = request.params;

  // call service
  const results = await colorCategoryService.selectByOrderByDyedFabricWe(orderRequisitionId, dyedFabricId);
  response.status(200).json(results);
};

exports.create = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!colorCategoryValidation.isValid(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await colorCategoryService.create(bodyPalod);

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
  if (!colorCategoryValidation.isValid(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  bodyPalod.id = id
  const updateResults = await colorCategoryService.update(bodyPalod);
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

  const results = await colorCategoryService.dalete(bodyPalod);
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
    const results = await colorCategoryService.restore(bodyPalod);
    if (results === constants.restoreError) {
      return response.status(500).json(constants.restoreError);
    } else if (results === constants.itemNotFound) {
      return response.status(404).json(constants.itemNotFound);
    }

    return response.status(200).json(constants.restoreSuccess);
};