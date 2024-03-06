// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const wbManufacturingOrderRequisitionTableName = require("../../../util/database-tables-name").wbManufacturingOrderRequisitionTableName;
const { bussinessmanTableName, wbManufacturingOrderRequisitionDetailsTableName, fabricTableName } = require("../../../util/database-tables-name");

exports.insert = async (wbManufacturingOrderRequisition) => {
    let queryResults = false;
    await sqlFun
        .insert(wbManufacturingOrderRequisitionTableName, {
            id: wbManufacturingOrderRequisition.id,
            seller_id: wbManufacturingOrderRequisition.sellerId,
            number: wbManufacturingOrderRequisition.number,
            name: wbManufacturingOrderRequisition.name,
            date: wbManufacturingOrderRequisition.date,
            note: wbManufacturingOrderRequisition.note,
            creator_id: wbManufacturingOrderRequisition.personid,
            ip_address: wbManufacturingOrderRequisition.ipaddress,
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
        .limitedSelect(wbManufacturingOrderRequisitionTableName, ["is_deleted"], whereCluse, 1)
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

    await knex(wbManufacturingOrderRequisitionTableName)
        .select([
            `${wbManufacturingOrderRequisitionTableName}.id`,
            `${wbManufacturingOrderRequisitionTableName}.number`,
            `${wbManufacturingOrderRequisitionTableName}.name`,
            `${wbManufacturingOrderRequisitionTableName}.date`,
            `${wbManufacturingOrderRequisitionTableName}.note`,
            `${bussinessmanTableName}.name as seller_name`,
            `${bussinessmanTableName}.id as seller_id`,
        ])
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wbManufacturingOrderRequisitionTableName}.seller_id`
        )
        .where(whereCluse)
        .orderBy(`${wbManufacturingOrderRequisitionTableName}.number`, 'desc')
        .whereIn(`${wbManufacturingOrderRequisitionTableName}.id`, function() {
            this.select(`${wbManufacturingOrderRequisitionDetailsTableName}.wb_manufacturing_order_requisition_id`)
            .from(`${wbManufacturingOrderRequisitionDetailsTableName}`)
            .where({"is_order": isOrder})
          })
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.update = async (wbManufacturingOrderRequisition, whereCluse) => {
    let queryResults = false;
    await sqlFun
        .update(
            wbManufacturingOrderRequisitionTableName,
            wbManufacturingOrderRequisition,
            whereCluse
        )
        .then((data) => {
            queryResults = true;
        })
        .catch((err) => console.log(err));
    return queryResults;
};
