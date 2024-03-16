// ValidationwaCottonSellRequisitionService
const waPurchaseOrderValidation = require("../../validations/wa/wa-purchase-order");

// Services
const waPurchaseOrderService = require("../../services/wa/wa-purchase-order");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
    const bodyPalod = request.body;

    // Validation
    if (!waPurchaseOrderValidation.isValid(bodyPalod)) {
        // logging
        return response.status(400).json(constants.invalidDataResponse);
    }
    //   send data to service
    const results = await waPurchaseOrderService.create(bodyPalod);

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
    const results = await waPurchaseOrderService.selectOpenedOrders();
    response.status(200).json(results);
};

exports.selectClosedOrders = async (request, response) => {
    // logging

    // call service
    const results = await waPurchaseOrderService.selectClosedOrders();
    response.status(200).json(results);
};

exports.closedOrderByRequisition = async (request, response) => {
    // logging
    const { id } = request.params;

    // call service
    const results = await waPurchaseOrderService.closedOrderByRequisition(id);
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

exports.selectYarnsOfYarnOrderRequisition = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await waPurchaseOrderService.selectYarnsOfYarnOrderRequisition(id);
    response.status(200).json(results);
  };

exports.inquireYarnsOfFabricForOrderWa = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await waPurchaseOrderService.inquireYarnsOfFabricForOrderWa(id);
    response.status(200).json(results);
  };