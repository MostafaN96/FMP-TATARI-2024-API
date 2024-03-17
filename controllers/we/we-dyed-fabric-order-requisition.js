// Validation
const weDyedFabricOrderRequisitionValidation = require("../../validations/we/we-dyed-fabric-order-requisition");

// Services
const weDyedFabricOrderRequisitionService = require("../../services/we/we-dyed-fabric-order-requisition");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
    const bodyPalod = request.body;

    // Validation
    if (!weDyedFabricOrderRequisitionValidation.isValid(bodyPalod)) {
        // logging
        return response.status(400).json(constants.invalidDataResponse);
    }
    //   send data to service
    const results = await weDyedFabricOrderRequisitionService.create(bodyPalod);

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

exports.selectOpenedOrders = async (request, response) => {
    // logging

    // call service
    const results = await weDyedFabricOrderRequisitionService.selectOpenedOrders();
    response.status(200).json(results);
};

exports.selectClosedOrders = async (request, response) => {
    // logging

    // call service
    const results = await weDyedFabricOrderRequisitionService.selectClosedOrders();
    response.status(200).json(results);
};

exports.closedOrderByRequisition = async (request, response) => {
    // logging
    const { id } = request.params;

    // call service
    const results = await weDyedFabricOrderRequisitionService.closedOrderByRequisition(id);
    if (results === constants.insertError) {
        return response.status(500).json(results);
    } else if (results === constants.updateError) {
        return response.status(200).json(constants.updateError);
    } else if (results === constants.invalidDataResponse) {
        return response.status(400).json(constants.invalidDataResponse);
    } else {
        return response.status(201).json(constants.updateSuccess);
    }
};

exports.selectDyedFabricsOrderRequisition = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await weDyedFabricOrderRequisitionService.selectDyedFabricsOrderRequisition(id);
    response.status(200).json(results);
  };