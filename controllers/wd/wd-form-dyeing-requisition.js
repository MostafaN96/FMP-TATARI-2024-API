// Validation
const wdFormDyeingRequisitionValidation = require("../../validations/wd/wd-form-dyeing-requisition");

// Services
const wdFormDyeingRequisitionService = require("../../services/wd/wd-form-dyeing-requisition");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
    const bodyPalod = request.body;

    // Validation
    if (!wdFormDyeingRequisitionValidation.isValid(bodyPalod)) {
        // logging
        return response.status(400).json(constants.invalidDataResponse);
    }
    //   send data to service
    const results = await wdFormDyeingRequisitionService.create(bodyPalod);

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
    if (!wdFormDyeingRequisitionValidation.isValidForOrder(bodyPalod)) {
        // logging
        return response.status(400).json(constants.invalidDataResponse);
    }
    //   send data to service
    const results = await wdFormDyeingRequisitionService.createForOrder(bodyPalod);

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
    const results = await wdFormDyeingRequisitionService.select();
    response.status(200).json(results);
  };