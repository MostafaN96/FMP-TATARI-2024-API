
// Config
const knex = require("../../config/connection").getConnection();

// Util
const { consigmentManufacturingTableName, wcAddRequisitionTableName, wcAddRequisitionDetailsTableName, wbManufacturingOutputTableName, wbManufacturingInputOutputTableName, wbManufacturingRequisitionTableName, wcFabricOrderRequisitionTableName, wcFabricOrderRequisitionDetailsTableName, bussinessmanTableName, fabricTableName } = require("../../../util/database-tables-name");

exports.purchasesFabrics = async (whereCluse, groupByAttr) => {
    let queryResults = [];
    let columns = ["quantity", "date", "fabric_id", "name", "code"]

    await knex.select(columns).from(function () {
        this.select([
            `${wcAddRequisitionDetailsTableName}.quantity`, 
            knex.raw(`DATE_FORMAT(${wcAddRequisitionTableName}.date, "%Y/%m") as date`),
            `${wcAddRequisitionDetailsTableName}.fabric_id`, 
            `${consigmentManufacturingTableName}.name`, 
            `${consigmentManufacturingTableName}.code`, 
        ])
            .from(wcAddRequisitionDetailsTableName)
            .innerJoin(`${wcAddRequisitionTableName}`, 
            `${wcAddRequisitionTableName}.id`, 
            `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`)
            .innerJoin(`${consigmentManufacturingTableName}`, 
            `${consigmentManufacturingTableName}.id`, 
            `${wcAddRequisitionDetailsTableName}.fabric_id`)
            .where(whereCluse)
            .as('t1')
    }).as('temp')
        .orderBy('date', 'asc')
        .groupBy(groupByAttr)
        .sum("quantity as quantity")
        .then(data => {
            queryResults = data
        })
        .catch(error => {
            console.log(error);
        })
    return queryResults;
  };

exports.purchasesBySuppliers = async (whereCluse) => {
    let queryResults = [];
    let columns = ["quantity"]

    await knex.select(columns).from(function () {
        this.select([
            `${wcAddRequisitionDetailsTableName}.quantity`
        ])
            .from(wcAddRequisitionTableName)
            .innerJoin(`${wcAddRequisitionDetailsTableName}`, 
            `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`, 
            `${wcAddRequisitionTableName}.id`)
            .where(whereCluse)
            .as('t1')
    }).as('temp')
        .sum("quantity as quantity")
        .where("quantity", ">", "0")
        .then(data => {
            queryResults = data
        })
        .catch(error => {
            console.log(error);
        })
    return queryResults;
  };

exports.manufacturingReportByFabric = async (fabricId) => {
    let queryResults = [];
    let columns = ["id", "quantity", "date", "requisition_id"]

    let whereCluse = {};
    whereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;
    whereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;

    await knex.select(columns).from(function () {
        this.select([
            `${wbManufacturingOutputTableName}.id`,
            `${wbManufacturingOutputTableName}.quantity`,
            `${wbManufacturingRequisitionTableName}.date`,
            `${wbManufacturingRequisitionTableName}.id as requisition_id`
        ])
            .from(wbManufacturingOutputTableName)
            .innerJoin(`${wbManufacturingInputOutputTableName}`, 
            `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`, 
            `${wbManufacturingOutputTableName}.id`)
            .innerJoin(`${wbManufacturingRequisitionTableName}`, 
            `${wbManufacturingRequisitionTableName}.id`, 
            `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
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
  
exports.fabricOrdersReport = async (whereCluse) => {

    var queryResults = []
    let columns = [
        "wc_fabric_order_requisition_id",
        "wc_fabric_order_requisition_name",
        "wc_fabric_order_requisition_is_order",
        "wc_fabric_order_requisition_details_is_order",
        "bussiness_man_name",
        "fabric_name",
        "fabric_code",
        "needed_quantity",
        // "executed_quantity",
        "current_quantity",
        "net_current_quantity",
        "over_current_quantity",
        "over_current_quantity_ratio",
    ]

    await knex.select(columns).from(function () {
        this.select(
            [
                `${wcFabricOrderRequisitionTableName}.id as wc_fabric_order_requisition_id`,
                `${wcFabricOrderRequisitionTableName}.name as wc_fabric_order_requisition_name`,
                `${wcFabricOrderRequisitionTableName}.is_order as wc_fabric_order_requisition_is_order`,
                `${wcFabricOrderRequisitionDetailsTableName}.is_order as wc_fabric_order_requisition_details_is_order`,
                `${bussinessmanTableName}.name as bussiness_man_name`,
                `${fabricTableName}.name as fabric_name`,
                `${fabricTableName}.code as fabric_code`,
                `${wcFabricOrderRequisitionDetailsTableName}.initial_quantity  as needed_quantity`,
                // knex.raw(
                //   `CASE WHEN ${wcFabricOrderRequisitionDetailsTableName}.current_quantity > ${0}
                //   THEN coalesce( ${wcFabricOrderRequisitionDetailsTableName}.initial_quantity - ${wcFabricOrderRequisitionDetailsTableName}.current_quantity )
                //   ELSE ${0}
                //   END as executed_quantity`),
                  knex.raw(
                    `CASE WHEN ${wcFabricOrderRequisitionDetailsTableName}.current_quantity > ${0}
                    THEN coalesce( ${wcFabricOrderRequisitionDetailsTableName}.current_quantity )
                    ELSE ${0}
                    END as current_quantity`),
                            knex.raw(
                                `CASE WHEN ${wcFabricOrderRequisitionDetailsTableName}.current_quantity < ${0}
                                THEN coalesce( (${wcFabricOrderRequisitionDetailsTableName}.current_quantity * -1) + ${wcFabricOrderRequisitionDetailsTableName}.initial_quantity )
                                ELSE coalesce( ${wcFabricOrderRequisitionDetailsTableName}.initial_quantity - ${wcFabricOrderRequisitionDetailsTableName}.current_quantity )
                                END as net_current_quantity`),
                    knex.raw(
                          `CASE WHEN ${wcFabricOrderRequisitionDetailsTableName}.current_quantity < ${0}
                          THEN coalesce( ${wcFabricOrderRequisitionDetailsTableName}.current_quantity * -1 )
                          ELSE ${0}
                          END as over_current_quantity`),
      knex.raw(
      `CASE WHEN ${wcFabricOrderRequisitionDetailsTableName}.current_quantity < ${0}
      THEN coalesce( ((${wcFabricOrderRequisitionDetailsTableName}.current_quantity * -1) / ${wcFabricOrderRequisitionDetailsTableName}.initial_quantity) * 100 )
      ELSE ${0}
      END as over_current_quantity_ratio`),
            ])
            .from(`${wcFabricOrderRequisitionTableName}`)
            .innerJoin(`${wcFabricOrderRequisitionDetailsTableName}`,
                `${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`,
                `${wcFabricOrderRequisitionTableName}.id`)
            .innerJoin(`${bussinessmanTableName}`,
                `${bussinessmanTableName}.id`,
                `${wcFabricOrderRequisitionTableName}.seller_id`)
            .innerJoin(`${fabricTableName}`,
                `${fabricTableName}.id`,
                `${wcFabricOrderRequisitionDetailsTableName}.fabric_id`)
            .where(`${wcFabricOrderRequisitionDetailsTableName}.initial_quantity`, ">", 0)
            .as('t1')              
    }).as('temp')
    .where(whereCluse)
        .sum("needed_quantity as needed_quantity")
        // .sum("executed_quantity as executed_quantity")
        .sum("current_quantity as current_quantity")
        .sum("net_current_quantity as net_current_quantity")
        .sum("over_current_quantity_ratio as over_current_quantity_ratio")
        .groupBy("bussiness_man_name", "wc_fabric_order_requisition_id", 
        "fabric_name")
        .then(data => {
            queryResults = data
        })
        .catch(error => {
            console.log(error);
        })
    return queryResults
}