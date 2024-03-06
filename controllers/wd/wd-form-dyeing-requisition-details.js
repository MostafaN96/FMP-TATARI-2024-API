// Services
const wdFormDyeingRequisitionDetailsService = require("../../services/wd/wd-form-dyeing-requisition-details");

// Validations
const wdFormDyeingRequisitionDetailsValidation = require("../../validations/wd/wd-form-dyeing-requisition-details");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!wdFormDyeingRequisitionDetailsValidation.isValid(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await wdFormDyeingRequisitionDetailsService.create(bodyPalod);

  if (results === constants.insertError) {
      return response.status(500).json(results);
  }  else if (results === constants.invalidDataResponse) {
      return response.status(400).json(constants.invalidDataResponse);
  } else {
      return response.status(201).json(results);
  }
};

exports.createForOrder = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!wdFormDyeingRequisitionDetailsValidation.isValidForOrder(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await wdFormDyeingRequisitionDetailsService.createForOrder(bodyPalod);

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
    const results = await wdFormDyeingRequisitionDetailsService.selectByRequisitionId(id);
    response.status(200).json(results);
  };

exports.selectByDyeing = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await wdFormDyeingRequisitionDetailsService.selectByDyeing(id);
    response.status(200).json(results);
  };

exports.selectOrderByRequisitionId = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await wdFormDyeingRequisitionDetailsService.selectOrderByRequisitionId(id);
    response.status(200).json(results);
  };

  exports.update = async (request, response) => {
    // logging
    const { id } = request.params;
    const bodyPalod = request.body;
 
    // Validation
    if (!wdFormDyeingRequisitionDetailsValidation.isValidUpdate(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
    }
    bodyPalod.id = id;
    const updateResults = await wdFormDyeingRequisitionDetailsService.update(bodyPalod);
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

  exports.updateByOrder = async (request, response) => {
    // logging
    const { id } = request.params;
    const bodyPalod = request.body;
 
    // Validation
    if (!wdFormDyeingRequisitionDetailsValidation.isValidUpdate(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
    }
    bodyPalod.id = id;
    const updateResults = await wdFormDyeingRequisitionDetailsService.updateByOrder(bodyPalod);
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