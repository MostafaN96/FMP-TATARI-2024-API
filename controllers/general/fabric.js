// Validation
const fabricValidation = require("../../validations/general/fabric");

// Services
const fabricService = require("../../services/general/fabric");
const generalService = require("../../services/general/general");

// Util
const fabricTableName = require("../../util/database-tables-name").fabricTableName;
const constants = require("../../util/constants");
const { wcTableName, wcAddRequisitionDetailsTableName, wcAddRequisitionTableName } = require("../../util/database-tables-name");

exports.select = async (request, response) => {
  // logging

  // call service
  const results = await fabricService.select();
  response.status(200).json(results);
};

exports.selectDeleted = async (request, response) => {
  // logging

  // call service
  const results = await fabricService.selectDeleted();
  response.status(200).json(results);
};

exports.selectMaxCode = async (request, response) => {
  // logging

  // call service
  const results = await generalService.selectMaxValueWithCondition(fabricTableName, { code: 'code' }, { is_dyed_fabric: '0' });
  response.status(200).json(results);
};

exports.create = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!fabricValidation.isValid(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await fabricService.create(bodyPalod);

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
  if (!fabricValidation.isValidUpdate(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  bodyPalod.id = id
  const updateResults = await fabricService.update(bodyPalod);
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

  const results = await fabricService.dalete(bodyPalod);
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
    const results = await fabricService.restore(bodyPalod);
    if (results === constants.restoreError) {
      return response.status(500).json(constants.restoreError);
    } else if (results === constants.itemNotFound) {
      return response.status(404).json(constants.itemNotFound);
    }

    return response.status(200).json(constants.restoreSuccess);
};

// Wb

exports.selectFabricToBeManufacturedWb = async (request, response) => {
  // logging
  const { industryId } = request.params;

  // call service
  const results = await fabricService.selectFabricToBeManufacturedWb(industryId);
  response.status(200).json(results);
};

exports.selectFabricsByOrderWc = async (request, response) => {
  // logging
  const { orderRequisitionId } = request.params;

  // call service
  const results = await fabricService.selectFabricsByOrderWc(orderRequisitionId);
  response.status(200).json(results);
};


exports.selectManufacturedFabricWb = async (request, response) => {
  // logging
  const { industryId } = request.params;

  // call service
  const results = await fabricService.selectManufacturedFabricWb(industryId);
  response.status(200).json(results);
};

exports.selectByWarehouseWc = async (request, response) => {
  // logging
  const { id } = request.params;
  const { fabricOrderId } = request.params;

  // call service
  const results = await fabricService.selectByWarehouseWc(id, fabricOrderId);
  response.status(200).json(results);
};

exports.selectStoredFabricsByFabricIdWc = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await fabricService.selectStoredFabricsByFabricIdWc(id);
  response.status(200).json(results);
};


exports.selectStoredWcFabricsBySupplierByWarehouse = async (request, response) => {
  // logging
  const { id } = request.params;
  const { warehouseId } = request.params;

  let whereCluse = {};
    whereCluse[`${fabricTableName}.is_deleted`] = 0;
    whereCluse[`${fabricTableName}.is_active`] = 1;
    whereCluse[`${wcTableName}.is_deleted`] = 0;
    whereCluse[`${wcTableName}.is_active`] = 1;
    whereCluse[`${wcAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    whereCluse[`${wcAddRequisitionTableName}.supplier_id`] = id;

  // call service
  const results = await fabricService.selectStoredWcFabricsForReturn(whereCluse);
  response.status(200).json(results);
};

exports.selectFabricByDyedFabric = async (request, response) => {
  // logging
  const { dyedFabricId } = request.params;

  // call service
  const results = await fabricService.selectFabricByDyedFabric(dyedFabricId);
  response.status(200).json(results);
};
