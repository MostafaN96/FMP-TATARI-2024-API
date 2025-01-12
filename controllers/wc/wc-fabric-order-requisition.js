// ValidationwaCottonSellRequisitionService
const wcFabricOrderRequisitionValidation = require("../../validations/wc/wc-fabric-order-requisition");

// Services
const wcFabricOrderRequisitionService = require("../../services/wc/wc-fabric-order-requisition");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
    const bodyPalod = request.body;

    // Validation
    if (!wcFabricOrderRequisitionValidation.isValid(bodyPalod)) {
        // logging
        return response.status(400).json(constants.invalidDataResponse);
    }
    //   send data to service
    const results = await wcFabricOrderRequisitionService.create(bodyPalod);

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
    const results = await wcFabricOrderRequisitionService.selectOpenedOrders();
    response.status(200).json(results);
};

exports.selectClosedOrders = async (request, response) => {
    // logging

    // call service
    const results = await wcFabricOrderRequisitionService.selectClosedOrders();
    response.status(200).json(results);
};

exports.closedOrderByRequisition = async (request, response) => {
    // logging
    const { id } = request.params;

    // call service
    const results = await wcFabricOrderRequisitionService.closedOrderByRequisition(id);
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

exports.selectFabricsOrderRequisition = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await wcFabricOrderRequisitionService.selectFabricsOrderRequisition(id);
    response.status(200).json(results);
  };

exports.inquireFabricsForOrderWc = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await wcFabricOrderRequisitionService.inquireFabricsForOrderWc(id);
    response.status(200).json(results);
  };
  
exports.selectByWarehouseWc = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await wcFabricOrderRequisitionService.selectByWarehouseWc(id);
    response.status(200).json(results);
  };
  
exports.selectByDyeingWd = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await wcFabricOrderRequisitionService.selectByDyeingWd(id);
    response.status(200).json(results);
  };