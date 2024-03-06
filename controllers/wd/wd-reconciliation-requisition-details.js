// Services
const wdReconciliationRequisitionDetailsService = require("../../services/wd/wd-reconciliation-requisition-details");

// Modeles
// const wbReconciliationRequisitionDetailsModel = require("../../models/wb/wb-reconciliation-requisition-details");

// Validations
const wdReconciliationRequisitionDetailsValidation = require("../../validations/wd/wd-reconciliation-requisition-details");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!wdReconciliationRequisitionDetailsValidation.isValid(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await wdReconciliationRequisitionDetailsService.create(bodyPalod);

  if (results === constants.insertError) {
      return response.status(500).json(results);
  }  else if (results === constants.invalidDataResponse) {
      return response.status(400).json(constants.invalidDataResponse);
  } else {
      return response.status(201).json(results);
  }
};

exports.selectByRequisitionId = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await wdReconciliationRequisitionDetailsService.selectByRequisitionId(id);
    response.status(200).json(results);
  };

  exports.update = async (request, response) => {
    // logging
    const { id } = request.params;
    const bodyPalod = request.body;
 
    // Validation
    if (!wdReconciliationRequisitionDetailsValidation.isValidUpdate(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
    }
    bodyPalod.id = id;
    const updateResults = await wdReconciliationRequisitionDetailsService.update(bodyPalod);
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