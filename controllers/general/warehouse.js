// Model
const warehouseModel = require("../../models/general/warehouse");

// Validation
const warehouseValidation = require("../../validations/general/warehouse");

// Services
const warehouseService = require("../../services/general/warehouse");

// Util
const constants = require("../../util/constants");

exports.select = async (request, response) => {
  // logging

  // call service
  const results = await warehouseService.select();
  response.status(200).json(results);
};

exports.selectDeleted = async (request, response) => {
  // logging

  // call service
  const results = await warehouseService.selectDeleted();
  response.status(200).json(results);
};

exports.selectWhereInWa = async (request, response) => {
  // logging

  // call service
  const results = await warehouseService.selectWhereInWa();
  response.status(200).json(results);
};

exports.selectWhereInWaBySupplier = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await warehouseService.selectWhereInWaBySupplier(id);
  response.status(200).json(results);
};

exports.selectWhereInWc = async (request, response) => {
  // logging

  // call service
  const results = await warehouseService.selectWhereInWc();
  response.status(200).json(results);
};

exports.selectWhereInWcBySupplier = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await warehouseService.selectWhereInWcBySupplier(id);
  response.status(200).json(results);
};

exports.selectWhereInWe = async (request, response) => {
  // logging

  // call service
  const results = await warehouseService.selectWhereInWe();
  response.status(200).json(results);
};

exports.create = async (request, response) => {
  const bodyPalod = request.body;
  // create Model
  const warehouse = new warehouseModel(
    bodyPalod.name, 
    bodyPalod.phone, 
    bodyPalod.address , 
    bodyPalod.storekeeperName,
    bodyPalod.isStock,
    bodyPalod.isGrade,
    bodyPalod.personid, bodyPalod.ipaddress);
  // Validation

  if (!warehouseValidation.isValid(warehouse)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await warehouseService.create(warehouse);

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
  const warehouse = new warehouseModel(
    bodyPalod.name, 
    bodyPalod.phone, 
    bodyPalod.address , 
    bodyPalod.storekeeperName,
    bodyPalod.isStock,
    bodyPalod.isGrade,
    bodyPalod.personid, bodyPalod.ipaddress);
  // Validation

  if (!warehouseValidation.isValid(warehouse)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  warehouse.id = id
  const updateResults = await warehouseService.update(warehouse);
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

  const results = await warehouseService.dalete(bodyPalod);
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
    const results = await warehouseService.restore(bodyPalod);
    if (results === constants.restoreError) {
      return response.status(500).json(constants.restoreError);
    } else if (results === constants.itemNotFound) {
      return response.status(404).json(constants.itemNotFound);
    }

    return response.status(200).json(constants.restoreSuccess);
};