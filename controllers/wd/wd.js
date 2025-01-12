// Validation
// const wdValidation = require("../../validations/wd/wd");

// Services
const wdService = require("../../services/wd/wd");

// Util
// const constants = require("../../util/constants");

exports.selectConsigmentDyeingQuantityByFabricByDyeingWd = async (request, response) => {
  // logging
  const { fabricId } = request.params;
  const { dyeingId } = request.params;
  const { fabricOrderId } = request.params;

  // call service
  const results = await wdService.selectConsigmentDyeingQuantityByFabricByDyeingWd(
    fabricId, 
    dyeingId, 
    fabricOrderId
  );
  response.status(200).json(results);
};

exports.selectQuantityByDyeingWd = async (request, response) => {
  // logging
  const { dyeingId } = request.params;

  const groupBy = [
    `fabric_id`, 
    `consigment_dyeing_id`, 
    `wc_fabric_order_requisition_id`
  ]

  // call service
  const results = await wdService.selectQuantityByDyeingWd(dyeingId, groupBy.toString().split(','));
  response.status(200).json(results);
};

exports.selectQuantityByDyeingByFabricOrderWd = async (request, response) => {
  // logging
  const { dyeingId } = request.params;
  const { fabricOrderId } = request.params;

  const groupBy = [
    `fabric_id`, 
    `consigment_dyeing_id`, 
    `wc_fabric_order_requisition_id`
  ]

  // call service
  const results = await wdService.selectQuantityByDyeingByFabricOrderWd(dyeingId, fabricOrderId, groupBy.toString().split(','));
  response.status(200).json(results);
};

exports.selectQuantityByDyeingGroupByFabricWd = async (request, response) => {
  // logging
  const { dyeingId } = request.params;
  const groupBy = [`fabric_id`]

  // call service
  const results = await wdService.selectQuantityByDyeingWd(dyeingId, groupBy.toString().split(','));
  response.status(200).json(results);
};