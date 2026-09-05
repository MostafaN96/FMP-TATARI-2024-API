// Validation
const wbManufacturingRequisitionValidation = require("../../validations/wb/wb-manufacturing-requisition");

// Services
const wbManufacturingRequisitionService = require("../../services/wb/wb-manufacturing-requisition");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
    const bodyPalod = request.body;

    // Validation
    if (!wbManufacturingRequisitionValidation.isValid(bodyPalod)) {
        // logging
        return response.status(400).json(constants.invalidDataResponse);
    }
    //   send data to service
    const results = await wbManufacturingRequisitionService.create(bodyPalod);

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

exports.createForOrder = async (request, response) => {
    const bodyPalod = request.body;

    // Validation
    if (!wbManufacturingRequisitionValidation.isValidOrder(bodyPalod)) {
        // logging
        return response.status(400).json(constants.invalidDataResponse);
    }
    //   send data to service
    const results = await wbManufacturingRequisitionService.createForOrder(bodyPalod);

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

exports.select = async (request, response) => {
    const results = await wbManufacturingRequisitionService.select();
    response.status(200).json(results);
};

exports.selectAllLazy = async (request, response) => {
    const results = await wbManufacturingRequisitionService.selectAllLazy(request.body);
    response.status(200).json(results);
};

exports.selectOrders = async (request, response) => {
    // logging
  
    // call service
    const results = await wbManufacturingRequisitionService.selectOrders();
    response.status(200).json(results);
  };
  
exports.update = async (request, response) => {
    // logging
    const { id } = request.params;
    const bodyPalod = request.body;
  
    // Validation
    if (!wbManufacturingRequisitionValidation.isValidUpdate(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
    }
    bodyPalod.id = id;
    const updateResults = await wbManufacturingRequisitionService.update(bodyPalod);
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