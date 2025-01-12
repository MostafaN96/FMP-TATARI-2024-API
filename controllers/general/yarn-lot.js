// Model
const yarnLotModel = require("../../models/general/yarn-lot");

// Validation
const yarnLotValidation = require("../../validations/general/yarn-lot");

// Services
const yarnLotService = require("../../services/general/yarn-lot");
const generalService = require("../../services/general/general");

// Util
const yarnLotTableName = require("../../util/database-tables-name").yarnLotTableName;
const waTableName = require("../../util/database-tables-name").waTableName;
const waReconciliationRequisitionDetailsTableName = require("../../util/database-tables-name").waReconciliationRequisitionDetailsTableName;
const constants = require("../../util/constants");


exports.select = async (request, response) => {
  // logging

  // call service
  const results = await yarnLotService.select();
  response.status(200).json(results);
};

exports.selectDeleted = async (request, response) => {
  // logging

  // call service
  const results = await yarnLotService.selectDeleted();
  response.status(200).json(results);
};

exports.selectMaxCode = async (request, response) => {
  // logging

  // call service
  const results = await generalService.selectMaxValue(yarnLotTableName, { code: 'code' });
  response.status(200).json(results);
};

exports.selectByYarn = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await yarnLotService.selectByYarn(id);
  response.status(200).json(results);
};

exports.create = async (request, response) => {
  const bodyPalod = request.body;
  // create Model
  const yarnLot = new yarnLotModel(bodyPalod.yarnId, bodyPalod.code,
    bodyPalod.personid, bodyPalod.ipaddress);
  // Validation

  if (!yarnLotValidation.isValid(yarnLot)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await yarnLotService.create(yarnLot);

  if (results === constants.insertError) {
    return response.status(500).json(results);
  } else if (results === constants.duplicatedData) {
    return response.status(200).json(constants.duplicatedData);
  } else {
    return response.status(201).json(constants.insertSuccess);
  }
};


exports.update = async (request, response) => {
  // logging
  const { id } = request.params;
  const bodyPalod = request.body;

  // Validation
  if (!yarnLotValidation.isValidUpdate(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  bodyPalod.id = id
  const updateResults = await yarnLotService.update(bodyPalod);
  // response
  switch (updateResults) {
    case constants.itemNotFound:
      return response.status(200).json(constants.itemNotFound)
    case constants.duplicatedData:
      return response.status(200).json(constants.duplicatedData)
    case constants.updateError:
      return response.status(500).json(constants.updateError)
      break;
    case constants.updateSuccess:
      return response.status(200).json(constants.updateSuccess)
  }

};



exports.delete = async (request, response) => {
  // logging
  const bodyPalod = request.body;

  const results = await yarnLotService.dalete(bodyPalod);
  if (results === constants.deleteError) {
    return response.status(500).json(constants.deleteError);
  } else if (results === constants.itemNotFound) {
    return response.status(404).json(constants.itemNotFound);
  } else {
    return response.status(200).json(constants.deleteSuccess);
  }
};

exports.restore = async (request, response) => {
  // logging
  const bodyPalod = request.body;

  // call services
    const results = await yarnLotService.restore(bodyPalod);
    if (results === constants.restoreError) {
      return response.status(500).json(constants.restoreError);
    } else if (results === constants.itemNotFound) {
      return response.status(404).json(constants.itemNotFound);
    }

    return response.status(200).json(constants.restoreSuccess);
};

exports.selectByWarehouseByYarnWa = async (request, response) => {
  // logging
  const { id } = request.params;
  const { yarnId } = request.params;
  const { yarnOrderId } = request.params;

  // call service
  const results = await yarnLotService.selectByWarehouseByYarnWa(id, yarnId, yarnOrderId);
  response.status(200).json(results);
};

exports.selectBySupplierByWarehouseByYarnWa = async (request, response) => {
  // logging
  const { id } = request.params;
  const { warehouseId } = request.params;
  const { yarnId } = request.params;

  // call service
  const results = await yarnLotService.selectBySupplierByWarehouseByYarnWa(id, warehouseId, yarnId);
  response.status(200).json(results);
};

exports.selectByIndustryByYarnWb = async (request, response) => {
  // logging
  const { id } = request.params;
  const { yarnId } = request.params;
  const { yarnOrderId } = request.params;

  // call service
  const results = await yarnLotService.selectByIndustryByYarnWb(id, yarnId, yarnOrderId);
  response.status(200).json(results);
};