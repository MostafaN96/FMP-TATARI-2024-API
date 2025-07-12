// Validation
const weTransitionBetweenOrdersRequisitionValidation = require("../../validations/we/we-transition-between-orders-requisition");

// Services
const weTransitionBetweenOrdersRequisitionService = require("../../services/we/we-transition-between-orders-requisition");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
    const bodyPalod = request.body;

    // Validation
    if (!weTransitionBetweenOrdersRequisitionValidation.isValid(bodyPalod)) {
        // logging
        return response.status(400).json(constants.invalidDataResponse);
    }
    //   send data to service
    const results = await weTransitionBetweenOrdersRequisitionService.create(bodyPalod);

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
    const results = await weTransitionBetweenOrdersRequisitionService.select();
    response.status(200).json(results);
  };