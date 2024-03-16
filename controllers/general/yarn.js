// Model
const yarnModel = require("../../models/general/yarn");

// Validation
const yarnValidation = require("../../validations/general/yarn");

// Services
const yarnService = require("../../services/general/yarn");
const generalService = require("../../services/general/general");

// Util
const yarnTableName = require("../../util/database-tables-name").yarnTableName;
const waTableName = require("../../util/database-tables-name").waTableName;
const waAddRequisitionTableName = require("../../util/database-tables-name").waAddRequisitionTableName;
const waReconciliationRequisitionDetailsTableName = require("../../util/database-tables-name").waReconciliationRequisitionDetailsTableName;
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { waAddRequisitionDetailsTableName, wbTableName, wbReconciliationRequisitionDetailsTableName } = require("../../util/database-tables-name");

exports.select = async (request, response) => {
  // logging

  // call service
  const results = await yarnService.select();
  response.status(200).json(results);
};

exports.selectStoredWaYarnsBySupplier = async (request, response) => {
  // logging
  const { id } = request.params;
  const { warehouseId } = request.params;

  let whereCluse = {};
    whereCluse[`${yarnTableName}.is_deleted`] = 0;
    whereCluse[`${yarnTableName}.is_active`] = 1;
    whereCluse[`${waTableName}.is_deleted`] = 0;
    whereCluse[`${waTableName}.is_active`] = 1;
    whereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    whereCluse[`${waAddRequisitionTableName}.supplier_id`] = id;

  // call service
  const results = await yarnService.selectStoredWaYarnsForReturn(whereCluse);
  response.status(200).json(results);
};

exports.selectDeleted = async (request, response) => {
  // logging

  // call service
  const results = await yarnService.selectDeleted();
  response.status(200).json(results);
};

exports.selectMaxCode = async (request, response) => {
  // logging

  // call service
  const results = await generalService.selectMaxValue(yarnTableName, { code: 'code' });
  response.status(200).json(results);
};

exports.selectStoredWaYarns = async (request, response) => {
  // logging
  let whereCluse = {};
    whereCluse[`${yarnTableName}.is_deleted`] = 0;
    whereCluse[`${yarnTableName}.is_active`] = 1;
    whereCluse[`${waTableName}.is_deleted`] = 0;
    whereCluse[`${waTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${yarnTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let wbTransportRequisitionWbWaDetailsWhereCluse = {};
    wbTransportRequisitionWbWaDetailsWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    wbTransportRequisitionWbWaDetailsWhereCluse[`${yarnTableName}.is_active`] = 1;
    wbTransportRequisitionWbWaDetailsWhereCluse[`${waTableName}.is_deleted`] = 0;
    wbTransportRequisitionWbWaDetailsWhereCluse[`${waTableName}.is_active`] = 1;
    wbTransportRequisitionWbWaDetailsWhereCluse[`${waTableName}.type`] = constantsPayloads.transportFromBToAType;
    let whereCluseArray = [whereCluse, reconciliationWhereCluse, wbTransportRequisitionWbWaDetailsWhereCluse]

  // call service
  const results = await yarnService.selectStoredWaYarns(whereCluseArray);
  response.status(200).json(results);
};

exports.selectByWarehouseWa = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await yarnService.selectByWarehouseWa(id);
  response.status(200).json(results);
};

exports.selectStoredWaYarnsByYarnId = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await yarnService.selectStoredWaYarnsByYarnId(id);
  response.status(200).json(results);
};

exports.selectByIndustryWb = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await yarnService.selectByIndustryWb(id);
  response.status(200).json(results);
};

exports.selectStoredWbYarnsInManufacturers = async (request, response) => {
  // logging
  let whereCluse = {};
    whereCluse[`${yarnTableName}.is_deleted`] = 0;
    whereCluse[`${yarnTableName}.is_active`] = 1;
    whereCluse[`${wbTableName}.is_deleted`] = 0;
    whereCluse[`${wbTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${yarnTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let wbTransitionBetweenIndustriesWhereCluse = {};
    wbTransitionBetweenIndustriesWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    wbTransitionBetweenIndustriesWhereCluse[`${yarnTableName}.is_active`] = 1;
    wbTransitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    wbTransitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    wbTransitionBetweenIndustriesWhereCluse[`${wbTableName}.type`] = constantsPayloads.transportBetweenType;
    let whereCluseArray = [whereCluse, reconciliationWhereCluse, wbTransitionBetweenIndustriesWhereCluse]

  // call service
  const results = await yarnService.selectStoredWbYarnsInManufacturers(whereCluseArray);
  response.status(200).json(results);
};

exports.create = async (request, response) => {
  const bodyPalod = request.body;
  // create Model
  const yarn = new yarnModel(
    bodyPalod.name, 
    bodyPalod.code,
    // bodyPalod.lotCode,
    "",
    bodyPalod.personid, 
    bodyPalod.ipaddress);
  // Validation

  if (!yarnValidation.isValid(yarn)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await yarnService.create(yarn);

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

  // create Model
  const yarn = new yarnModel(bodyPalod.name, bodyPalod.code,
    bodyPalod.personid, bodyPalod.ipaddress);
  // Validation

  if (!yarnValidation.isValid(yarn)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  yarn.id = id
  const updateResults = await yarnService.update(yarn);
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

  const results = await yarnService.dalete(bodyPalod);
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
    const results = await yarnService.restore(bodyPalod);
    if (results === constants.restoreError) {
      return response.status(500).json(constants.restoreError);
    } else if (results === constants.itemNotFound) {
      return response.status(404).json(constants.itemNotFound);
    }

    return response.status(200).json(constants.restoreSuccess);
};