// Services
const wbReportService = require("../../services/wb/wb-report");

exports.selectInventoryTotal = async (request, response) => {
    // logging
    const bodyPalod = request.body;

    const results = await wbReportService.selectInventoryTotal(bodyPalod);
    response.status(200).json(results);
  };

  exports.selectInventoryTotalByYarnByIndustry = async (request, response) => {
    // logging
    const { id } = request.params;
    const { yarnId } = request.params;

    const results = await wbReportService.selectInventoryTotalByYarnByIndustry(id, yarnId);
    response.status(200).json(results);
  };

  exports.selectInventoryDetails = async (request, response) => {
    // logging
    const bodyPalod = request.body;

    const results = await wbReportService.selectInventoryDetails(bodyPalod);
    response.status(200).json(results);
  };

  exports.selectInventoryDetailsByIndustryByYarnByLot = async (request, response) => {
    // logging
    const { id } = request.params;
    const { yarnId } = request.params;
    const { yarnLotId } = request.params;
    const { consigmentYarnId } = request.params;
    const { yarnOrderId } = request.params;

    const results = await wbReportService.selectInventoryDetailsByIndustryByYarnByLot(id, yarnId, yarnLotId, consigmentYarnId, yarnOrderId);
    response.status(200).json(results);
  };

  exports.selectInventoryTotalByDate = async (request, response) => {
    // logging
    const bodyPalod = request.body;

    const results = await wbReportService.selectInventoryTotalByDate(bodyPalod);
    response.status(200).json(results);
  };
  
  exports.selectPriceWb = async (request, response) => {
    // logging
    const { yarnId } = request.params;
    const { industryId } = request.params;

    const results = await wbReportService.selectPriceWb(yarnId, industryId);
    response.status(200).json(results);
  };
  
  exports.selectPriceByYarnIdByIndustryIdByConsigmentWb = async (request, response) => {
    // logging
    const { yarnId } = request.params;
    const { industryId } = request.params;
    const { consigmentYarnId } = request.params;

    const results = await wbReportService.selectPriceByYarnIdByIndustryIdByConsigmentWb(yarnId, industryId, consigmentYarnId);
    response.status(200).json(results);
  };

  exports.circularKnittingMachineManufacturingReport = async (request, response) => {
    const results = await wbReportService.circularKnittingMachineManufacturingReport();
    response.status(200).json(results);
  };

  exports.circularKnittingMachineReport = async (request, response) => {
    const results = await wbReportService.circularKnittingMachineReport();
    response.status(200).json(results);
  };

  exports.manufacturingOrdersReport = async (request, response) => {
    const results = await wbReportService.manufacturingOrdersReport();
    response.status(200).json(results);
  };

  exports.manufacturingOrdersDetailsReport = async (request, response) => {
    const results = await wbReportService.manufacturingOrdersDetailsReport();
    response.status(200).json(results);
  };

  exports.selectByFabricByConsigmentManufacturing = async (request, response) => {
    // logging
    const { id } = request.params;
    const { consigmentManufacturingId } = request.params;
  
    // call service
    const results = await wbReportService.selectByFabricByConsigmentManufacturing(id, consigmentManufacturingId);
    response.status(200).json(results);
  };