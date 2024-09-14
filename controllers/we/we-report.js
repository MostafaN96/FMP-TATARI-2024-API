// Services
const weReportService = require("../../services/we/we-report");

exports.selectInventoryTotal = async (request, response) => {
  // logging
  const bodyPalod = request.body;

  const results = await weReportService.selectInventoryTotal(bodyPalod);
  response.status(200).json(results);
};

exports.selectInventoryTotalByFabric = async (request, response) => {
  // logging
  const { id } = request.params;

  const results = await weReportService.selectInventoryTotalByFabric(id);
  response.status(200).json(results);
};

exports.selectInventoryDetails = async (request, response) => {
  // logging
  const bodyPalod = request.body;

  const results = await weReportService.selectInventoryDetails(bodyPalod);
  response.status(200).json(results);
};

exports.selectInventoryTotalByDate = async (request, response) => {
  // logging
  const bodyPaylod = request.body;

  const results = await weReportService.selectInventoryTotalByDate(bodyPaylod);
  response.status(200).json(results);
};

exports.selectInventoryDetailsByWarehouseByFabric = async (request, response) => {
  // logging
  const { id } = request.params;
  const { warehouseId } = request.params;

  const results = await weReportService.selectInventoryDetailsByWarehouseByFabric(id, warehouseId);
  response.status(200).json(results);
};

exports.selectPriceWe = async (request, response) => {
  // logging
  const { fabricId } = request.params;
  const { colorId } = request.params;
  const { colorCode } = request.params;

  const results = await weReportService.selectPriceWe(fabricId, colorId, colorCode);
  response.status(200).json(results);
};


exports.dyeingReportByFabric = async (request, response) => {
  const { dyedFabricId } = request.params;

  const results = await weReportService.dyeingReportByFabric(dyedFabricId);
  response.status(200).json(results);
};

exports.dyedFabricReportByOrderBySeller = async (request, response) => {
  // logging
  const { id } = request.params;
  const { sellerId } = request.params;

  const results = await weReportService.dyedFabricReportByOrderBySeller(id, sellerId);
  response.status(200).json(results);
};

exports.salesReport = async (request, response) => {

  const results = await weReportService.salesReport();
  response.status(200).json(results);
};

exports.inquireFabricAvilabilityReportWe = async (request, response) => {
  // logging
  const bodyPalod = request.body;


  const results = await weReportService.inquireFabricAvilabilityReportWe(bodyPalod);
    response.status(200).json(results);
};

exports.inquireFabricAvilabilityTotalReportWe = async (request, response) => {
  // logging
  const bodyPalod = request.body;


  const results = await weReportService.inquireFabricAvilabilityTotalReportWe(bodyPalod);
    response.status(200).json(results);
};

exports.inquireFabricAvilabilityByDyeingOrderRequisitionReportWe = async (request, response) => {
  // logging
  const bodyPalod = request.body;


  const results = await weReportService.inquireFabricAvilabilityByDyeingOrderRequisitionReportWe(bodyPalod);
    response.status(200).json(results);
};

exports.inquireFabricAvilabilityByDyeingOrderRequisitionTotalReportWe = async (request, response) => {
  // logging
  const bodyPalod = request.body;

  const results = await weReportService.inquireFabricAvilabilityByDyeingOrderRequisitionTotalReportWe(bodyPalod);
    response.status(200).json(results);
};