// Services
const wcService = require("../../services/wc/wc");


exports.selectConsigmentManufacturingQuantityByWarehouseByFabricWc = async (request, response) => {
    // logging
    const { warehouseId } = request.params;
    const { fabricId } = request.params;
  
    // call service
    const results = await wcService.selectConsigmentManufacturingQuantityByWarehouseByFabricWc(warehouseId, fabricId);
    response.status(200).json(results);
  };
  
exports.selectConsigmentManufacturingQuantityByWarehouseByFabricForReturn = async (request, response) => {
  // logging
  const { id } = request.params;
  const { warehouseId } = request.params;
  const { fabricId } = request.params;

  // call service
  const results = await wcService.selectConsigmentManufacturingQuantityByWarehouseByFabricForReturn(id, warehouseId, fabricId);
  response.status(200).json(results);
};