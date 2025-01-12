// Services
const wdReportService = require("../../services/wd/wd-report");

exports.selectInventoryTotal = async (request, response) => {
    // logging
    const bodyPalod = request.body;

    const results = await wdReportService.selectInventoryTotal(bodyPalod);
    response.status(200).json(results);
  };

  exports.selectInventoryTotalByFabricByDyeing = async (request, response) => {
    // logging
    const { id } = request.params;
    const { dyeingId } = request.params;

    const results = await wdReportService.selectInventoryTotalByFabricByDyeing(id, dyeingId);
    response.status(200).json(results);
  };

  exports.selectInventoryDetails = async (request, response) => {
    // logging
    const bodyPalod = request.body;

    const results = await wdReportService.selectInventoryDetails(bodyPalod);
    response.status(200).json(results);
  };

  exports.selectInventoryDetailsByDyeingByFabricByConsigmentDyeing = async (request, response) => {
    // logging
    const { id } = request.params;
    const { fabricId } = request.params;
    const { consigmentDyeingId } = request.params;
    const { fabricOrderId } = request.params;

    const results = await wdReportService.selectInventoryDetailsByDyeingByFabricByConsigmentDyeing(id, fabricId, consigmentDyeingId, fabricOrderId);
    response.status(200).json(results);
  };

  
  exports.selectInventoryTotalByDate = async (request, response) => {
    // logging
    const bodyPalod = request.body;

    const results = await wdReportService.selectInventoryTotalByDate(bodyPalod);
    response.status(200).json(results);
  };

  exports.selectPriceWd = async (request, response) => {
    // logging
    const { fabricId } = request.params;
    const { dyeingId } = request.params;

    const results = await wdReportService.selectPriceWd(fabricId, dyeingId);
    response.status(200).json(results);
  };

  exports.selectPriceByFabricByDyeingByConsigmentDyeingInWd = async (request, response) => {
    // logging
    const { fabricId } = request.params;
    const { dyeingId } = request.params;
    const { consigmentDyeingId } = request.params;

    const results = await wdReportService.selectPriceByFabricByDyeingByConsigmentDyeingInWd(fabricId, dyeingId, consigmentDyeingId);
    response.status(200).json(results);
  };
    
  exports.dyeingReportByDyeing = async (request, response) => {
    const { dyeingId } = request.params;

    const results = await wdReportService.dyeingReportByDyeing(dyeingId);
    response.status(200).json(results);
  };
    
  exports.dyeingReportByDyes = async (request, response) => {

    const results = await wdReportService.dyeingReportByDyes();
    response.status(200).json(results);
  };

  exports.dyeingOrdersReport = async (request, response) => {
    const results = await wdReportService.dyeingOrdersReport();
    response.status(200).json(results);
  };

  
  exports.dyeingOrdersDetailsReport = async (request, response) => {
    const results = await wdReportService.dyeingOrdersDetailsReport();
    response.status(200).json(results);
  };
  
  exports.formReportByFabric = async (request, response) => {
        // logging
    const bodyPalod = request.body;

    const results = await wdReportService.formReportByFabric(bodyPalod);
    response.status(200).json(results);
  };