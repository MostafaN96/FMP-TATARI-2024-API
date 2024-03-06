// Services
const weReconciliationRequisitionDetailsService = require("../../services/we/we-reconciliation-requisition-details");

// Validations
const weReconciliationRequisitionDetailsValidation = require("../../validations/we/we-reconciliation-requisition-details");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!weReconciliationRequisitionDetailsValidation.isValid(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await weReconciliationRequisitionDetailsService.create(bodyPalod);

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
    const results = await weReconciliationRequisitionDetailsService.selectByRequisitionId(id);
    response.status(200).json(results);
  };

  exports.update = async (request, response) => {
    // logging
    const { id } = request.params;
    const bodyPalod = request.body;
 
    // Validation
    if (!weReconciliationRequisitionDetailsValidation.isValidUpdate(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
    }
    bodyPalod.id = id;
    const updateResults = await weReconciliationRequisitionDetailsService.update(bodyPalod);
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