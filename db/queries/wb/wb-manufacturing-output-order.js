// Config
const sqlFun = require("../../config/sql-fun");

// Util
const { wbManufacturingOutputOrderTableName } = require("../../../util/database-tables-name");

exports.insert = async (wbManufacturingOutputOrder, itemsOrder) => {
    let queryResults = false;
    await sqlFun
        .insert(wbManufacturingOutputOrderTableName, {
            wb_manufacturing_output_id: wbManufacturingOutputOrder.wbManufacturingOutputId,
            wb_manufacturing_order_requisition_details_id: itemsOrder.manufacturingOrderRequisitionDetailsId,
            wb_manufacturing_order_requisition_id: itemsOrder.manufacturingOrderRequisitionId,
            quantity: itemsOrder.quantity,
            creator_id: wbManufacturingOutputOrder.personid,
            ip_address: wbManufacturingOutputOrder.ipaddress,
        })
        .then((data) => {
            queryResults = true;
        })
        .catch((error) => {
            console.log(error);
        });
    return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
      .limitedSelect(wbManufacturingOutputOrderTableName, ["id", "quantity"], whereCluse, 1)
      .then((data) => {
          queryResults = data;
      })
      .catch((error) => {
          console.log(error);
      });

  return queryResults;
};

exports.update = async (wbManufacturingOutputOrder, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wbManufacturingOutputOrderTableName,
        wbManufacturingOutputOrder,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };
