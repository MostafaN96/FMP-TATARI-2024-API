
// Config
const knex = require("../../config/connection").getConnection();

// Util
const { wdDyeingRequisitionTableName, wdDyeingRequisitionDetailsTableName, fabricTableName, wdDyeingOrderRequisitionDetailsTableName, wdDyeingOrderRequisitionTableName, bussinessmanTableName, colorCategoryTableName, colorTableName, wdFormDyeingRequisitionDetailsTableName, weDyedFabricOrderRequisitionDetailsTableName, weDyedFabricOrderRequisitionTableName, wdTableName, wdTransportWcWdTableName, wdTransportWcWdDetailsTableName, wdTransportRequisitionWdWcTableName, wdTransportRequisitionWdWcDetailsTableName, wdReconciliationRequisitionTableName, wdReconciliationRequisitionDetailsTableName, wdTransitionBetweenDyersRequisitionTableName, wdTransitionBetweenDyersRequisitionDetailsTableName, wdFormDyeingRequisitionTableName, wdFormDyeingRequisitionDetailsWdTableName, consigmentDyeingTableName, wcFabricOrderRequisitionTableName, warehouseTableName, anointedColorsPricesTableName, gradeItemTableName, consigmentManufacturingTableName, wcTableName } = require("../../../util/database-tables-name");

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

exports.selectAllMovementsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId, fabricOrderId) => {
    const sql = `
        (SELECT
            ${wdTransportWcWdDetailsTableName}.id,
            ${wdTransportWcWdDetailsTableName}.price,
            NULL AS price_dollar,
            ${wdTransportWcWdDetailsTableName}.quantity,
            ${wdTransportWcWdDetailsTableName}.fabric_piece,
            ${wdTransportWcWdDetailsTableName}.statement,
            NULL AS document,
            NULL AS work_order_number,
            ${wdTransportWcWdTableName}.id AS requisition_id,
            ${wdTransportWcWdTableName}.number,
            ${wdTransportWcWdTableName}.date,
            ${wdTransportWcWdTableName}.note,
            '' AS bussinessman_id,
            '' AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_dyeing_number,
            ${wcFabricOrderRequisitionTableName}.id AS wc_fabric_order_requisition_id,
            ${wcFabricOrderRequisitionTableName}.name AS wc_fabric_order_requisition_name,
            'اذن نقل من (C) الى (D)' AS type_of_requisition,
            '1' AS input_output,
            CONCAT(${bussinessmanTableName}.name) AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity, NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            NULL AS color_category_name, NULL AS color_name, NULL AS color_code,
            NULL AS color_category_id, NULL AS color_id, NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdTransportWcWdDetailsTableName}
        INNER JOIN ${wdTransportWcWdTableName} ON ${wdTransportWcWdTableName}.id = ${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id
        INNER JOIN ${wcFabricOrderRequisitionTableName} ON ${wcFabricOrderRequisitionTableName}.id = ${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_id
        INNER JOIN ${wdTableName} ON ${wdTableName}.wd_transport_wc_wd_details_id = ${wdTransportWcWdDetailsTableName}.id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdTransportWcWdDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdTransportWcWdDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdTableName}.dyeing_id
        WHERE ${wdTableName}.dyeing_id = ?
            AND ${wdTransportWcWdDetailsTableName}.fabric_id = ?
            AND ${wdTransportWcWdDetailsTableName}.consigment_dyeing_id = ?
            AND ${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_id = ?
            AND ${wdTransportWcWdDetailsTableName}.is_deleted = 0
            AND ${wdTransportWcWdDetailsTableName}.is_active = 1
            AND ${wdTransportWcWdDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT
            ${wdTransportRequisitionWdWcDetailsTableName}.id,
            ${wdTransportRequisitionWdWcDetailsTableName}.price,
            ${wdTransportRequisitionWdWcDetailsTableName}.price_dollar,
            ${wdTransportRequisitionWdWcDetailsTableName}.quantity,
            NULL AS fabric_piece,
            ${wdTransportRequisitionWdWcDetailsTableName}.statement,
            NULL AS document,
            NULL AS work_order_number,
            ${wdTransportRequisitionWdWcTableName}.id AS requisition_id,
            ${wdTransportRequisitionWdWcTableName}.number,
            ${wdTransportRequisitionWdWcTableName}.date,
            ${wdTransportRequisitionWdWcTableName}.note,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_dyeing_number,
            ${wcFabricOrderRequisitionTableName}.id AS wc_fabric_order_requisition_id,
            ${wcFabricOrderRequisitionTableName}.name AS wc_fabric_order_requisition_name,
            'اذن نقل من (D) الى (C)' AS type_of_requisition,
            '0' AS input_output,
            CONCAT(${warehouseTableName}.name) AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity, NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            NULL AS color_category_name, NULL AS color_name, NULL AS color_code,
            NULL AS color_category_id, NULL AS color_id, NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdTransportRequisitionWdWcDetailsTableName}
        INNER JOIN ${wdTransportRequisitionWdWcTableName} ON ${wdTransportRequisitionWdWcTableName}.id = ${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id
        INNER JOIN ${wcFabricOrderRequisitionTableName} ON ${wcFabricOrderRequisitionTableName}.id = ${wdTransportRequisitionWdWcDetailsTableName}.wc_fabric_order_requisition_id
        INNER JOIN ${warehouseTableName} ON ${warehouseTableName}.id = ${wdTransportRequisitionWdWcTableName}.warehouse_id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdTransportRequisitionWdWcDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdTransportRequisitionWdWcDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdTransportRequisitionWdWcTableName}.dyeing_id
        WHERE ${wdTransportRequisitionWdWcTableName}.dyeing_id = ?
            AND ${wdTransportRequisitionWdWcDetailsTableName}.fabric_id = ?
            AND ${wdTransportRequisitionWdWcDetailsTableName}.consigment_dyeing_id = ?
            AND ${wdTransportRequisitionWdWcDetailsTableName}.wc_fabric_order_requisition_id = ?
            AND ${wdTransportRequisitionWdWcDetailsTableName}.is_deleted = 0
            AND ${wdTransportRequisitionWdWcDetailsTableName}.is_active = 1
            AND ${wdTransportRequisitionWdWcDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT
            ${wdReconciliationRequisitionDetailsTableName}.id,
            ${wdReconciliationRequisitionDetailsTableName}.price,
            ${wdReconciliationRequisitionDetailsTableName}.price_dollar,
            ${wdReconciliationRequisitionDetailsTableName}.quantity,
            NULL AS fabric_piece,
            ${wdReconciliationRequisitionDetailsTableName}.statement,
            NULL AS document,
            NULL AS work_order_number,
            ${wdReconciliationRequisitionTableName}.id AS requisition_id,
            ${wdReconciliationRequisitionTableName}.number,
            ${wdReconciliationRequisitionTableName}.date,
            ${wdReconciliationRequisitionTableName}.note,
            '' AS bussinessman_id,
            '' AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_dyeing_number,
            ${wcFabricOrderRequisitionTableName}.id AS wc_fabric_order_requisition_id,
            ${wcFabricOrderRequisitionTableName}.name AS wc_fabric_order_requisition_name,
            'اذن تسوية' AS type_of_requisition,
            ${wdReconciliationRequisitionDetailsTableName}.input_output,
            CONCAT(${bussinessmanTableName}.name) AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity, NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            NULL AS color_category_name, NULL AS color_name, NULL AS color_code,
            NULL AS color_category_id, NULL AS color_id, NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdReconciliationRequisitionDetailsTableName}
        INNER JOIN ${wdReconciliationRequisitionTableName} ON ${wdReconciliationRequisitionTableName}.id = ${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id
        INNER JOIN ${wcFabricOrderRequisitionTableName} ON ${wcFabricOrderRequisitionTableName}.id = ${wdReconciliationRequisitionDetailsTableName}.wc_fabric_order_requisition_id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdReconciliationRequisitionDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdReconciliationRequisitionTableName}.dyeing_id
        WHERE ${wdReconciliationRequisitionTableName}.dyeing_id = ?
            AND ${wdReconciliationRequisitionDetailsTableName}.fabric_id = ?
            AND ${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id = ?
            AND ${wdReconciliationRequisitionDetailsTableName}.wc_fabric_order_requisition_id = ?
            AND ${wdReconciliationRequisitionDetailsTableName}.is_deleted = 0
            AND ${wdReconciliationRequisitionDetailsTableName}.is_active = 1
            AND ${wdReconciliationRequisitionDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.id,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.price,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity,
            NULL AS fabric_piece,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.statement,
            NULL AS document,
            NULL AS work_order_number,
            ${wdTransitionBetweenDyersRequisitionTableName}.id AS requisition_id,
            ${wdTransitionBetweenDyersRequisitionTableName}.number,
            ${wdTransitionBetweenDyersRequisitionTableName}.date,
            ${wdTransitionBetweenDyersRequisitionTableName}.note,
            '' AS bussinessman_id,
            '' AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_dyeing_number,
            ${wcFabricOrderRequisitionTableName}.id AS wc_fabric_order_requisition_id,
            ${wcFabricOrderRequisitionTableName}.name AS wc_fabric_order_requisition_name,
            'اذن نقل بين المصابغ' AS type_of_requisition,
            '0' AS input_output,
            CONCAT(' اذن نقل من مصبغة ', '(', ${bussinessmanTableName}.name, ')', ' الى مصبغة ', '(', to_dyeing.name, ')') AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity, NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            NULL AS color_category_name, NULL AS color_name, NULL AS color_code,
            NULL AS color_category_id, NULL AS color_id, NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdTransitionBetweenDyersRequisitionDetailsTableName}
        INNER JOIN ${wdTransitionBetweenDyersRequisitionTableName} ON ${wdTransitionBetweenDyersRequisitionTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id
        INNER JOIN ${wcFabricOrderRequisitionTableName} ON ${wcFabricOrderRequisitionTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.wc_fabric_order_requisition_id
        INNER JOIN ${wdTableName} ON ${wdTableName}.wd_transition_between_dyers_requisition_details_id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id
        INNER JOIN ${bussinessmanTableName} AS to_dyeing ON to_dyeing.id = ${wdTableName}.dyeing_id
        WHERE ${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id = ?
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id = ?
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id = ?
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.wc_fabric_order_requisition_id = ?
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted = 0
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active = 1
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.id,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.price,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity,
            NULL AS fabric_piece,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.statement,
            NULL AS document,
            NULL AS work_order_number,
            ${wdTransitionBetweenDyersRequisitionTableName}.id AS requisition_id,
            ${wdTransitionBetweenDyersRequisitionTableName}.number,
            ${wdTransitionBetweenDyersRequisitionTableName}.date,
            ${wdTransitionBetweenDyersRequisitionTableName}.note,
            '' AS bussinessman_id,
            '' AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_dyeing_number,
            ${wcFabricOrderRequisitionTableName}.id AS wc_fabric_order_requisition_id,
            ${wcFabricOrderRequisitionTableName}.name AS wc_fabric_order_requisition_name,
            'اذن نقل بين المصابغ' AS type_of_requisition,
            '1' AS input_output,
            CONCAT(' اذن نقل من مصنع ', '(', ${bussinessmanTableName}.name, ')', ' الى مصنع ', '(', to_dyeing.name, ')') AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity, NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            NULL AS color_category_name, NULL AS color_name, NULL AS color_code,
            NULL AS color_category_id, NULL AS color_id, NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdTransitionBetweenDyersRequisitionDetailsTableName}
        INNER JOIN ${wdTransitionBetweenDyersRequisitionTableName} ON ${wdTransitionBetweenDyersRequisitionTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id
        INNER JOIN ${wcFabricOrderRequisitionTableName} ON ${wcFabricOrderRequisitionTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.wc_fabric_order_requisition_id
        INNER JOIN ${wdTableName} ON ${wdTableName}.wd_transition_between_dyers_requisition_details_id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id
        INNER JOIN ${bussinessmanTableName} AS to_dyeing ON to_dyeing.id = ${wdTableName}.dyeing_id
        WHERE ${wdTableName}.dyeing_id = ?
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id = ?
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id = ?
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.wc_fabric_order_requisition_id = ?
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted = 0
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active = 1
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT DISTINCT
            ${wdFormDyeingRequisitionDetailsTableName}.id,
            ${wdFormDyeingRequisitionDetailsTableName}.price,
            ${wdFormDyeingRequisitionDetailsTableName}.price_dollar,
            '0' AS quantity,
            NULL AS fabric_piece,
            ${wdFormDyeingRequisitionDetailsTableName}.statement,
            ${wdFormDyeingRequisitionDetailsTableName}.document,
            ${wdFormDyeingRequisitionDetailsTableName}.work_order_number,
            ${wdFormDyeingRequisitionTableName}.id AS requisition_id,
            ${wdFormDyeingRequisitionTableName}.number,
            ${wdFormDyeingRequisitionTableName}.date,
            ${wdFormDyeingRequisitionTableName}.note,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_dyeing_number,
            ${wcFabricOrderRequisitionTableName}.id AS wc_fabric_order_requisition_id,
            ${wcFabricOrderRequisitionTableName}.name AS wc_fabric_order_requisition_name,
            'اذن تشكيل' AS type_of_requisition,
            '2' AS input_output,
            CONCAT(${bussinessmanTableName}.name) AS side_of,
            ${wdFormDyeingRequisitionTableName}.is_order,
            ${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing,
            CASE WHEN ${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing = '1' THEN 'المشكل نزل المصبغة' ELSE '-' END AS is_prepare_dyeing_name,
            ${wdFormDyeingRequisitionDetailsTableName}.quantity AS form_quantity,
            NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            ${colorCategoryTableName}.name AS color_category_name,
            ${colorTableName}.name AS color_name,
            ${anointedColorsPricesTableName}.code AS color_code,
            ${anointedColorsPricesTableName}.color_category_id,
            ${anointedColorsPricesTableName}.color_id,
            NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdFormDyeingRequisitionDetailsTableName}
        INNER JOIN ${wdFormDyeingRequisitionTableName} ON ${wdFormDyeingRequisitionTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id
        INNER JOIN ${wdFormDyeingRequisitionDetailsWdTableName} ON ${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id = ${wdFormDyeingRequisitionDetailsTableName}.id
        INNER JOIN ${wcFabricOrderRequisitionTableName} ON ${wcFabricOrderRequisitionTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id
        INNER JOIN ${wdTableName} ON ${wdTableName}.id = ${wdFormDyeingRequisitionDetailsWdTableName}.wd_id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdTableName}.dyeing_id
        INNER JOIN ${anointedColorsPricesTableName} ON ${anointedColorsPricesTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id
        INNER JOIN ${colorCategoryTableName} ON ${colorCategoryTableName}.id = ${anointedColorsPricesTableName}.color_category_id
        INNER JOIN ${colorTableName} ON ${colorTableName}.id = ${anointedColorsPricesTableName}.color_id
        WHERE ${wdTableName}.dyeing_id = ?
            AND ${wdFormDyeingRequisitionDetailsTableName}.fabric_id = ?
            AND ${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id = ?
            AND ${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id = ?
            AND ${wdFormDyeingRequisitionDetailsTableName}.is_deleted = 0
            AND ${wdFormDyeingRequisitionDetailsTableName}.is_active = 1
            AND ${wdFormDyeingRequisitionDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT
            ${wdDyeingRequisitionDetailsTableName}.id,
            ${wdDyeingRequisitionDetailsTableName}.price,
            NULL AS price_dollar,
            ${wdDyeingRequisitionDetailsTableName}.quantity,
            ${wdDyeingRequisitionDetailsTableName}.fabric_piece,
            ${wdDyeingRequisitionDetailsTableName}.statement,
            NULL AS document,
            ${wdDyeingRequisitionDetailsTableName}.work_order_number,
            ${wdDyeingRequisitionTableName}.id AS requisition_id,
            ${wdDyeingRequisitionTableName}.number,
            ${wdDyeingRequisitionTableName}.date,
            ${wdDyeingRequisitionTableName}.note,
            '' AS bussinessman_id,
            '' AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_dyeing_number,
            ${wcFabricOrderRequisitionTableName}.id AS wc_fabric_order_requisition_id,
            ${wcFabricOrderRequisitionTableName}.name AS wc_fabric_order_requisition_name,
            'اذن صباغة' AS type_of_requisition,
            '0' AS input_output,
            CONCAT(${bussinessmanTableName}.name) AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity,
            ${wdDyeingRequisitionDetailsTableName}.dyeing_quantity,
            dyed_fabric.name AS dyed_fabric_name,
            dyed_fabric.code AS dyed_fabric_code,
            dyed_fabric.dyeing_code,
            ${colorCategoryTableName}.name AS color_category_name,
            ${colorTableName}.name AS color_name,
            ${anointedColorsPricesTableName}.code AS color_code,
            ${anointedColorsPricesTableName}.color_category_id,
            ${anointedColorsPricesTableName}.color_id,
            ${wdDyeingRequisitionDetailsTableName}.grade_item_id,
            ${gradeItemTableName}.name AS grade_item_name
        FROM ${wdDyeingRequisitionDetailsTableName}
        INNER JOIN ${wdDyeingRequisitionTableName} ON ${wdDyeingRequisitionTableName}.id = ${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id
        INNER JOIN ${wdFormDyeingRequisitionDetailsTableName} ON ${wdFormDyeingRequisitionDetailsTableName}.id = ${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id
        INNER JOIN ${wcFabricOrderRequisitionTableName} ON ${wcFabricOrderRequisitionTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdDyeingRequisitionTableName}.dyeing_id
        INNER JOIN ${anointedColorsPricesTableName} ON ${anointedColorsPricesTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id
        INNER JOIN ${colorCategoryTableName} ON ${colorCategoryTableName}.id = ${anointedColorsPricesTableName}.color_category_id
        INNER JOIN ${colorTableName} ON ${colorTableName}.id = ${anointedColorsPricesTableName}.color_id
        INNER JOIN ${fabricTableName} AS dyed_fabric ON dyed_fabric.id = ${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id
        INNER JOIN ${gradeItemTableName} ON ${gradeItemTableName}.id = ${wdDyeingRequisitionDetailsTableName}.grade_item_id
        WHERE ${wdDyeingRequisitionTableName}.dyeing_id = ?
            AND ${wdFormDyeingRequisitionDetailsTableName}.fabric_id = ?
            AND ${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id = ?
            AND ${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id = ?
            AND ${wdDyeingRequisitionDetailsTableName}.is_deleted = 0
            AND ${wdDyeingRequisitionDetailsTableName}.is_active = 1
            AND ${wdDyeingRequisitionDetailsTableName}.quantity > 0)

        ORDER BY date ASC
    `;
    const bindings = [
        dyeingId, fabricId, consigmentDyeingId, fabricOrderId,
        dyeingId, fabricId, consigmentDyeingId, fabricOrderId,
        dyeingId, fabricId, consigmentDyeingId, fabricOrderId,
        dyeingId, fabricId, consigmentDyeingId, fabricOrderId,
        dyeingId, fabricId, consigmentDyeingId, fabricOrderId,
        dyeingId, fabricId, consigmentDyeingId, fabricOrderId,
        dyeingId, fabricId, consigmentDyeingId, fabricOrderId,
    ];
    const [rows] = await knex.raw(sql, bindings);
    return rows;
};

exports.selectAllMovementsTotalByFabricByDyeing = async (fabricId, dyeingId) => {
    const sql = `
        (SELECT
            ${wdTransportWcWdDetailsTableName}.id,
            ${wdTransportWcWdDetailsTableName}.price,
            NULL AS price_dollar,
            ${wdTransportWcWdDetailsTableName}.quantity,
            ${wdTransportWcWdDetailsTableName}.fabric_piece,
            ${wdTransportWcWdDetailsTableName}.document,
            NULL AS work_order_number,
            ${wdTransportWcWdDetailsTableName}.statement,
            ${wdTransportWcWdTableName}.id AS requisition_id,
            ${wdTransportWcWdTableName}.number,
            ${wdTransportWcWdTableName}.date,
            ${wdTransportWcWdTableName}.note,
            NULL AS release_process,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentManufacturingTableName}.number AS consigment_number,
            ${warehouseTableName}.name AS warehouse_name,
            'اذن نقل من (C) الى (D)' AS type_of_requisition,
            '1' AS input_output,
            CONCAT(${bussinessmanTableName}.name) AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity, NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            NULL AS color_category_name, NULL AS color_name, NULL AS color_code,
            NULL AS color_category_id, NULL AS color_id, NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdTransportWcWdDetailsTableName}
        INNER JOIN ${wdTransportWcWdTableName} ON ${wdTransportWcWdTableName}.id = ${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id
        INNER JOIN ${wdTableName} ON ${wdTableName}.wd_transport_wc_wd_details_id = ${wdTransportWcWdDetailsTableName}.id
        INNER JOIN ${warehouseTableName} ON ${warehouseTableName}.id = ${wdTransportWcWdTableName}.warehouse_id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdTransportWcWdDetailsTableName}.fabric_id
        INNER JOIN ${consigmentManufacturingTableName} ON ${consigmentManufacturingTableName}.id = ${wdTransportWcWdDetailsTableName}.consigment_manufacturing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdTableName}.dyeing_id
        WHERE ${wdTableName}.dyeing_id = ?
            AND ${wdTransportWcWdDetailsTableName}.fabric_id = ?
            AND ${wdTransportWcWdDetailsTableName}.is_deleted = 0
            AND ${wdTransportWcWdDetailsTableName}.is_active = 1
            AND ${wdTransportWcWdDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT
            ${wdTransportRequisitionWdWcDetailsTableName}.id,
            ${wdTransportRequisitionWdWcDetailsTableName}.price,
            ${wdTransportRequisitionWdWcDetailsTableName}.price_dollar,
            ${wdTransportRequisitionWdWcDetailsTableName}.quantity,
            NULL AS fabric_piece,
            ${wdTransportRequisitionWdWcDetailsTableName}.document,
            NULL AS work_order_number,
            ${wdTransportRequisitionWdWcDetailsTableName}.statement,
            ${wdTransportRequisitionWdWcTableName}.id AS requisition_id,
            ${wdTransportRequisitionWdWcTableName}.number,
            ${wdTransportRequisitionWdWcTableName}.date,
            ${wdTransportRequisitionWdWcTableName}.note,
            NULL AS release_process,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentManufacturingTableName}.number AS consigment_number,
            ${warehouseTableName}.name AS warehouse_name,
            'اذن نقل من (D) الى (C)' AS type_of_requisition,
            '0' AS input_output,
            CONCAT(${warehouseTableName}.name) AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity, NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            NULL AS color_category_name, NULL AS color_name, NULL AS color_code,
            NULL AS color_category_id, NULL AS color_id, NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdTransportRequisitionWdWcTableName}
        INNER JOIN ${wdTransportRequisitionWdWcDetailsTableName} ON ${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id = ${wdTransportRequisitionWdWcTableName}.id
        INNER JOIN ${wcTableName} ON ${wcTableName}.wd_transport_requisition_wd_wc_details_id = ${wdTransportRequisitionWdWcDetailsTableName}.id
        INNER JOIN ${warehouseTableName} ON ${warehouseTableName}.id = ${wdTransportRequisitionWdWcTableName}.warehouse_id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdTransportRequisitionWdWcDetailsTableName}.fabric_id
        INNER JOIN ${consigmentManufacturingTableName} ON ${consigmentManufacturingTableName}.id = ${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdTransportRequisitionWdWcTableName}.dyeing_id
        WHERE ${wdTransportRequisitionWdWcTableName}.dyeing_id = ?
            AND ${wdTransportRequisitionWdWcDetailsTableName}.fabric_id = ?
            AND ${wdTransportRequisitionWdWcDetailsTableName}.is_deleted = 0
            AND ${wdTransportRequisitionWdWcDetailsTableName}.is_active = 1
            AND ${wdTransportRequisitionWdWcDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT
            ${wdReconciliationRequisitionDetailsTableName}.id,
            ${wdReconciliationRequisitionDetailsTableName}.price,
            ${wdReconciliationRequisitionDetailsTableName}.price_dollar,
            ${wdReconciliationRequisitionDetailsTableName}.quantity,
            NULL AS fabric_piece,
            NULL AS document,
            NULL AS work_order_number,
            ${wdReconciliationRequisitionDetailsTableName}.statement,
            ${wdReconciliationRequisitionTableName}.id AS requisition_id,
            ${wdReconciliationRequisitionTableName}.number,
            ${wdReconciliationRequisitionTableName}.date,
            ${wdReconciliationRequisitionTableName}.note,
            NULL AS release_process,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_number,
            NULL AS warehouse_name,
            'اذن تسوية' AS type_of_requisition,
            ${wdReconciliationRequisitionDetailsTableName}.input_output,
            CONCAT(${bussinessmanTableName}.name) AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity, NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            NULL AS color_category_name, NULL AS color_name, NULL AS color_code,
            NULL AS color_category_id, NULL AS color_id, NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdReconciliationRequisitionDetailsTableName}
        INNER JOIN ${wdReconciliationRequisitionTableName} ON ${wdReconciliationRequisitionTableName}.id = ${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdReconciliationRequisitionDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdReconciliationRequisitionTableName}.dyeing_id
        WHERE ${wdReconciliationRequisitionTableName}.dyeing_id = ?
            AND ${wdReconciliationRequisitionDetailsTableName}.fabric_id = ?
            AND ${wdReconciliationRequisitionDetailsTableName}.is_deleted = 0
            AND ${wdReconciliationRequisitionDetailsTableName}.is_active = 1
            AND ${wdReconciliationRequisitionDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.id,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.price,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity,
            NULL AS fabric_piece,
            NULL AS document,
            NULL AS work_order_number,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.statement,
            ${wdTransitionBetweenDyersRequisitionTableName}.id AS requisition_id,
            ${wdTransitionBetweenDyersRequisitionTableName}.number,
            ${wdTransitionBetweenDyersRequisitionTableName}.date,
            ${wdTransitionBetweenDyersRequisitionTableName}.note,
            NULL AS release_process,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_number,
            NULL AS warehouse_name,
            'اذن نقل بين المصابغ' AS type_of_requisition,
            '0' AS input_output,
            CONCAT(' اذن نقل من مصبغة ', '( ', ${bussinessmanTableName}.name, ')', ' الى مصبغة ', '(', to_dyeing.name, ')') AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity, NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            NULL AS color_category_name, NULL AS color_name, NULL AS color_code,
            NULL AS color_category_id, NULL AS color_id, NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdTransitionBetweenDyersRequisitionDetailsTableName}
        INNER JOIN ${wdTransitionBetweenDyersRequisitionTableName} ON ${wdTransitionBetweenDyersRequisitionTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id
        INNER JOIN ${wdTableName} ON ${wdTableName}.wd_transition_between_dyers_requisition_details_id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id
        INNER JOIN ${bussinessmanTableName} AS to_dyeing ON to_dyeing.id = ${wdTableName}.dyeing_id
        WHERE ${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id = ?
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id = ?
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted = 0
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active = 1
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.id,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.price,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity,
            NULL AS fabric_piece,
            NULL AS document,
            NULL AS work_order_number,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.statement,
            ${wdTransitionBetweenDyersRequisitionTableName}.id AS requisition_id,
            ${wdTransitionBetweenDyersRequisitionTableName}.number,
            ${wdTransitionBetweenDyersRequisitionTableName}.date,
            ${wdTransitionBetweenDyersRequisitionTableName}.note,
            NULL AS release_process,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_number,
            NULL AS warehouse_name,
            'اذن نقل بين المصابغ' AS type_of_requisition,
            '1' AS input_output,
            CONCAT(' اذن نقل من مصبغة ', '(', ${bussinessmanTableName}.name, ')', ' الى مصبغة ', '(', to_dyeing.name, ')') AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity, NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            NULL AS color_category_name, NULL AS color_name, NULL AS color_code,
            NULL AS color_category_id, NULL AS color_id, NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdTransitionBetweenDyersRequisitionDetailsTableName}
        INNER JOIN ${wdTransitionBetweenDyersRequisitionTableName} ON ${wdTransitionBetweenDyersRequisitionTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id
        INNER JOIN ${wdTableName} ON ${wdTableName}.wd_transition_between_dyers_requisition_details_id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id
        INNER JOIN ${bussinessmanTableName} AS to_dyeing ON to_dyeing.id = ${wdTableName}.dyeing_id
        WHERE ${wdTableName}.dyeing_id = ?
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id = ?
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted = 0
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active = 1
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT DISTINCT
            ${wdFormDyeingRequisitionDetailsTableName}.id,
            ${wdFormDyeingRequisitionDetailsTableName}.price,
            ${wdFormDyeingRequisitionDetailsTableName}.price_dollar,
            '0' AS quantity,
            NULL AS fabric_piece,
            ${wdFormDyeingRequisitionDetailsTableName}.document,
            ${wdFormDyeingRequisitionDetailsTableName}.work_order_number,
            ${wdFormDyeingRequisitionDetailsTableName}.statement,
            ${wdFormDyeingRequisitionTableName}.id AS requisition_id,
            ${wdFormDyeingRequisitionTableName}.number,
            ${wdFormDyeingRequisitionTableName}.date,
            ${wdFormDyeingRequisitionTableName}.note,
            NULL AS release_process,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_number,
            ${bussinessmanTableName}.name AS warehouse_name,
            'اذن تشكيل' AS type_of_requisition,
            '2' AS input_output,
            CONCAT(${bussinessmanTableName}.name) AS side_of,
            ${wdFormDyeingRequisitionTableName}.is_order,
            ${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing,
            CASE WHEN ${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing = '1' THEN 'المشكل نزل المصبغة' ELSE '-' END AS is_prepare_dyeing_name,
            ${wdFormDyeingRequisitionDetailsTableName}.quantity AS form_quantity,
            NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            ${colorCategoryTableName}.name AS color_category_name,
            ${colorTableName}.name AS color_name,
            ${anointedColorsPricesTableName}.code AS color_code,
            ${anointedColorsPricesTableName}.color_category_id,
            ${anointedColorsPricesTableName}.color_id,
            NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdFormDyeingRequisitionDetailsTableName}
        INNER JOIN ${wdFormDyeingRequisitionTableName} ON ${wdFormDyeingRequisitionTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id
        INNER JOIN ${wdFormDyeingRequisitionDetailsWdTableName} ON ${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id = ${wdFormDyeingRequisitionDetailsTableName}.id
        INNER JOIN ${wdTableName} ON ${wdTableName}.id = ${wdFormDyeingRequisitionDetailsWdTableName}.wd_id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdTableName}.dyeing_id
        INNER JOIN ${anointedColorsPricesTableName} ON ${anointedColorsPricesTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id
        INNER JOIN ${colorCategoryTableName} ON ${colorCategoryTableName}.id = ${anointedColorsPricesTableName}.color_category_id
        INNER JOIN ${colorTableName} ON ${colorTableName}.id = ${anointedColorsPricesTableName}.color_id
        WHERE ${wdTableName}.dyeing_id = ?
            AND ${wdFormDyeingRequisitionDetailsTableName}.fabric_id = ?
            AND ${wdFormDyeingRequisitionDetailsTableName}.is_deleted = 0
            AND ${wdFormDyeingRequisitionDetailsTableName}.is_active = 1
            AND ${wdFormDyeingRequisitionDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT
            ${wdDyeingRequisitionDetailsTableName}.id,
            ${wdDyeingRequisitionDetailsTableName}.cost_price AS price,
            NULL AS price_dollar,
            ${wdDyeingRequisitionDetailsTableName}.quantity,
            ${wdDyeingRequisitionDetailsTableName}.fabric_piece,
            NULL AS document,
            ${wdDyeingRequisitionDetailsTableName}.work_order_number,
            ${wdDyeingRequisitionDetailsTableName}.statement,
            ${wdDyeingRequisitionTableName}.id AS requisition_id,
            ${wdDyeingRequisitionTableName}.number,
            ${wdDyeingRequisitionTableName}.date,
            ${wdDyeingRequisitionTableName}.note,
            ${wdDyeingRequisitionTableName}.release_process,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_number,
            ${warehouseTableName}.name AS warehouse_name,
            'اذن صباغة' AS type_of_requisition,
            '0' AS input_output,
            CONCAT(${warehouseTableName}.name) AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity,
            ${wdDyeingRequisitionDetailsTableName}.dyeing_quantity,
            dyed_fabric.name AS dyed_fabric_name,
            dyed_fabric.code AS dyed_fabric_code,
            dyed_fabric.dyeing_code,
            ${colorCategoryTableName}.name AS color_category_name,
            ${colorTableName}.name AS color_name,
            ${anointedColorsPricesTableName}.code AS color_code,
            ${anointedColorsPricesTableName}.color_category_id,
            ${anointedColorsPricesTableName}.color_id,
            ${wdDyeingRequisitionDetailsTableName}.grade_item_id,
            ${gradeItemTableName}.name AS grade_item_name
        FROM ${wdDyeingRequisitionDetailsTableName}
        INNER JOIN ${wdDyeingRequisitionTableName} ON ${wdDyeingRequisitionTableName}.id = ${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id
        INNER JOIN ${wdFormDyeingRequisitionDetailsTableName} ON ${wdFormDyeingRequisitionDetailsTableName}.id = ${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id
        INNER JOIN ${warehouseTableName} ON ${warehouseTableName}.id = ${wdDyeingRequisitionTableName}.warehouse_id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdDyeingRequisitionTableName}.dyeing_id
        INNER JOIN ${anointedColorsPricesTableName} ON ${anointedColorsPricesTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id
        INNER JOIN ${colorCategoryTableName} ON ${colorCategoryTableName}.id = ${anointedColorsPricesTableName}.color_category_id
        INNER JOIN ${colorTableName} ON ${colorTableName}.id = ${anointedColorsPricesTableName}.color_id
        INNER JOIN ${fabricTableName} AS dyed_fabric ON dyed_fabric.id = ${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id
        INNER JOIN ${gradeItemTableName} ON ${gradeItemTableName}.id = ${wdDyeingRequisitionDetailsTableName}.grade_item_id
        WHERE ${wdDyeingRequisitionTableName}.dyeing_id = ?
            AND ${wdFormDyeingRequisitionDetailsTableName}.fabric_id = ?
            AND ${wdDyeingRequisitionDetailsTableName}.is_deleted = 0
            AND ${wdDyeingRequisitionDetailsTableName}.is_active = 1
            AND ${wdDyeingRequisitionDetailsTableName}.quantity > 0)

        ORDER BY date ASC
    `;
    const bindings = [
        dyeingId, fabricId,
        dyeingId, fabricId,
        dyeingId, fabricId,
        dyeingId, fabricId,
        dyeingId, fabricId,
        dyeingId, fabricId,
        dyeingId, fabricId,
    ];
    const [rows] = await knex.raw(sql, bindings);
    return rows;
};

exports.selectAllMovementsByConsigmentDyeing = async (consigmentDyeingId) => {
    const sql = `
        (SELECT
            ${wdTransportWcWdDetailsTableName}.id,
            ${wdTransportWcWdDetailsTableName}.price,
            NULL AS price_dollar,
            ${wdTransportWcWdDetailsTableName}.quantity,
            ${wdTransportWcWdDetailsTableName}.fabric_piece,
            ${wdTransportWcWdDetailsTableName}.document,
            NULL AS work_order_number,
            ${wdTransportWcWdDetailsTableName}.statement,
            ${wdTransportWcWdTableName}.id AS requisition_id,
            ${wdTransportWcWdTableName}.number,
            ${wdTransportWcWdTableName}.date,
            ${wdTransportWcWdTableName}.note,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_dyeing_number,
            ${wcFabricOrderRequisitionTableName}.id AS wc_fabric_order_requisition_id,
            ${wcFabricOrderRequisitionTableName}.name AS wc_fabric_order_requisition_name,
            'اذن نقل من (C) الى (D)' AS type_of_requisition,
            '1' AS input_output,
            CONCAT(${bussinessmanTableName}.name) AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity, NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            NULL AS color_category_name, NULL AS color_name, NULL AS color_code,
            NULL AS color_category_id, NULL AS color_id, NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdTransportWcWdDetailsTableName}
        INNER JOIN ${wdTransportWcWdTableName} ON ${wdTransportWcWdTableName}.id = ${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id
        INNER JOIN ${wcFabricOrderRequisitionTableName} ON ${wcFabricOrderRequisitionTableName}.id = ${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_id
        INNER JOIN ${wdTableName} ON ${wdTableName}.wd_transport_wc_wd_details_id = ${wdTransportWcWdDetailsTableName}.id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdTransportWcWdDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdTransportWcWdDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdTableName}.dyeing_id
        WHERE ${wdTransportWcWdDetailsTableName}.consigment_dyeing_id = ?
            AND ${wdTransportWcWdDetailsTableName}.is_deleted = 0
            AND ${wdTransportWcWdDetailsTableName}.is_active = 1
            AND ${wdTransportWcWdDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT
            ${wdTransportRequisitionWdWcDetailsTableName}.id,
            ${wdTransportRequisitionWdWcDetailsTableName}.price,
            ${wdTransportRequisitionWdWcDetailsTableName}.price_dollar,
            ${wdTransportRequisitionWdWcDetailsTableName}.quantity,
            NULL AS fabric_piece,
            ${wdTransportRequisitionWdWcDetailsTableName}.document,
            NULL AS work_order_number,
            ${wdTransportRequisitionWdWcDetailsTableName}.statement,
            ${wdTransportRequisitionWdWcTableName}.id AS requisition_id,
            ${wdTransportRequisitionWdWcTableName}.number,
            ${wdTransportRequisitionWdWcTableName}.date,
            ${wdTransportRequisitionWdWcTableName}.note,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_dyeing_number,
            ${wcFabricOrderRequisitionTableName}.id AS wc_fabric_order_requisition_id,
            ${wcFabricOrderRequisitionTableName}.name AS wc_fabric_order_requisition_name,
            'اذن نقل من (D) الى (C)' AS type_of_requisition,
            '0' AS input_output,
            CONCAT(${bussinessmanTableName}.name) AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity, NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            NULL AS color_category_name, NULL AS color_name, NULL AS color_code,
            NULL AS color_category_id, NULL AS color_id, NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdTransportRequisitionWdWcDetailsTableName}
        INNER JOIN ${wdTransportRequisitionWdWcTableName} ON ${wdTransportRequisitionWdWcTableName}.id = ${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id
        INNER JOIN ${wcFabricOrderRequisitionTableName} ON ${wcFabricOrderRequisitionTableName}.id = ${wdTransportRequisitionWdWcDetailsTableName}.wc_fabric_order_requisition_id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdTransportRequisitionWdWcDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdTransportRequisitionWdWcDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdTransportRequisitionWdWcTableName}.dyeing_id
        WHERE ${wdTransportRequisitionWdWcDetailsTableName}.consigment_dyeing_id = ?
            AND ${wdTransportRequisitionWdWcDetailsTableName}.is_deleted = 0
            AND ${wdTransportRequisitionWdWcDetailsTableName}.is_active = 1
            AND ${wdTransportRequisitionWdWcDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT
            ${wdReconciliationRequisitionDetailsTableName}.id,
            ${wdReconciliationRequisitionDetailsTableName}.price,
            ${wdReconciliationRequisitionDetailsTableName}.price_dollar,
            ${wdReconciliationRequisitionDetailsTableName}.quantity,
            NULL AS fabric_piece,
            NULL AS document,
            NULL AS work_order_number,
            ${wdReconciliationRequisitionDetailsTableName}.statement,
            ${wdReconciliationRequisitionTableName}.id AS requisition_id,
            ${wdReconciliationRequisitionTableName}.number,
            ${wdReconciliationRequisitionTableName}.date,
            ${wdReconciliationRequisitionTableName}.note,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_dyeing_number,
            NULL AS wc_fabric_order_requisition_id,
            NULL AS wc_fabric_order_requisition_name,
            'اذن تسوية' AS type_of_requisition,
            ${wdReconciliationRequisitionDetailsTableName}.input_output,
            CONCAT(${bussinessmanTableName}.name) AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity, NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            NULL AS color_category_name, NULL AS color_name, NULL AS color_code,
            NULL AS color_category_id, NULL AS color_id, NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdReconciliationRequisitionDetailsTableName}
        INNER JOIN ${wdReconciliationRequisitionTableName} ON ${wdReconciliationRequisitionTableName}.id = ${wdReconciliationRequisitionDetailsTableName}.wd_reconcilition_requisition_id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdReconciliationRequisitionDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdReconciliationRequisitionTableName}.dyeing_id
        WHERE ${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id = ?
            AND ${wdReconciliationRequisitionDetailsTableName}.is_deleted = 0
            AND ${wdReconciliationRequisitionDetailsTableName}.is_active = 1
            AND ${wdReconciliationRequisitionDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.id,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.price,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity,
            NULL AS fabric_piece,
            NULL AS document,
            NULL AS work_order_number,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.statement,
            ${wdTransitionBetweenDyersRequisitionTableName}.id AS requisition_id,
            ${wdTransitionBetweenDyersRequisitionTableName}.number,
            ${wdTransitionBetweenDyersRequisitionTableName}.date,
            ${wdTransitionBetweenDyersRequisitionTableName}.note,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_dyeing_number,
            NULL AS wc_fabric_order_requisition_id,
            NULL AS wc_fabric_order_requisition_name,
            'اذن نقل بين المصابغ' AS type_of_requisition,
            '0' AS input_output,
            CONCAT(' اذن نقل من مصبغة ', '( ', ${bussinessmanTableName}.name, ')', ' الى مصبغة ', '(', to_dyeing.name, ')') AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity, NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            NULL AS color_category_name, NULL AS color_name, NULL AS color_code,
            NULL AS color_category_id, NULL AS color_id, NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdTransitionBetweenDyersRequisitionDetailsTableName}
        INNER JOIN ${wdTransitionBetweenDyersRequisitionTableName} ON ${wdTransitionBetweenDyersRequisitionTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id
        INNER JOIN ${wdTableName} ON ${wdTableName}.wd_transition_between_dyers_requisition_details_id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id
        INNER JOIN ${bussinessmanTableName} AS to_dyeing ON to_dyeing.id = ${wdTableName}.dyeing_id
        WHERE ${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id = ?
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted = 0
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active = 1
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity > 0
            AND ${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id != ${wdTableName}.dyeing_id)

        UNION ALL

        (SELECT
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.id,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.price,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.price_dollar,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity,
            NULL AS fabric_piece,
            NULL AS document,
            NULL AS work_order_number,
            ${wdTransitionBetweenDyersRequisitionDetailsTableName}.statement,
            ${wdTransitionBetweenDyersRequisitionTableName}.id AS requisition_id,
            ${wdTransitionBetweenDyersRequisitionTableName}.number,
            ${wdTransitionBetweenDyersRequisitionTableName}.date,
            ${wdTransitionBetweenDyersRequisitionTableName}.note,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_dyeing_number,
            NULL AS wc_fabric_order_requisition_id,
            NULL AS wc_fabric_order_requisition_name,
            'اذن نقل بين المصابغ' AS type_of_requisition,
            '1' AS input_output,
            CONCAT(' اذن نقل من مصبغة ', '(', ${bussinessmanTableName}.name, ')', ' الى مصبغة ', '(', to_dyeing.name, ')') AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity, NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            NULL AS color_category_name, NULL AS color_name, NULL AS color_code,
            NULL AS color_category_id, NULL AS color_id, NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdTransitionBetweenDyersRequisitionDetailsTableName}
        INNER JOIN ${wdTransitionBetweenDyersRequisitionTableName} ON ${wdTransitionBetweenDyersRequisitionTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.wd_transition_between_dyers_requisition_id
        INNER JOIN ${wdTableName} ON ${wdTableName}.wd_transition_between_dyers_requisition_details_id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id
        INNER JOIN ${bussinessmanTableName} AS to_dyeing ON to_dyeing.id = ${wdTableName}.dyeing_id
        WHERE ${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id = ?
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted = 0
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active = 1
            AND ${wdTransitionBetweenDyersRequisitionDetailsTableName}.quantity > 0
            AND ${wdTableName}.dyeing_id = ${wdTransitionBetweenDyersRequisitionTableName}.dyeing_id)

        UNION ALL

        (SELECT DISTINCT
            ${wdFormDyeingRequisitionDetailsTableName}.id,
            ${wdFormDyeingRequisitionDetailsTableName}.price,
            ${wdFormDyeingRequisitionDetailsTableName}.price_dollar,
            '0' AS quantity,
            NULL AS fabric_piece,
            ${wdFormDyeingRequisitionDetailsTableName}.document,
            ${wdFormDyeingRequisitionDetailsTableName}.work_order_number,
            ${wdFormDyeingRequisitionDetailsTableName}.statement,
            ${wdFormDyeingRequisitionTableName}.id AS requisition_id,
            ${wdFormDyeingRequisitionTableName}.number,
            ${wdFormDyeingRequisitionTableName}.date,
            ${wdFormDyeingRequisitionTableName}.note,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_dyeing_number,
            ${wcFabricOrderRequisitionTableName}.id AS wc_fabric_order_requisition_id,
            ${wcFabricOrderRequisitionTableName}.name AS wc_fabric_order_requisition_name,
            'اذن تشكيل' AS type_of_requisition,
            '2' AS input_output,
            CONCAT(${bussinessmanTableName}.name) AS side_of,
            ${wdFormDyeingRequisitionTableName}.is_order,
            ${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing,
            CASE WHEN ${wdFormDyeingRequisitionDetailsTableName}.is_prepare_dyeing = '1' THEN 'المشكل نزل المصبغة' ELSE '-' END AS is_prepare_dyeing_name,
            ${wdFormDyeingRequisitionDetailsTableName}.quantity AS form_quantity,
            NULL AS dyeing_quantity,
            NULL AS dyed_fabric_name, NULL AS dyed_fabric_code, NULL AS dyeing_code,
            ${colorCategoryTableName}.name AS color_category_name,
            ${colorTableName}.name AS color_name,
            ${anointedColorsPricesTableName}.code AS color_code,
            ${anointedColorsPricesTableName}.color_category_id,
            ${anointedColorsPricesTableName}.color_id,
            NULL AS grade_item_id, NULL AS grade_item_name
        FROM ${wdFormDyeingRequisitionDetailsTableName}
        INNER JOIN ${wdFormDyeingRequisitionTableName} ON ${wdFormDyeingRequisitionTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_id
        INNER JOIN ${wdFormDyeingRequisitionDetailsWdTableName} ON ${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id = ${wdFormDyeingRequisitionDetailsTableName}.id
        INNER JOIN ${wdTableName} ON ${wdTableName}.id = ${wdFormDyeingRequisitionDetailsWdTableName}.wd_id
        INNER JOIN ${wcFabricOrderRequisitionTableName} ON ${wcFabricOrderRequisitionTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdTableName}.dyeing_id
        INNER JOIN ${anointedColorsPricesTableName} ON ${anointedColorsPricesTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id
        INNER JOIN ${colorCategoryTableName} ON ${colorCategoryTableName}.id = ${anointedColorsPricesTableName}.color_category_id
        INNER JOIN ${colorTableName} ON ${colorTableName}.id = ${anointedColorsPricesTableName}.color_id
        WHERE ${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id = ?
            AND ${wdFormDyeingRequisitionDetailsTableName}.is_deleted = 0
            AND ${wdFormDyeingRequisitionDetailsTableName}.is_active = 1
            AND ${wdFormDyeingRequisitionDetailsTableName}.quantity > 0)

        UNION ALL

        (SELECT
            ${wdDyeingRequisitionDetailsTableName}.id,
            ${wdDyeingRequisitionDetailsTableName}.price,
            NULL AS price_dollar,
            ${wdDyeingRequisitionDetailsTableName}.quantity,
            ${wdDyeingRequisitionDetailsTableName}.fabric_piece,
            NULL AS document,
            ${wdDyeingRequisitionDetailsTableName}.work_order_number,
            ${wdDyeingRequisitionDetailsTableName}.statement,
            ${wdDyeingRequisitionTableName}.id AS requisition_id,
            ${wdDyeingRequisitionTableName}.number,
            ${wdDyeingRequisitionTableName}.date,
            ${wdDyeingRequisitionTableName}.note,
            ${bussinessmanTableName}.id AS bussinessman_id,
            ${bussinessmanTableName}.name AS bussinessman_name,
            ${fabricTableName}.name AS fabric_name,
            ${fabricTableName}.code AS fabric_code,
            ${consigmentDyeingTableName}.number AS consigment_dyeing_number,
            ${wcFabricOrderRequisitionTableName}.id AS wc_fabric_order_requisition_id,
            ${wcFabricOrderRequisitionTableName}.name AS wc_fabric_order_requisition_name,
            'اذن صباغة' AS type_of_requisition,
            '0' AS input_output,
            CONCAT(${bussinessmanTableName}.name) AS side_of,
            NULL AS is_order, NULL AS is_prepare_dyeing, NULL AS is_prepare_dyeing_name,
            NULL AS form_quantity,
            ${wdDyeingRequisitionDetailsTableName}.dyeing_quantity,
            dyed_fabric.name AS dyed_fabric_name,
            dyed_fabric.code AS dyed_fabric_code,
            dyed_fabric.dyeing_code,
            ${colorCategoryTableName}.name AS color_category_name,
            ${colorTableName}.name AS color_name,
            ${anointedColorsPricesTableName}.code AS color_code,
            ${anointedColorsPricesTableName}.color_category_id,
            ${anointedColorsPricesTableName}.color_id,
            ${wdDyeingRequisitionDetailsTableName}.grade_item_id,
            ${gradeItemTableName}.name AS grade_item_name
        FROM ${wdDyeingRequisitionDetailsTableName}
        INNER JOIN ${wdDyeingRequisitionTableName} ON ${wdDyeingRequisitionTableName}.id = ${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id
        INNER JOIN ${wdFormDyeingRequisitionDetailsTableName} ON ${wdFormDyeingRequisitionDetailsTableName}.id = ${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id
        INNER JOIN ${wcFabricOrderRequisitionTableName} ON ${wcFabricOrderRequisitionTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_id
        INNER JOIN ${fabricTableName} ON ${fabricTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.fabric_id
        INNER JOIN ${consigmentDyeingTableName} ON ${consigmentDyeingTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id
        INNER JOIN ${bussinessmanTableName} ON ${bussinessmanTableName}.id = ${wdDyeingRequisitionTableName}.dyeing_id
        INNER JOIN ${anointedColorsPricesTableName} ON ${anointedColorsPricesTableName}.id = ${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id
        INNER JOIN ${colorCategoryTableName} ON ${colorCategoryTableName}.id = ${anointedColorsPricesTableName}.color_category_id
        INNER JOIN ${colorTableName} ON ${colorTableName}.id = ${anointedColorsPricesTableName}.color_id
        INNER JOIN ${fabricTableName} AS dyed_fabric ON dyed_fabric.id = ${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id
        INNER JOIN ${gradeItemTableName} ON ${gradeItemTableName}.id = ${wdDyeingRequisitionDetailsTableName}.grade_item_id
        WHERE ${wdFormDyeingRequisitionDetailsTableName}.consigment_dyeing_id = ?
            AND ${wdDyeingRequisitionDetailsTableName}.is_deleted = 0
            AND ${wdDyeingRequisitionDetailsTableName}.is_active = 1
            AND ${wdDyeingRequisitionDetailsTableName}.quantity > 0)

        ORDER BY date ASC
    `;
    const bindings = [
        consigmentDyeingId,
        consigmentDyeingId,
        consigmentDyeingId,
        consigmentDyeingId,
        consigmentDyeingId,
        consigmentDyeingId,
        consigmentDyeingId,
    ];
    const [rows] = await knex.raw(sql, bindings);
    return rows;
};