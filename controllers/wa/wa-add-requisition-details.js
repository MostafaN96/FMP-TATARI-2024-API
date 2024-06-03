// Services
const waAddRequisitionDetailsService = require("../../services/wa/wa-add-requisition-details");

// Modeles
const waAddRequisitionDetailsModel = require("../../models/wa/wa-add-requisition-details");

// Validations
const waAddRequisitionDetailsValidation = require("../../validations/wa/wa-add-requisition-details");


// Queries
const bussinessmanQueries = require("../../db/queries/general/bussinessman");
const waAddRequisitionQueries = require("../../db/queries/wa/wa-add-requisition");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!waAddRequisitionDetailsValidation.isValid(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
  }

  // Select Supllier for consigment name
  const selectAddRequisitionOneResult = await waAddRequisitionQueries.selectOne({
    id: bodyPalod.id
})
if (Array.isArray(selectAddRequisitionOneResult) && selectAddRequisitionOneResult.length > 0) {
    const selectBussinessmanOneResult = await bussinessmanQueries.selectOne({
      id: selectAddRequisitionOneResult[0].supplier_id
    })
    if (Array.isArray(selectBussinessmanOneResult) && selectBussinessmanOneResult.length > 0) {
      bodyPalod.supplierName = selectBussinessmanOneResult[0].name
    }
}

  //   send data to service
  const results = await waAddRequisitionDetailsService.create(bodyPalod, 0);

  if (results === constants.insertError) {
      return response.status(500).json(results);
  }  else if (results === constants.invalidDataResponse) {
      return response.status(400).json(constants.invalidDataResponse);
  } else {
      return response.status(201).json(results);
  }
};

exports.createByOrder = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!waAddRequisitionDetailsValidation.isValidOrder(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await waAddRequisitionDetailsService.create(bodyPalod, 1);

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
    const results = await waAddRequisitionDetailsService.selectByRequisitionId(id);
    response.status(200).json(results);
  };

  exports.selectByRequisitionIdForOrder = async (request, response) => {
    // logging
    const { id } = request.params;
  
    // call service
    const results = await waAddRequisitionDetailsService.selectByRequisitionIdForOrder(id);
    response.status(200).json(results);
  };
  

  exports.update = async (request, response) => {
    // logging
    const { id } = request.params;
    const bodyPalod = request.body;
  
    // Validation
    if (!waAddRequisitionDetailsValidation.isValidUpdate(bodyPalod)) {
      // logging
      return response.status(400).json(constants.invalidDataResponse);
    }
    bodyPalod.id = id;
    const updateResults = await waAddRequisitionDetailsService.update(bodyPalod);
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

  
exports.updateForOrder = async (request, response) => {
  // logging
  const { id } = request.params;
  const bodyPalod = request.body;

  // Validation
  if (!waAddRequisitionDetailsValidation.isValidUpdate(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  bodyPalod.id = id;
  const updateResults = await waAddRequisitionDetailsService.updateForOrder(bodyPalod);
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