// Services
const waReportService = require("../../services/wa/wa-report");

exports.selectInventoryTotal = async (request, response) => {
    // logging
    const bodyPalod = request.body;

    const results = await waReportService.selectInventoryTotal(bodyPalod);
    response.status(200).json(results);
  };

  exports.selectInventoryTotalByYarnByWarehouse = async (request, response) => {
    // logging
    const { id } = request.params;
    const { warehouseId } = request.params;

    const results = await waReportService.selectInventoryTotalByYarnByWarehouse(id, warehouseId);
    response.status(200).json(results);
  };

  exports.selectInventoryDetails = async (request, response) => {
    // logging
    const bodyPalod = request.body;

    const results = await waReportService.selectInventoryDetails(bodyPalod);
    response.status(200).json(results);
  };

  exports.selectInventoryDetails = async (request, response) => {
    // logging
    const bodyPalod = request.body;

    const results = await waReportService.selectInventoryDetails(bodyPalod);
    response.status(200).json(results);
  };

  exports.selectInventoryDetailsByWarehouseByYarnByLot = async (request, response) => {
    // logging
    const { id } = request.params;
    const { yarnId } = request.params;
    const { yarnLotId } = request.params;
    const { consigmentYarnId } = request.params;
    const { yarnOrderId } = request.params;

    const results = await waReportService.selectInventoryDetailsByWarehouseByYarnByLot(id, yarnId, yarnLotId, consigmentYarnId, yarnOrderId);
    response.status(200).json(results);
  };

  exports.selectInventoryTotalByDate = async (request, response) => {
    // logging
    const bodyPalod = request.body;

    const results = await waReportService.selectInventoryTotalByDate(bodyPalod);
    response.status(200).json(results);
  };

  exports.selectPriceWa = async (request, response) => {
    // logging
    const { yarnId } = request.params;
    const { consigmentYarnId } = request.params;

    const results = await waReportService.selectPriceWa(yarnId, consigmentYarnId);
    response.status(200).json(results);
  };

  exports.purchasesByYarn = async (request, response) => {
    // logging
    const { yarnId } = request.params;

    const results = await waReportService.purchasesByYarn(yarnId);
    response.status(200).json(results);
  };

  exports.purchasesBySupplier = async (request, response) => {
    // logging
    const { supplierId } = request.params;

    const results = await waReportService.purchasesBySupplier(supplierId);
    response.status(200).json(results);
  };
  
  exports.purchasesBySuppliers = async (request, response) => {
    const results = await waReportService.purchasesBySuppliers();
    response.status(200).json(results);
  };