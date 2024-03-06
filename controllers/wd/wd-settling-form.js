// ValidationwaCottonSellRequisitionService
const wdSettlingFormValidation = require("../../validations/wd/wd-settling-form");

// Services
const wdSettlingFormService = require("../../services/wd/wd-settling-form");

// Util
const constants = require("../../util/constants");

exports.create = async (request, response) => {
    const bodyPalod = request.body;

    // Validation
    if (!wdSettlingFormValidation.isValid(bodyPalod)) {
        // logging
        return response.status(400).json(constants.invalidDataResponse);
    }
    //   send data to service
    const results = await wdSettlingFormService.create(bodyPalod);

    if(results) {
        return response.status(200).json(constants.updateSuccess);
    }else if (results === constants.insertError) {
        return response.status(500).json(results);
    } else if (results === constants.duplicatedData) {
        return response.status(200).json(constants.duplicatedData);
    } else if (results === constants.invalidDataResponse) {
        return response.status(400).json(constants.invalidDataResponse);
    } else {
        return response.status(201).json(results);
    }
};