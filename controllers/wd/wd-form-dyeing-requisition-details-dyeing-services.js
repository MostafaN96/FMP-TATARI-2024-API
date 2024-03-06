// Services
const wdFormDyeingRequisitionDetailsDyeingServicesService = require("../../services/wd/wd-form-dyeing-requisition-details-dyeing-services");

// Util
const constants = require("../../util/constants");

  exports.updateDyeingServcies = async (request, response) => {
    // logging
    const bodyPaylod = request.body;
 
    const updateResults = await wdFormDyeingRequisitionDetailsDyeingServicesService.updateDyeingServcies(bodyPaylod);
    // response
    switch (updateResults) {
      case constants.itemNotFound:
        return response.status(200).json(constants.itemNotFound);
      case constants.updateError:
        return response.status(500).json(constants.updateError);
      case constants.updateSuccess:
        return response.status(200).json(constants.updateSuccess);
        default:
        return response.status(200).json(updateResults);
    }
  };