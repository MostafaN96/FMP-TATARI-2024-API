// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { bussinessmanTableName, wcFabricOrderRequisitionDetailsTableName, 
    wcFabricOrderRequisitionTableName,
    fabricTableName } = require("../../../util/database-tables-name");

exports.insert = async (wcFabricOrderRequisition) => {
    let queryResults = false;
    await sqlFun
        .insert(wcFabricOrderRequisitionTableName, {
            id: wcFabricOrderRequisition.id,
            seller_id: wcFabricOrderRequisition.sellerId,
            number: wcFabricOrderRequisition.number,
            name: wcFabricOrderRequisition.name,
            date: wcFabricOrderRequisition.date,
            note: wcFabricOrderRequisition.note,
            creator_id: wcFabricOrderRequisition.personid,
            ip_address: wcFabricOrderRequisition.ipaddress,
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
        .limitedSelect(wcFabricOrderRequisitionTableName, ["is_deleted"], whereCluse, 1)
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

    await knex(wcFabricOrderRequisitionTableName)
        .select([
            `${wcFabricOrderRequisitionTableName}.id`,
            `${wcFabricOrderRequisitionTableName}.number`,
            `${wcFabricOrderRequisitionTableName}.name`,
            `${wcFabricOrderRequisitionTableName}.date`,
            `${wcFabricOrderRequisitionTableName}.note`,
            `${wcFabricOrderRequisitionTableName}.is_order`,
            `${bussinessmanTableName}.name as seller_name`,
            `${bussinessmanTableName}.id as seller_id`,
        ])
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wcFabricOrderRequisitionTableName}.seller_id`
        )
        .where(whereCluse)
        .orderBy(`${wcFabricOrderRequisitionTableName}.number`, 'desc')
        .whereIn(`${wcFabricOrderRequisitionTableName}.id`, function() {
            this.select(`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
            .from(`${wcFabricOrderRequisitionDetailsTableName}`)
            .where({"is_order": isOrder})
          })
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.update = async (wcFabricOrderRequisition, whereCluse) => {
    let queryResults = false;
    await sqlFun
        .update(
            wcFabricOrderRequisitionTableName,
            wcFabricOrderRequisition,
            whereCluse
        )
        .then((data) => {
            queryResults = true;
        })
        .catch((err) => console.log(err));
    return queryResults;
};
