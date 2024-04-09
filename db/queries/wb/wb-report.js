
// Config
const knex = require("../../config/connection").getConnection();

// Util
const { wbManufacturingInputOutputTableName, wbManufacturingOutputTableName, wbManufacturingRequisitionTableName, bussinessmanTableName, fabricTableName, circularKnittingMachineTableName, circularKnittingMachineBussinessmanTableName, yarnTableName, wbManufacturingInputTableName, wbManufacturingOrderRequisitionDetailsTableName, wbManufacturingOrderRequisitionTableName, wbTableName } = require("../../../util/database-tables-name");
const wbQueries = require("./wb");

exports.circularKnittingMachineManufacturingReport = async () => {
    let queryResults = [];
    let whereCluse = {};
    whereCluse[`${wbManufacturingRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingRequisitionTableName}.is_active`] = 1;

    await knex.select(
        [
            `${wbManufacturingRequisitionTableName}.id`,
            `${wbManufacturingRequisitionTableName}.date`,
            `${wbManufacturingRequisitionTableName}.is_order`,
            `${bussinessmanTableName}.id as industry_id`,
            `${bussinessmanTableName}.name as industry_name`,
            `${fabricTableName}.id as fabric_id`,
            `${fabricTableName}.name as fabric_name`,
            `${fabricTableName}.code as fabric_code`,
            `${fabricTableName}.fabric_quantity_m2`,
            `${circularKnittingMachineTableName}.type as circular_knitting_machine_type`,
            `${circularKnittingMachineTableName}.number as circular_knitting_machine_number`,
            `${circularKnittingMachineTableName}.diameter as circular_knitting_machine_diameter`,
            `${circularKnittingMachineTableName}.smoothness as circular_knitting_machine_smoothness`,
            `${circularKnittingMachineTableName}.model as circular_knitting_machine_model`,
            `${wbManufacturingOutputTableName}.id as wb_manufacturing_output_id`,
            `${wbManufacturingOutputTableName}.quantity`,
            `${wbManufacturingOutputTableName}.manufacturing_fee`,
            knex.raw(`coalesce((${wbManufacturingOutputTableName}.quantity * ${wbManufacturingOutputTableName}.manufacturing_fee), 0) as cost`),
        ],
    )
        .distinct()
        .from(wbManufacturingInputOutputTableName)
        .innerJoin(`${wbManufacturingRequisitionTableName}`,
            `${wbManufacturingRequisitionTableName}.id`,
            `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wbManufacturingRequisitionTableName}.industry_id`)
        .innerJoin(`${wbManufacturingOutputTableName}`,
            `${wbManufacturingOutputTableName}.id`,
            `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`)
        .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wbManufacturingOutputTableName}.fabric_id`)
        .innerJoin(`${circularKnittingMachineBussinessmanTableName}`,
            `${circularKnittingMachineBussinessmanTableName}.id`,
            `${wbManufacturingOutputTableName}.circular_knitting_machine_bussiness_man_id`)
        .innerJoin(`${circularKnittingMachineTableName}`,
            `${circularKnittingMachineTableName}.id`,
            `${circularKnittingMachineBussinessmanTableName}.circular_knitting_machine_id`)
        .where(whereCluse)
        .andWhere(`${wbManufacturingOutputTableName}.quantity`, ">", 0)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.circularKnittingMachineReport = async () => {
    let queryResults = [];
    let whereCluse = {};
    whereCluse[`${bussinessmanTableName}.is_deleted`] = 0;
    whereCluse[`${bussinessmanTableName}.is_active`] = 1;
    whereCluse[`${bussinessmanTableName}.is_manufacturer`] = 1;

    let whereInWhereCluse = {};
    whereInWhereCluse[`${wbTableName}.is_deleted`] = 0;
    whereInWhereCluse[`${wbTableName}.is_active`] = 1;

    await knex.select([
        `${bussinessmanTableName}.id as industry_id`,
        `${bussinessmanTableName}.name as industry_name`,
        `${fabricTableName}.id as fabric_id`,
        `${fabricTableName}.name as fabric_name`,
        `${fabricTableName}.code as fabric_code`,
        `${fabricTableName}.fabric_quantity_m2`,
        `${circularKnittingMachineTableName}.type as circular_knitting_machine_type`,
        `${circularKnittingMachineTableName}.number as circular_knitting_machine_number`,
        `${circularKnittingMachineTableName}.diameter as circular_knitting_machine_diameter`,
        `${circularKnittingMachineTableName}.smoothness as circular_knitting_machine_smoothness`,
        `${circularKnittingMachineTableName}.model as circular_knitting_machine_model`,
    ])
        .distinct()
        .from(`${bussinessmanTableName}`)
        .innerJoin(`${wbTableName}`,
            `${wbTableName}.industry_id`,
            `${bussinessmanTableName}.id`)
        .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wbTableName}.fabric_to_be_manufactured_id`)
            .innerJoin(`${circularKnittingMachineBussinessmanTableName}`, function() {
                this
                  .on(`${circularKnittingMachineBussinessmanTableName}.manufacturer_id`, '=', `${bussinessmanTableName}.id`)
                //   .andOn(`${circularKnittingMachineBussinessmanTableName}.fabric_id`, '=', `${wbTableName}.fabric_to_be_manufactured_id`)
              })
        // .innerJoin(`${circularKnittingMachineBussinessmanTableName}`,
        //     `${circularKnittingMachineBussinessmanTableName}.manufacturer_id`,
        //     `${bussinessmanTableName}.id`)
        .innerJoin(`${circularKnittingMachineTableName}`,
            `${circularKnittingMachineTableName}.id`,
            `${circularKnittingMachineBussinessmanTableName}.circular_knitting_machine_id`)
        .whereIn(`${bussinessmanTableName}.id`, function () {
            this.select(`${wbTableName}.industry_id`)
                .from(wbTableName).where(whereInWhereCluse);
        })
        .andWhere(whereCluse)
        .andWhere(`${wbTableName}.current_quantity`, ">", 0)
        .groupBy(`${bussinessmanTableName}.id`, `${fabricTableName}.id`)
        .then(async (data) => {
            for (let i = 0; i < data.length; i++) {
                const element = data[i];
                let whereCluse = {};
                whereCluse[`${wbTableName}.is_deleted`] = 0;
                whereCluse[`${wbTableName}.is_active`] = 1;
                whereCluse[`${wbTableName}.industry_id`] = element.industry_id;
                whereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = element.fabric_id;

                data[i].details = await wbQueries.selectQuantityByWb(whereCluse)

            }
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.manufacturingOrdersReport = async () => {
    let queryResults = [];
    let whereCluse = {};
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_order`] = 1;

    await knex.select(
        [
            `${fabricTableName}.name as fabric_name`,
            `${fabricTableName}.code as fabric_code`,
            knex.raw(`coalesce(SUM(${wbManufacturingOrderRequisitionDetailsTableName}.initial_quantity) - SUM(${wbManufacturingOrderRequisitionDetailsTableName}.current_quantity), 0) as produced_quantity`),
        ],
    )
        .sum(`${wbManufacturingOrderRequisitionDetailsTableName}.initial_quantity as initial_quantity`)
        .sum(`${wbManufacturingOrderRequisitionDetailsTableName}.current_quantity as current_quantity`)
        .from(wbManufacturingOrderRequisitionDetailsTableName)
        .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wbManufacturingOrderRequisitionDetailsTableName}.fabric_id`)
        .where(whereCluse)
        .andWhere(`initial_quantity`, ">", 0)
        .groupBy(`${fabricTableName}.id`)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.manufacturingOrdersDetailsReport = async () => {
    let queryResults = [];
    let whereCluse = {};
    whereCluse[`${wbManufacturingOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingOrderRequisitionTableName}.is_active`] = 1;
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_order`] = 1;

    await knex.select(
        [
            `${wbManufacturingOrderRequisitionTableName}.id`,
            `${wbManufacturingOrderRequisitionTableName}.date`,
            `${wbManufacturingOrderRequisitionTableName}.number`,
            `${bussinessmanTableName}.name as seller_name`,
            `${fabricTableName}.name as fabric_name`,
            `${fabricTableName}.code as fabric_code`,
            knex.raw(`coalesce(SUM(${wbManufacturingOrderRequisitionDetailsTableName}.initial_quantity) - SUM(${wbManufacturingOrderRequisitionDetailsTableName}.current_quantity), 0) as produced_quantity`),
        ],
    )
        .sum(`${wbManufacturingOrderRequisitionDetailsTableName}.initial_quantity as initial_quantity`)
        .sum(`${wbManufacturingOrderRequisitionDetailsTableName}.current_quantity as current_quantity`)
        .from(wbManufacturingOrderRequisitionDetailsTableName)
        .innerJoin(`${wbManufacturingOrderRequisitionTableName}`,
            `${wbManufacturingOrderRequisitionTableName}.id`,
            `${wbManufacturingOrderRequisitionDetailsTableName}.wb_manufacturing_order_requisition_id`)
        .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wbManufacturingOrderRequisitionDetailsTableName}.fabric_id`)
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wbManufacturingOrderRequisitionTableName}.seller_id`)
        .where(whereCluse)
        .andWhere(`initial_quantity`, ">", 0)
        .groupBy(`${fabricTableName}.id`)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};
