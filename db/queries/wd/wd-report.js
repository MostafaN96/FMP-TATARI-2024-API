
// Config
const knex = require("../../config/connection").getConnection();

// Util
const { wdDyeingRequisitionTableName, wdDyeingRequisitionDetailsTableName, fabricTableName, wdDyeingOrderRequisitionDetailsTableName, wdDyeingOrderRequisitionTableName, bussinessmanTableName, colorCategoryTableName, colorTableName, wdFormDyeingRequisitionDetailsTableName, weDyedFabricOrderRequisitionDetailsTableName, weDyedFabricOrderRequisitionTableName } = require("../../../util/database-tables-name");

exports.dyeingReportByDyeing = async (dyeingId) => {
    let queryResults = [];
    let columns = ["id", "quantity", "name", "code"]

    let whereCluse = {};
    whereCluse[`${wdDyeingRequisitionTableName}.dyeing_id`] = dyeingId;
    whereCluse[`${wdDyeingRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wdDyeingRequisitionTableName}.is_active`] = 1;

    await knex.select(columns).from(function () {
        this.select([
            `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id as id`,
            `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity as quantity`,
            `${fabricTableName}.name`,
            `${fabricTableName}.code`
        ])
            .from(wdDyeingRequisitionDetailsTableName)
            .innerJoin(`${wdDyeingRequisitionTableName}`, 
            `${wdDyeingRequisitionTableName}.id`, 
            `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
            .innerJoin(`${fabricTableName}`, 
            `${fabricTableName}.id`, 
            `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`)
            .where(whereCluse)
            .as('t1')
    }).as('temp')
        .sum("quantity as quantity")
        .where("quantity", ">", "0")
        .then(data => {
            console.log(data);
            queryResults = data
        })
        .catch(error => {
            console.log(error);
        })
    return queryResults;
  };

exports.dyeingReportByDyes = async (dyeingId) => {
    let queryResults = [];
    let columns = ["id", "quantity"]

    let whereCluse = {};
    whereCluse[`${wdDyeingRequisitionTableName}.dyeing_id`] = dyeingId;
    whereCluse[`${wdDyeingRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wdDyeingRequisitionTableName}.is_active`] = 1;

    await knex.select(columns).from(function () {
        this.select([
            `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id as id`,
            `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity as quantity`,
        ])
            .from(wdDyeingRequisitionDetailsTableName)
            .innerJoin(`${wdDyeingRequisitionTableName}`, 
            `${wdDyeingRequisitionTableName}.id`, 
            `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
            .where(whereCluse)
            .as('t1')
    }).as('temp')
        .sum("quantity as quantity")
        .where("quantity", ">", "0")
        .then(data => {
            console.log(data);
            queryResults = data
        })
        .catch(error => {
            console.log(error);
        })
    return queryResults;
  };

exports.dyeingOrdersReport = async () => {
    let queryResults = [];
    let whereCluse = {};
    whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_order`] = 1;

    await knex.select(
        [
            `${fabricTableName}.name as dyed_fabric_name`,
            `${fabricTableName}.code as dyed_fabric_code`,
            `${fabricTableName}.dyeing_code`,
            knex.raw(`coalesce(SUM(${wdDyeingOrderRequisitionDetailsTableName}.quantity) - SUM(${wdDyeingOrderRequisitionDetailsTableName}.dyeing_current_quantity), 0) as produced_quantity`),
        ],
    )
        .sum(`${wdDyeingOrderRequisitionDetailsTableName}.quantity as ordered_quantity`)
        .sum(`${wdDyeingOrderRequisitionDetailsTableName}.dyeing_current_quantity as current_quantity`)
        .from(wdDyeingOrderRequisitionDetailsTableName)
        .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.dyed_fabric_id`)
        .where(whereCluse)
        .andWhere(`${wdDyeingOrderRequisitionDetailsTableName}.quantity`, ">", 0)
        .groupBy(`${fabricTableName}.id`)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};


exports.dyeingOrdersDetailsReport = async () => {
    let queryResults = [];
    let whereCluse = {};
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

    await knex.select(
        [
            `${weDyedFabricOrderRequisitionDetailsTableName}.id`,
            `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
            `${weDyedFabricOrderRequisitionTableName}.date`,
            `${weDyedFabricOrderRequisitionTableName}.number`,
            `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
            `${bussinessmanTableName}.name as seller_name`,
            `${fabricTableName}.name as dyed_fabric_name`,
            `${fabricTableName}.code as dyed_fabric_code`,
            `${fabricTableName}.dyeing_code`,
            `${colorCategoryTableName}.name as color_category_name`,
            `${colorTableName}.name as color_name`,
            knex.raw(
                    `CASE WHEN ${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity > ${0}
                    THEN coalesce( SUM(${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity) )
                    ELSE ${0}
                    END as ordered_current_quantity`),        
        ],
        )
        .sum(`${weDyedFabricOrderRequisitionDetailsTableName}.initial_quantity as ordered_quantity`)
        .sum(`${wdDyeingRequisitionDetailsTableName}.dyeing_quantity as dyeing_quantity`)
        .sum(`${wdFormDyeingRequisitionDetailsTableName}.quantity as form_quantity`)
        .sum(`${wdFormDyeingRequisitionDetailsTableName}.current_quantity as form_current_quantity`)
        .from(weDyedFabricOrderRequisitionDetailsTableName)
        .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
            `${weDyedFabricOrderRequisitionTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
        .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${wdDyeingRequisitionDetailsTableName}`,
            `${wdDyeingRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_details_id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.id`)
            .innerJoin(`${fabricTableName} as raw_fabric`,
            `raw_fabric.id`,
            `${fabricTableName}.fabric_id`)
        .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
            `${wdFormDyeingRequisitionDetailsTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${weDyedFabricOrderRequisitionTableName}.seller_id`)
            .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.color_category_id`)
            .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.color_id`)
        .where(whereCluse)
        .andWhere(`${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity`, ">", 0)
        .groupBy(
            `${weDyedFabricOrderRequisitionDetailsTableName}.dyed_fabric_id`, 
            `${weDyedFabricOrderRequisitionDetailsTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.color_id`,
        )
        .orderBy(`${weDyedFabricOrderRequisitionTableName}.number`, "desc")
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.formReportByFabric = async () => {
    let queryResults = [];
    let whereCluse = {};
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;

    await knex.select(
        [
            `${wdDyeingOrderRequisitionTableName}.id as wd_form_dyeing_order_requisition_id`,
            `${wdDyeingOrderRequisitionTableName}.date`,
            `${wdDyeingOrderRequisitionTableName}.number`,
            `${wdDyeingOrderRequisitionTableName}.work_order_number`,
            `${bussinessmanTableName}.name as seller_name`,
            `${fabricTableName}.name as dyed_fabric_name`,
            `${fabricTableName}.code as dyed_fabric_code`,
            `${fabricTableName}.dyeing_code`,
            `${colorCategoryTableName}.name as color_category_name`,
            `${colorTableName}.name as color_name`,
            knex.raw(`coalesce(SUM(${wdDyeingOrderRequisitionDetailsTableName}.quantity) - SUM(${wdDyeingOrderRequisitionDetailsTableName}.dyeing_current_quantity), 0) as produced_quantity`),
        ],
    )
        .sum(`${wdDyeingOrderRequisitionDetailsTableName}.quantity as ordered_quantity`)
        .sum(`${wdDyeingOrderRequisitionDetailsTableName}.dyeing_current_quantity as current_quantity`)
        .from(wdDyeingOrderRequisitionDetailsTableName)
        .innerJoin(`${wdDyeingOrderRequisitionTableName}`,
            `${wdDyeingOrderRequisitionTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`)
        .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdDyeingOrderRequisitionTableName}.seller_id`)
            .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.color_category_id`)
            .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.color_id`)
        .where(whereCluse)
        .andWhere(`${wdDyeingOrderRequisitionDetailsTableName}.quantity`, ">", 0)
        .groupBy(`${fabricTableName}.id`)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};