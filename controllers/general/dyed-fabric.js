
// Validation
const dyedFabricValidation = require("../../validations/general/dyed-fabric");

// Services
const dyedFabricService = require("../../services/general/dyed-fabric");
const generalService = require("../../services/general/general");

// Util
const fabricTableName = require("../../util/database-tables-name").fabricTableName;
const constants = require("../../util/constants");

exports.select = async (request, response) => {
  // logging

  // call service
  const results = await dyedFabricService.select();
  response.status(200).json(results);
};

exports.selectDeleted = async (request, response) => {
  // logging

  // call service
  const results = await dyedFabricService.selectDeleted();
  response.status(200).json(results);
};

exports.selectMaxCode = async (request, response) => {
  // logging

  // call service
  const results = await generalService.selectMaxValueWithCondition(fabricTableName, 
    { code: 'code' }, {
        is_dyed_fabric: '1'
    });
  response.status(200).json(results);
};

exports.selectDyedFabric = async (request, response) => {
  // call service
  const results = await dyedFabricService.selectDyedFabric();
  response.status(200).json(results);
};

exports.create = async (request, response) => {
  const bodyPalod = request.body;

  // Validation
  if (!dyedFabricValidation.isValid(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await dyedFabricService.create(bodyPalod);

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
  if (!dyedFabricValidation.isValid(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  bodyPalod.id = id
  const updateResults = await dyedFabricService.update(bodyPalod);
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

  const results = await dyedFabricService.dalete(bodyPalod);
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
    const results = await dyedFabricService.restore(bodyPalod);
    if (results === constants.restoreError) {
      return response.status(500).json(constants.restoreError);
    } else if (results === constants.itemNotFound) {
      return response.status(404).json(constants.itemNotFound);
    }

    return response.status(200).json(constants.restoreSuccess);
};