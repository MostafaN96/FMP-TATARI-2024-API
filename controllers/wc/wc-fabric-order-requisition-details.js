// ServiceswbTransportWaWbDetailsValidation
const wcFabricOrderRequisitionDetailsService = require("../../services/wc/wc-fabric-order-requisition-details");

// Validations
const wcFabricOrderRequisitionDetailsValidation = require("../../validations/wc/wc-fabric-order-requisition-details");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!wcFabricOrderRequisitionDetailsValidation.isValid(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await wcFabricOrderRequisitionDetailsService.createDetails(bodyPalod);

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
    const results = await wcFabricOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrder(id);
    response.status(200).json(results);
  };

exports.selectByRequisitionIdClosedOrder = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await wcFabricOrderRequisitionDetailsService.selectByRequisitionIdClosedOrder(id);
    response.status(200).json(results);
  };

  exports.closeOrder = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await wcFabricOrderRequisitionDetailsService.closeOrder(id);
    response.status(200).json(results);
  };

  
  exports.update = async (request, response) => {
    // logging
    const { id } = request.params;
    const bodyPalod = request.body;
  
    // Validation
    if (!wcFabricOrderRequisitionDetailsValidation.isValidUpdate(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
    }
    bodyPalod.id = id;
    const updateResults = await wcFabricOrderRequisitionDetailsService.update(bodyPalod);
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
  
exports.selectByFabricBySeller = async (request, response) => {
  // logging
  const { fabricId } = request.params;
  const { sellerId } = request.params;

  // call service
  const results = await wcFabricOrderRequisitionDetailsService.selectByFabricBySeller(fabricId, sellerId);
  response.status(200).json(results);
};
