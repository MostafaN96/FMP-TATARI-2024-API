// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { bussinessmanTableName, waYarnOrderRequisitionDetailsTableName, 
    waYarnOrderRequisitionTableName,
    fabricTableName } = require("../../../util/database-tables-name");

exports.insert = async (waYarnOrderRequisition) => {
    let queryResults = false;
    await sqlFun
        .insert(waYarnOrderRequisitionTableName, {
            id: waYarnOrderRequisition.id,
            seller_id: waYarnOrderRequisition.sellerId,
            number: waYarnOrderRequisition.number,
            name: waYarnOrderRequisition.name,
            date: waYarnOrderRequisition.date,
            note: waYarnOrderRequisition.note,
            creator_id: waYarnOrderRequisition.personid,
            ip_address: waYarnOrderRequisition.ipaddress,
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
        .limitedSelect(waYarnOrderRequisitionTableName, ["is_deleted"], whereCluse, 1)
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

    await knex(waYarnOrderRequisitionTableName)
        .select([
            `${waYarnOrderRequisitionTableName}.id`,
            `${waYarnOrderRequisitionTableName}.number`,
            `${waYarnOrderRequisitionTableName}.name`,
            `${waYarnOrderRequisitionTableName}.date`,
            `${waYarnOrderRequisitionTableName}.note`,
            `${waYarnOrderRequisitionTableName}.is_order`,
            `${bussinessmanTableName}.name as seller_name`,
            `${bussinessmanTableName}.id as seller_id`,
        ])
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${waYarnOrderRequisitionTableName}.seller_id`
        )
        .where(whereCluse)
        .orderBy(`${waYarnOrderRequisitionTableName}.number`, 'desc')
        .whereIn(`${waYarnOrderRequisitionTableName}.id`, function() {
            this.select(`${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
            .from(`${waYarnOrderRequisitionDetailsTableName}`)
            .where({"is_order": isOrder})
          })
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.update = async (waYarnOrderRequisition, whereCluse) => {
    let queryResults = false;
    await sqlFun
        .update(
            waYarnOrderRequisitionTableName,
            waYarnOrderRequisition,
            whereCluse
        )
        .then((data) => {
            queryResults = true;
        })
        .catch((err) => console.log(err));
    return queryResults;
};
