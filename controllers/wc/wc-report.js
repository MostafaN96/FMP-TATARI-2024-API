// Services
const wcReportService = require("../../services/wc/wc-report");

exports.selectInventoryTotal = async (request, response) => {
    // logging
    const bodyPalod = request.body;

    const results = await wcReportService.selectInventoryTotal(bodyPalod);
    response.status(200).json(results);
  };

  exports.selectInventoryTotalByFabric = async (request, response) => {
    // logging
    const { id } = request.params;

    const results = await wcReportService.selectInventoryTotalByFabric(id);
    response.status(200).json(results);
  };

  exports.selectInventoryDetails = async (request, response) => {
    // logging
    const bodyPalod = request.body;

    const results = await wcReportService.selectInventoryDetails(bodyPalod);
    response.status(200).json(results);
  };

  exports.selectInventoryDetailsByWarehouseByFabricByConsigmentManufacturing = async (request, response) => {
    // logging
    const { id } = request.params;
    const { warehouseId } = request.params;
    const { consigmentManufacturingId } = request.params;
    const { fabricOrderId } = request.params;

    const results = await wcReportService.selectInventoryDetailsByWarehouseByFabricByConsigmentManufacturing(id, warehouseId, consigmentManufacturingId, fabricOrderId);
    response.status(200).json(results);
  };

  exports.selectInventoryTotalByDate = async (request, response) => {
    // logging
    const bodyPalod = request.body;

    const results = await wcReportService.selectInventoryTotalByDate(bodyPalod);
    response.status(200).json(results);
  };

  exports.selectPriceWc = async (request, response) => {
    // logging
    const { fabricId } = request.params;

    const results = await wcReportService.selectPriceWc(fabricId);
    response.status(200).json(results);
  };

  exports.selectPriceByFabricByConsigmentManufacturingInWc = async (request, response) => {
    // logging
    const { fabricId } = request.params;
    const { consigmentManufacturingId } = request.params;

    const results = await wcReportService.selectPriceByFabricByConsigmentManufacturingInWc(fabricId, consigmentManufacturingId);
    response.status(200).json(results);
  };

  exports.purchasesByFabric = async (request, response) => {
    // logging
    const { fabricId } = request.params;

    const results = await wcReportService.purchasesByFabric(fabricId);
    response.status(200).json(results);
  };

  exports.purchasesBySupplier = async (request, response) => {
    // logging
    const { supplierId } = request.params;

    const results = await wcReportService.purchasesBySupplier(supplierId);
    response.status(200).json(results);
  };
  
  exports.purchasesBySuppliers = async (request, response) => {
    const results = await wcReportService.purchasesBySuppliers();
    response.status(200).json(results);
  };

  
  exports.manufacturingReportByFabric = async (request, response) => {
    const { fabricId } = request.params;

    const results = await wcReportService.manufacturingReportByFabric(fabricId);
    response.status(200).json(results);
  };
  
  exports.fabricOrdersReport = async (request, response) => {
  
    const results = await wcReportService.fabricOrdersReport();
    response.status(200).json(results);
  };