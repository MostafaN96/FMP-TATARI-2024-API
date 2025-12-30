// Services
const waService = require("../../services/wa/wa");


exports.selectYarnLotQuantityByWarehouseByYarnByLotWa = async (request, response) => {
    // logging
    const { warehouseId } = request.params;
    const { yarnId } = request.params;
    const { yarnLotId } = request.params;
    const { yarnOrderId } = request.params;
  
    // call service
    const results = await waService.selectYarnLotQuantityByWarehouseByYarnByLotWa(warehouseId, yarnId, yarnLotId, yarnOrderId);
    response.status(200).json(results);
  };

exports.selectYarnLotQuantityByWarehouseByYarnByLotForReturn = async (request, response) => {
    // logging
    const { id } = request.params;
    const { warehouseId } = request.params;
    const { yarnId } = request.params;
    const { yarnLotId } = request.params;
    const { yarnOrderId } = request.params;

    // call service
    const results = await waService.selectYarnLotQuantityByWarehouseByYarnByLotForReturn(id, warehouseId, yarnId, yarnLotId, yarnOrderId);
    response.status(200).json(results);
  };