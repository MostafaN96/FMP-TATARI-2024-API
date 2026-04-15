// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { weDyedFabricOrderRequisitionTableName, bussinessmanTableName, 
    weDyedFabricOrderRequisitionDetailsTableName, 
    waYarnOrderRequisitionTableName} = require("../../../util/database-tables-name");

exports.insert = async (weDyedFabricOrderRequisition) => {
    let queryResults = false;
    await sqlFun
        .insert(weDyedFabricOrderRequisitionTableName, {
            id: weDyedFabricOrderRequisition.id,
            orders_requisitions_id: weDyedFabricOrderRequisition.ordersRequisitionsId,
            seller_id: weDyedFabricOrderRequisition.sellerId,
            name: weDyedFabricOrderRequisition.name,
            number: weDyedFabricOrderRequisition.number,
            date: weDyedFabricOrderRequisition.date,
            note: weDyedFabricOrderRequisition.note,
            creator_id: weDyedFabricOrderRequisition.personid,
            ip_address: weDyedFabricOrderRequisition.ipaddress,
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
        .limitedSelect(
            weDyedFabricOrderRequisitionTableName, 
            [
                "orders_requisitions_id", 
                "is_deleted"
            ], 
            whereCluse, 
            1)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => {
            console.log(error);
        });

    return queryResults;
};

exports.select = async (whereCluse, isOrder) => {
    let queryResults = [];

    await knex(weDyedFabricOrderRequisitionTableName)
        .select([
            `${weDyedFabricOrderRequisitionTableName}.id`,
            `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
            `${weDyedFabricOrderRequisitionTableName}.number`,
            `${weDyedFabricOrderRequisitionTableName}.name`,
            `${weDyedFabricOrderRequisitionTableName}.date`,
            `${weDyedFabricOrderRequisitionTableName}.note`,
            `${bussinessmanTableName}.name as seller_name`,
            `${bussinessmanTableName}.id as seller_id`,
            // `${ordersRequisitionsTableName}.wa_yarn_order_requisition_id`,
            // `${ordersRequisitionsTableName}.wb_manufacturing_order_requisition_id`,
        ])
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${weDyedFabricOrderRequisitionTableName}.seller_id`
        )
        .where(whereCluse)
        .orderBy(`${weDyedFabricOrderRequisitionTableName}.number`, 'desc')
        .groupBy(`${weDyedFabricOrderRequisitionTableName}.id`)
        .whereIn(`${weDyedFabricOrderRequisitionTableName}.id`, function() {
            this.select(`${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
            .from(`${weDyedFabricOrderRequisitionDetailsTableName}`)
            .where({"is_order": isOrder})
          })
        .then((data) => {
            // console.log("weDyedFabricOrderRequisitionTableName => :::: data", data);
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.selectForAddPurchaseWa = async (whereCluse, isOrder) => {
    let queryResults = [];

    await knex(weDyedFabricOrderRequisitionTableName)
        .select([
            `${weDyedFabricOrderRequisitionTableName}.id`,
            `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
            `${weDyedFabricOrderRequisitionTableName}.number`,
            `${weDyedFabricOrderRequisitionTableName}.name`,
            `${weDyedFabricOrderRequisitionTableName}.date`,
            `${weDyedFabricOrderRequisitionTableName}.note`,
            `${bussinessmanTableName}.name as seller_name`,
            `${bussinessmanTableName}.id as seller_id`,
            // `${ordersRequisitionsTableName}.wa_yarn_order_requisition_id`,
            // `${ordersRequisitionsTableName}.wb_manufacturing_order_requisition_id`,
        ])
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${weDyedFabricOrderRequisitionTableName}.seller_id`
        )
        .where(whereCluse)
        .orderBy(`${weDyedFabricOrderRequisitionTableName}.number`, 'desc')
        .groupBy(`${weDyedFabricOrderRequisitionTableName}.id`)
        .whereIn(`${weDyedFabricOrderRequisitionTableName}.id`, function() {
            this.select(`${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
            .from(`${weDyedFabricOrderRequisitionDetailsTableName}`)
            .where({"is_order": isOrder})
          })
          .whereIn(`${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`, function() {
            this.select(`${waYarnOrderRequisitionTableName}.orders_requisitions_id`)
            .from(`${waYarnOrderRequisitionTableName}`)
            .where({"is_order": isOrder})
          })
        .then((data) => {
            // console.log("weDyedFabricOrderRequisitionTableName => :::: data", data);
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.update = async (weDyedFabricOrderRequisition, whereCluse) => {
    let queryResults = false;
    await sqlFun
        .update(
            weDyedFabricOrderRequisitionTableName,
            weDyedFabricOrderRequisition,
            whereCluse
        )
        .then((data) => {
            queryResults = true;
        })
        .catch((err) => console.log(err));
    return queryResults;
};

exports.selectByWcFabricOrderIds = async (wcFabricOrderIds, dyedFabricId) => {
    let queryResults = [];
    const wcFabricOrderRequisitionTableName = 'wc_fabric_order_requisition';

    const query = knex(weDyedFabricOrderRequisitionTableName)
        .distinct([
            `${weDyedFabricOrderRequisitionTableName}.id`,
            `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
            `${weDyedFabricOrderRequisitionTableName}.number`,
            `${weDyedFabricOrderRequisitionTableName}.name`,
            `${weDyedFabricOrderRequisitionTableName}.date`,
            `${weDyedFabricOrderRequisitionTableName}.seller_id`
        ])
        .innerJoin(
            wcFabricOrderRequisitionTableName,
            `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
            `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`
        )
        .innerJoin(
            weDyedFabricOrderRequisitionDetailsTableName,
            `${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`,
            `${weDyedFabricOrderRequisitionTableName}.id`
        )
        .whereIn(`${wcFabricOrderRequisitionTableName}.parent_wc_fabric_order_requisition_id`, wcFabricOrderIds)
        .where({
            [`${weDyedFabricOrderRequisitionTableName}.is_deleted`]: 0,
            [`${weDyedFabricOrderRequisitionTableName}.is_active`]: 1,
            [`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`]: 0,
            [`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`]: 1,
            [`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`]: 1
        });

    if (dyedFabricId) {
        query.andWhere(`${weDyedFabricOrderRequisitionDetailsTableName}.dyed_fabric_id`, dyedFabricId);
    }

    await query
        .orderBy(`${weDyedFabricOrderRequisitionTableName}.date`, 'desc')
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));

    return queryResults;
};

exports.selectByOrdersRequisitionsIds = async (ordersRequisitionsIds) => {
    let queryResults = [];

    await knex(weDyedFabricOrderRequisitionTableName)
        .distinct([
            `${weDyedFabricOrderRequisitionTableName}.id`,
            `${weDyedFabricOrderRequisitionTableName}.number`,
            `${weDyedFabricOrderRequisitionTableName}.name`,
            `${weDyedFabricOrderRequisitionTableName}.date`,
            `${weDyedFabricOrderRequisitionTableName}.seller_id`
        ])
        .whereIn(`${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`, ordersRequisitionsIds)
        .where({
            [`${weDyedFabricOrderRequisitionTableName}.is_deleted`]: 0,
            [`${weDyedFabricOrderRequisitionTableName}.is_active`]: 1
        })
        .orderBy(`${weDyedFabricOrderRequisitionTableName}.date`, 'desc')
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    
    return queryResults;
};
