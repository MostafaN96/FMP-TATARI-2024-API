// Services
const weDyedFabricOrderRequisitionDetailsService = require("../../services/we/we-dyed-fabric-order-requisition-details");

// Validations
const weDyedFabricOrderRequisitionDetailsValidation = require("../../validations/we/we-dyed-fabric-order-requisition-details");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!weDyedFabricOrderRequisitionDetailsValidation.isValid(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await weDyedFabricOrderRequisitionDetailsService.createDetails(bodyPalod);

  if (results === constants.insertError) {
      return response.status(500).json(results);
  }  else if (results === constants.invalidDataResponse) {
      return response.status(400).json(constants.invalidDataResponse);
  } else {
      return response.status(201).json(results);
  }
};

exports.selectByRequisitionIdOpenedOrder = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await weDyedFabricOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrder(id);
    response.status(200).json(results);
  };

exports.selectByRequisitionIdClosedOrder = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await weDyedFabricOrderRequisitionDetailsService.selectByRequisitionIdClosedOrder(id);
    response.status(200).json(results);
  };

  exports.closeOrder = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await weDyedFabricOrderRequisitionDetailsService.closeOrder(id);
    response.status(200).json(results);
  };

  exports.update = async (request, response) => {
    // logging
    const { id } = request.params;
    const bodyPalod = request.body;
  
    // Validation
    if (!weDyedFabricOrderRequisitionDetailsValidation.isValidUpdate(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
    }
    bodyPalod.id = id;
    const updateResults = await weDyedFabricOrderRequisitionDetailsService.update(bodyPalod);
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
  
exports.selectOrdersBySeller = async (request, response) => {
  // logging
  const { sellerId } = request.params;

  // call service
  const results = await weDyedFabricOrderRequisitionDetailsService.selectOrdersBySeller(sellerId);
  response.status(200).json(results);
};

exports.getWasteRatio = async (request, response) => {
  const { requisitionId, dyedFabricId } = request.query;
  
  if (!requisitionId || !dyedFabricId) {
    return response.status(400).json({ error: 'requisitionId and dyedFabricId are required' });
  }

  const wasteRatio = await weDyedFabricOrderRequisitionDetailsService.getWasteRatioByRequisitionAndFabric(requisitionId, dyedFabricId);
  response.status(200).json({ wasteRatio });
};
