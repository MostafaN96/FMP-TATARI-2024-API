const deletePayload = {
  is_deleted: "0",
  is_active: "1",
};
const restorePayload = {
  is_deleted: "1",
  is_active: "0",
};

const addType = "add";
const reconcilitionType = "reconcilition";
const transportFromAToBType = "transport_from_a_to_b";
const transportFromBToAType = "transport_from_b_to_a";
const transportBetweenType = "transport_between";
const transportBetweenOrdersType = "transport_between_orders";
const executeOrderType = "execute_order";
const manufactruingType = "manufacturing";
const dyeingType = "dyeing";
const returnSellType = "return_sell";

module.exports = {
  deletePayload,
  restorePayload,
  addType,
  reconcilitionType,
  transportFromAToBType,
  transportFromBToAType,
  transportBetweenType,
  transportBetweenOrdersType,
  manufactruingType,
  executeOrderType,
  dyeingType,
  returnSellType,
};
