// ServiceswbTransportWaWbDetailsValidation
const waPurchaseOrderDetailsService = require("../../services/wa/wa-purchase-order-details");

// Validations
const waPurchaseOrderDetailsValidation = require("../../validations/wa/wa-purchase-order-details");


// Queries
const waAddRequisitionDetailsPurchaseOrderQueries = require("../../db/queries/wa/wa-add-requisition-details-purchase-order");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!waPurchaseOrderDetailsValidation.isValid(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
  }
  
  // For Add wa requisition (optional)
  bodyPalod.orderId = bodyPalod.id;
  
  // Select Supllier for consigment name
  const selectWaAddRequisitionDetailsPurchaseOrderOneResult = await waAddRequisitionDetailsPurchaseOrderQueries.select({
    wa_add_purchase_order_id: bodyPalod.id
  })
  if (Array.isArray(selectWaAddRequisitionDetailsPurchaseOrderOneResult) && selectWaAddRequisitionDetailsPurchaseOrderOneResult.length > 0) {
    bodyPalod.supplierId = selectWaAddRequisitionDetailsPurchaseOrderOneResult[0].supplier_id
    bodyPalod.consigmentYarnNumber = selectWaAddRequisitionDetailsPurchaseOrderOneResult[0].name
  }

  //   send data to service
  const results = await waPurchaseOrderDetailsService.create(bodyPalod);

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
    const results = await waPurchaseOrderDetailsService.selectByRequisitionIdOpenedOrder(id);
    response.status(200).json(results);
  };

exports.selectByRequisitionIdClosedOrder = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await waPurchaseOrderDetailsService.selectByRequisitionIdClosedOrder(id);
    response.status(200).json(results);
  };

  exports.closeOrder = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await waPurchaseOrderDetailsService.closeOrder(id);
    response.status(200).json(results);
  };

  
  exports.update = async (request, response) => {
    // logging
    const { id } = request.params;
    const bodyPalod = request.body;
  
    // Validation
    if (!waPurchaseOrderDetailsValidation.isValidUpdate(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
    }
    bodyPalod.id = id;
    const updateResults = await waPurchaseOrderDetailsService.update(bodyPalod);
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
  
exports.selectByYarnySeller = async (request, response) => {
  // logging
  const { fabricId } = request.params;
  const { sellerId } = request.params;

  // call service
  const results = await waPurchaseOrderDetailsService.selectByYarnySeller(fabricId, sellerId);
  response.status(200).json(results);
};
  
exports.yarnsOfPurchaseOrderWa = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await waPurchaseOrderDetailsService.yarnsOfPurchaseOrderWa(id);
  response.status(200).json(results);
};
  
exports.yarnsOfPurchaseOrderWaNotAdded = async (request, response) => {
  // logging
  const { id } = request.params;
  const { addRequisitionId } = request.params;

  // call service
  const results = await waPurchaseOrderDetailsService.yarnsOfPurchaseOrderWaNotAdded(id, addRequisitionId);
  response.status(200).json(results);
};
