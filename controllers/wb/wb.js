// Validation
const wbValidation = require("../../validations/wb/wb");

// Services
const wbService = require("../../services/wb/wb");

// Util
const constants = require("../../util/constants");

exports.selectConsigmentYarnQuantityByYarnByIndustryByLotWb = async (request, response) => {
  // logging
  const { yarnId } = request.params;
  const { industryId } = request.params;
  const { yarnLotId } = request.params;
  const { yarnOrderId } = request.params;

  // call service
  const results = await wbService.selectConsigmentYarnQuantityByYarnByIndustryByLotWb(
    yarnId, 
    industryId, 
    yarnLotId,
    yarnOrderId
  );
  response.status(200).json(results);
};

exports.selectNotIncludedYarnLotQuantityByYarnByIndustryWb = async (request, response) => {
  // logging
  const { yarnId } = request.params;
  const { industryId } = request.params;
  const includedYarnLots = request.body.yarnLots

  // call service
  const results = await wbService.selectNotIncludedYarnLotQuantityByYarnByIndustryWb(yarnId, industryId, includedYarnLots);
  response.status(200).json(results);
};

exports.selectQuantityByIndustryWb = async (request, response) => {
  // logging
  const { industryId } = request.params;

  // call service
  const results = await wbService.selectQuantityByIndustryWb(industryId);
  response.status(200).json(results);
};

exports.selectQuantityandFabricToBeManufacturedByIndustryWb = async (request, response) => {
  // logging
  const { industryId } = request.params;

  // call service
  const results = await wbService.selectQuantityandFabricToBeManufacturedByIndustryWb(industryId);
  response.status(200).json(results);
};

exports.selectByIndustryByNeededFabricToBeManufacturedNotIncludedYarnsAndLotsWb = async (request, response) => {
  // logging
  const { industryId } = request.params;
  const { neededFabricId } = request.params;
  const includedYarns = request.body.yarns
  const includedYarnLots = request.body.yarnLots
  const includedConsigmentYarn = request.body.consigmentsYarn

  // call service
  const results = await wbService.selectByIndustryByNeededFabricToBeManufacturedNotIncludedYarnsAndLotsWb(industryId, neededFabricId, includedYarns, includedYarnLots, includedConsigmentYarn);
  response.status(200).json(results);
};

exports.selectFabricToBeManufacturedByIndustryWb = async (request, response) => {
  // logging
  const { industryId } = request.params;

  // call service
  const results = await wbService.selectFabricToBeManufacturedByIndustryWb(industryId);
  response.status(200).json(results);
};

exports.selectQuantityByIndustryByFabricWb = async (request, response) => {
  // logging
  const { industryId } = request.params;
  const { fabricId } = request.params;
  const { yarnOrderId } = request.params;

  // call service
  const results = await wbService.selectQuantityByIndustryByFabricWb(industryId, fabricId, yarnOrderId);
  response.status(200).json(results);
};

exports.updateFabricToBeManufactured = async (request, response) => {
  // logging
  const { id } = request.params;
  const bodyPalod = request.body;

  // Validation
  if (!wbValidation.isValidUpdateFabricToBeManufactured(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  bodyPalod.id = id;
  const updateResults = await wbService.updateFabricToBeManufactured(bodyPalod);
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