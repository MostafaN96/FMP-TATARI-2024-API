// Validation
const waAddRequisitionValidation = require("../../validations/wa/wa-add-requisition");

// Services
const waAddRequisitionService = require("../../services/wa/wa-add-requisition");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
    const bodyPalod = request.body;

    // Validation
    if (!waAddRequisitionValidation.isValid(bodyPalod)) {
        // logging
        return response.status(400).json(constants.invalidDataResponse);
    }
    //   send data to service
    const results = await waAddRequisitionService.create(bodyPalod);

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
    if (!waAddRequisitionValidation.isValidOrder(bodyPalod)) {
        // logging
        return response.status(400).json(constants.invalidDataResponse);
    }
    //   send data to service
    const results = await waAddRequisitionService.createForOrder(bodyPalod);

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
    // logging
  
    // call service
    const results = await waAddRequisitionService.select();
    response.status(200).json(results);
  };

  
exports.selectOrders = async (request, response) => {
    // logging
  
    // call service
    const results = await waAddRequisitionService.selectOrders();
    response.status(200).json(results);
  };