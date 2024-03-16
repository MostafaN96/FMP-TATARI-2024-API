// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { bussinessmanTableName, waPurchaseOrderDetailsTableName, 
    waPurchaseOrderTableName,
    fabricTableName } = require("../../../util/database-tables-name");

exports.insert = async (waPurchaseOrder) => {
    let queryResults = false;
    await sqlFun
        .insert(waPurchaseOrderTableName, {
            id: waPurchaseOrder.id,
            number: waPurchaseOrder.number,
            name: waPurchaseOrder.name,
            date: waPurchaseOrder.date,
            note: waPurchaseOrder.note,
            creator_id: waPurchaseOrder.personid,
            ip_address: waPurchaseOrder.ipaddress,
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
        .limitedSelect(waPurchaseOrderTableName, ["is_deleted"], whereCluse, 1)
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

    await knex(waPurchaseOrderTableName)
        .select([
            `${waPurchaseOrderTableName}.id`,
            `${waPurchaseOrderTableName}.number`,
            `${waPurchaseOrderTableName}.name`,
            `${waPurchaseOrderTableName}.date`,
            `${waPurchaseOrderTableName}.note`,
        ])
        .where(whereCluse)
        .orderBy(`${waPurchaseOrderTableName}.number`, 'desc')
        .whereIn(`${waPurchaseOrderTableName}.id`, function() {
            this.select(`${waPurchaseOrderDetailsTableName}.wa_add_purchase_order_id`)
            .from(`${waPurchaseOrderDetailsTableName}`)
            .where({"is_order": isOrder})
          })
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.update = async (waPurchaseOrder, whereCluse) => {
    let queryResults = false;
    await sqlFun
        .update(
            waPurchaseOrderTableName,
            waPurchaseOrder,
            whereCluse
        )
        .then((data) => {
            queryResults = true;
        })
        .catch((err) => console.log(err));
    return queryResults;
};
