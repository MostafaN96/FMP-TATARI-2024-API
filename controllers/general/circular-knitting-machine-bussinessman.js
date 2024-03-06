// Services
const circularKnittingMachineBussinessmanService = require("../../services/general/circular-knitting-machine-bussinessman");

// Util
const constants = require("../../util/constants");

exports.select = async (request, response) => {
  // logging

  // call service
  const results = await circularKnittingMachineBussinessmanService.select();
  response.status(200).json(results);
};

exports.selectDeleted = async (request, response) => {
  // logging

  // call service
  const results = await circularKnittingMachineBussinessmanService.selectDeleted();
  response.status(200).json(results);
};

exports.selectByManufacture = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await circularKnittingMachineBussinessmanService.selectByManufacture(id);
  response.status(200).json(results);
};

exports.delete = async (request, response) => {
  // logging
  const bodyPalod = request.body;

  const results = await circularKnittingMachineBussinessmanService.dalete(bodyPalod);
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
    const results = await circularKnittingMachineBussinessmanService.restore(bodyPalod);
    if (results === constants.restoreError) {
      return response.status(500).json(constants.restoreError);
    } else if (results === constants.itemNotFound) {
      return response.status(404).json(constants.itemNotFound);
    }

    return response.status(200).json(constants.restoreSuccess);
};