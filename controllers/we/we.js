// Services
const weService = require("../../services/we/we");

exports.selectStoreWe = async (request, response) => {
  // call service
  const results = await weService.selectStoreWe();
  response.status(200).json(results);
};

exports.selectStoreBySupplierForReturnWe = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await weService.selectStoreBySupplierForReturnWe(id);
  response.status(200).json(results);
};

exports.selectSoldedBySellerForReturnSellWe = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await weService.selectSoldedBySellerForReturnSellWe(id);
  response.status(200).json(results);
};

exports.selectStoreWithDyeingServicesWe = async (request, response) => {
  // call service
  const results = await weService.selectStoreWithDyeingServicesWe();
  response.status(200).json(results);
};

exports.selectStoreForDirectSellWe = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await weService.selectStoreForDirectSellWe(id);
  response.status(200).json(results);
};

exports.update = async (request, response) => {
  // logging
  const bodyPalod = request.body;

  // call service
  const results = await weService.update(bodyPalod);
  response.status(200).json(results);
};