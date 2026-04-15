// ValidationwaCottonSellRequisitionService
const wdTransportWcWdDetailsValidation = require("../../validations/wd/wd-transport-wc-wd");

// Services
const wdTransportWcWdService = require("../../services/wd/wd-transport-wc-wd");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
    const bodyPalod = request.body;

    // Validation
    if (!wdTransportWcWdDetailsValidation.isValid(bodyPalod)) {
        // logging
        return response.status(400).json(constants.invalidDataResponse);
    }
    //   send data to service
    const results = await wdTransportWcWdService.create(bodyPalod);

    if (results === constants.insertError) {
        return response.status(500).json(results);
    } else if (results === constants.duplicatedData) {
        return response.status(200).json(constants.duplicatedData);
    } else if (results === constants.invalidDataResponse) {
        return response.status(400).json(constants.invalidDataResponse);
    } else {
        return response.status(201).json(results);
    }
};

exports.select = async (request, response) => {
    // logging
  
    // call service
    const results = await wdTransportWcWdService.select();
    response.status(200).json(results);
  };

exports.selectAllLazy = async (request, response) => {
  const results = await wdTransportWcWdService.selectAllLazy(request.body);
  response.status(200).json(results);
};