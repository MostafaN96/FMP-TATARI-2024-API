// ValidationwaCottonSellRequisitionService
const waYarnOrderRequisitionValidation = require("../../validations/wa/wa-yarn-order-requisition");

// Services
const waYarnOrderRequisitionService = require("../../services/wa/wa-yarn-order-requisition");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
    const bodyPalod = request.body;

    // Validation
    if (!waYarnOrderRequisitionValidation.isValid(bodyPalod)) {
        // logging
        return response.status(400).json(constants.invalidDataResponse);
    }
    //   send data to service
    const results = await waYarnOrderRequisitionService.create(bodyPalod);

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
    const results = await waYarnOrderRequisitionService.selectOpenedOrders();
    response.status(200).json(results);
};

exports.selectClosedOrders = async (request, response) => {
    // logging

    // call service
    const results = await waYarnOrderRequisitionService.selectClosedOrders();
    response.status(200).json(results);
};

exports.closedOrderByRequisition = async (request, response) => {
    // logging
    const { id } = request.params;

    // call service
    const results = await waYarnOrderRequisitionService.closedOrderByRequisition(id);
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
    const results = await waYarnOrderRequisitionService.selectYarnsOfYarnOrderRequisition(id);
    response.status(200).json(results);
  };

exports.inquireYarnsOfFabricForOrderWa = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await waYarnOrderRequisitionService.inquireYarnsOfFabricForOrderWa(id);
    response.status(200).json(results);
  };
  
exports.selectByYarnWa = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await waYarnOrderRequisitionService.selectByYarnWa(id);
    response.status(200).json(results);
  };
  
exports.selectByWarehouseWa = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await waYarnOrderRequisitionService.selectByWarehouseWa(id);
    response.status(200).json(results);
  };
  
exports.selectByIndustryWb = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await waYarnOrderRequisitionService.selectByIndustryWb(id);
    response.status(200).json(results);
  };
  
exports.selectByIndustryByFabricWb = async (request, response) => {
    // logging
    const { id } = request.params;
    const { fabricId } = request.params;
  
    // call service
    const results = await waYarnOrderRequisitionService.selectByIndustryByFabricWb(id, fabricId);
    response.status(200).json(results);
  };