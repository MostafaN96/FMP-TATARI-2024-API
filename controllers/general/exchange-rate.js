// Validation
const exchangeRateValidation = require("../../validations/general/exchange-rate");

// Services
const exchangeRateService = require("../../services/general/exchange-rate");

// Util
const constants = require("../../util/constants");

exports.select = async (request, response) => {
  // logging

  // call service
  const results = await exchangeRateService.select();
  response.status(200).json(results);
};

exports.insert = async (request, response) => {
  // logging
  const bodyPalod = request.body;

  // Validation
  if (!exchangeRateValidation.isValid(bodyPalod)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  const updateResults = await exchangeRateService.create(bodyPalod);
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