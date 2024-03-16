// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { ordersRequisitionsTableName, waYarnOrderRequisitionTableName, waYarnOrderRequisitionDetailsTableName } = require("../../../util/database-tables-name");

exports.insertForDyeingOrder = async (orderRequisitions) => {
    let queryResults = false;
    await sqlFun
        .insert(ordersRequisitionsTableName, {
            wd_form_dyeing_order_requisition_id: orderRequisitions.id,
            creator_id: orderRequisitions.personid,
            ip_address: orderRequisitions.ipaddress
        })
        .then((data) => {
            queryResults = true;
        })
        .catch((error) => {
            console.log(error);
        });
    return queryResults;
};

exports.insertForYarnOrder = async (orderRequisitions) => {
    let queryResults = false;
    await sqlFun
        .insert(ordersRequisitionsTableName, {
            wa_yarn_order_requisition_id: orderRequisitions.id,
            we_dyed_fabric_order_requisition_id: orderRequisitions.orderId,
            creator_id: orderRequisitions.personid,
            ip_address: orderRequisitions.ipaddress
        })
        .then((data) => {
            queryResults = true;
        })
        .catch((error) => {
            console.log(error);
        });
    return queryResults;
};

exports.insertForWcFabricOrder = async (orderRequisitions) => {
    let queryResults = false;
    await sqlFun
        .insert(ordersRequisitionsTableName, {
            wc_fabric_order_requisition_id: orderRequisitions.id,
            we_dyed_fabric_order_requisition_id: orderRequisitions.orderId,
            creator_id: orderRequisitions.personid,
            ip_address: orderRequisitions.ipaddress
        })
        .then((data) => {
            queryResults = true;
        })
        .catch((error) => {
            console.log(error);
        });
    return queryResults;
};

exports.insertForDyedFabricOrderwe = async (orderRequisitions) => {
    let queryResults = false;
    await sqlFun
        .insert(ordersRequisitionsTableName, {
            we_dyed_fabric_order_requisition_id: orderRequisitions.id,
            creator_id: orderRequisitions.personid,
            ip_address: orderRequisitions.ipaddress
        })
        .then((data) => {
            queryResults = true;
        })
        .catch((error) => {
            console.log(error);
        });
    return queryResults;
};
exports.update = async (orderRequisitions, whereCluse) => {
    let queryResults = false;
    await sqlFun
        .update(
            ordersRequisitionsTableName,
            orderRequisitions,
            whereCluse
        )
        .then((data) => {
            queryResults = true;
        })
        .catch((err) => console.log(err));
    return queryResults;
};

exports.selectByDyeingIdForYarnOrder = async (whereCluse) => {
    let queryResults = [];

  
    await knex.from(ordersRequisitionsTableName)
      .select(
        [
          `${ordersRequisitionsTableName}.wa_yarn_order_requisition_id`,
          `${waYarnOrderRequisitionTableName}.name as order_name`,
          `${waYarnOrderRequisitionTableName}.number as order_number`,
        ],
      )
      .max(`${waYarnOrderRequisitionDetailsTableName}.is_order as is_order`)
      .innerJoin(`${waYarnOrderRequisitionTableName}`, 
      `${waYarnOrderRequisitionTableName}.id`, 
      `${ordersRequisitionsTableName}.wa_yarn_order_requisition_id`)
      .innerJoin(`${waYarnOrderRequisitionDetailsTableName}`, 
      `${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`, 
      `${waYarnOrderRequisitionTableName}.id`)
      .groupBy(`${waYarnOrderRequisitionTableName}.id`)
      .where(whereCluse)
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => console.error(error));
    return queryResults;
  };
  