// Services
const wcReturnRequisitionDetailsService = require("../../services/wc/wc-return-requisition-details");

// Validations
const wcReturnRequisitionDetailsValidation = require("../../validations/wc/wc-return-requisition-details");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!wcReturnRequisitionDetailsValidation.isValid(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }

  //   send data to service
  const results = await wcReturnRequisitionDetailsService.create(bodyPalod);

  if (results === constants.insertError) {
    return response.status(500).json(results);
  } else if (results === constants.invalidDataResponse) {
    return response.status(400).json(constants.invalidDataResponse);
  } else {
    return response.status(201).json(results);
  }
};

exports.selectByRequisitionId = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await wcReturnRequisitionDetailsService.selectByRequisitionId(id);
    response.status(200).json(results);
  };

  exports.update = async (request, response) => {
    // logging
    const { id } = request.params;
    const { supplierId } = request.params;
    const bodyPalod = request.body;

    // Validation
    if (!wcReturnRequisitionDetailsValidation.isValidUpdate(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
    }
    bodyPalod.id = id;
    bodyPalod.supplierId = supplierId;
    const updateResults = await wcReturnRequisitionDetailsService.update(bodyPalod);
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