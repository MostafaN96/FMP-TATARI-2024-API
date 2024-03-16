// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { wdDyeingOrderRequisitionTableName, bussinessmanTableName, fabricTableName, wdDyeingOrderRequisitionDetailsTableName, ordersRequisitionsTableName } = require("../../../util/database-tables-name");

exports.insert = async (wdDyeingOrderRequisition) => {
    let queryResults = false;
    await sqlFun
        .insert(wdDyeingOrderRequisitionTableName, {
            id: wdDyeingOrderRequisition.id,
            seller_id: wdDyeingOrderRequisition.sellerId,
            number: wdDyeingOrderRequisition.number,
            name: wdDyeingOrderRequisition.name,
            date: wdDyeingOrderRequisition.date,
            note: wdDyeingOrderRequisition.note,
            creator_id: wdDyeingOrderRequisition.personid,
            ip_address: wdDyeingOrderRequisition.ipaddress,
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
        .limitedSelect(wdDyeingOrderRequisitionTableName, ["is_deleted"], whereCluse, 1)
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

    await knex(wdDyeingOrderRequisitionTableName)
        .select([
            `${wdDyeingOrderRequisitionTableName}.id`,
            `${wdDyeingOrderRequisitionTableName}.number`,
            `${wdDyeingOrderRequisitionTableName}.name`,
            `${wdDyeingOrderRequisitionTableName}.date`,
            `${wdDyeingOrderRequisitionTableName}.note`,
            `${wdDyeingOrderRequisitionTableName}.work_order_number`,
            `${bussinessmanTableName}.name as seller_name`,
            `${bussinessmanTableName}.id as seller_id`,
            // `${ordersRequisitionsTableName}.wa_yarn_order_requisition_id`,
            // `${ordersRequisitionsTableName}.wb_manufacturing_order_requisition_id`,
        ])
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdDyeingOrderRequisitionTableName}.seller_id`
        )
        // .leftOuterJoin(`${ordersRequisitionsTableName}`,
        //     `${ordersRequisitionsTableName}.wd_form_dyeing_order_requisition_id`,
        //     `${wdDyeingOrderRequisitionTableName}.id`
        // )
        .where(whereCluse)
        .orderBy(`${wdDyeingOrderRequisitionTableName}.number`, 'desc')
        .groupBy(`${wdDyeingOrderRequisitionTableName}.id`)
        .whereIn(`${wdDyeingOrderRequisitionTableName}.id`, function() {
            this.select(`${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`)
            .from(`${wdDyeingOrderRequisitionDetailsTableName}`)
            .where({"is_order": isOrder})
          })
        .then((data) => {
            console.log("wdDyeingOrderRequisitionTableName => :::: data", data);
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.update = async (wdDyeingOrderRequisition, whereCluse) => {
    let queryResults = false;
    await sqlFun
        .update(
            wdDyeingOrderRequisitionTableName,
            wdDyeingOrderRequisition,
            whereCluse
        )
        .then((data) => {
            queryResults = true;
        })
        .catch((err) => console.log(err));
    return queryResults;
};
