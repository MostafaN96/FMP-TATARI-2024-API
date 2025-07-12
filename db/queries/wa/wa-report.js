
// Config
const { yarnTableName, bussinessmanTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const {waAddRequisitionTableName, 
    waAddRequisitionDetailsTableName,
    waYarnOrderRequisitionTableName,
    waYarnOrderRequisitionDetailsTableName,

} = require("../../../util/database-tables-name");

exports.purchasesYarns = async (whereCluse, groupByAttr) => {
    let queryResults = [];
    let columns = ["quantity", "date", "yarn_id", "name", "code"]

    await knex.select(columns).from(function () {
        this.select([
            `${waAddRequisitionDetailsTableName}.quantity`, 
            knex.raw(`DATE_FORMAT(${waAddRequisitionTableName}.date, "%Y/%m") as date`),
            `${waAddRequisitionDetailsTableName}.yarn_id`, 
            `${yarnTableName}.name`, 
            `${yarnTableName}.code`, 
        ])
            .from(waAddRequisitionDetailsTableName)
            .innerJoin(`${waAddRequisitionTableName}`, 
            `${waAddRequisitionTableName}.id`, 
            `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
            .innerJoin(`${yarnTableName}`, 
            `${yarnTableName}.id`, 
            `${waAddRequisitionDetailsTableName}.yarn_id`)
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
            `${waAddRequisitionDetailsTableName}.quantity`
        ])
            .from(waAddRequisitionTableName)
            .innerJoin(`${waAddRequisitionDetailsTableName}`, 
            `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`, 
            `${waAddRequisitionTableName}.id`)
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

  
exports.yarnOrdersReport = async (whereCluse) => {

    var queryResults = []
    let columns = [
        "wa_yarn_order_requisition_id",
        "wa_yarn_order_requisition_name",
        "wa_yarn_order_requisition_is_order",
        "wa_yarn_order_requisition_details_is_order",
        "bussiness_man_name",
        "yarn_name",
        "yarn_code",
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
                `${waYarnOrderRequisitionTableName}.id as wa_yarn_order_requisition_id`,
                `${waYarnOrderRequisitionTableName}.name as wa_yarn_order_requisition_name`,
                `${waYarnOrderRequisitionTableName}.is_order as wa_yarn_order_requisition_is_order`,
                `${waYarnOrderRequisitionDetailsTableName}.is_order as wa_yarn_order_requisition_details_is_order`,
                `${bussinessmanTableName}.name as bussiness_man_name`,
                `${yarnTableName}.name as yarn_name`,
                `${yarnTableName}.code as yarn_code`,
                `${waYarnOrderRequisitionDetailsTableName}.initial_quantity  as needed_quantity`,
                // knex.raw(
                //   `CASE WHEN ${waYarnOrderRequisitionDetailsTableName}.current_quantity > ${0}
                //   THEN coalesce( ${waYarnOrderRequisitionDetailsTableName}.initial_quantity - ${waYarnOrderRequisitionDetailsTableName}.current_quantity )
                //   ELSE ${0}
                //   END as executed_quantity`),
                  knex.raw(
                    `CASE WHEN ${waYarnOrderRequisitionDetailsTableName}.current_quantity > ${0}
                    THEN coalesce( ${waYarnOrderRequisitionDetailsTableName}.current_quantity )
                    ELSE ${0}
                    END as current_quantity`),
                            knex.raw(
                                `CASE WHEN ${waYarnOrderRequisitionDetailsTableName}.current_quantity < ${0}
                                THEN coalesce( (${waYarnOrderRequisitionDetailsTableName}.current_quantity * -1) + ${waYarnOrderRequisitionDetailsTableName}.initial_quantity )
                                ELSE coalesce( ${waYarnOrderRequisitionDetailsTableName}.initial_quantity - ${waYarnOrderRequisitionDetailsTableName}.current_quantity )
                                END as net_current_quantity`),
                    knex.raw(
                          `CASE WHEN ${waYarnOrderRequisitionDetailsTableName}.current_quantity < ${0}
                          THEN coalesce( ${waYarnOrderRequisitionDetailsTableName}.current_quantity * -1 )
                          ELSE ${0}
                          END as over_current_quantity`),
      knex.raw(
      `CASE WHEN ${waYarnOrderRequisitionDetailsTableName}.current_quantity < ${0}
      THEN coalesce( ((${waYarnOrderRequisitionDetailsTableName}.current_quantity * -1) / ${waYarnOrderRequisitionDetailsTableName}.initial_quantity) * 100 )
      ELSE ${0}
      END as over_current_quantity_ratio`),
            ])
            .from(`${waYarnOrderRequisitionTableName}`)
            .innerJoin(`${waYarnOrderRequisitionDetailsTableName}`,
                `${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`,
                `${waYarnOrderRequisitionTableName}.id`)
            .innerJoin(`${bussinessmanTableName}`,
                `${bussinessmanTableName}.id`,
                `${waYarnOrderRequisitionTableName}.seller_id`)
            .innerJoin(`${yarnTableName}`,
                `${yarnTableName}.id`,
                `${waYarnOrderRequisitionDetailsTableName}.yarn_id`)
            .where(`${waYarnOrderRequisitionDetailsTableName}.initial_quantity`, ">", 0)
            .as('t1')              
    }).as('temp')
    .where(whereCluse)
        .sum("needed_quantity as needed_quantity")
        // .sum("executed_quantity as executed_quantity")
        .sum("current_quantity as current_quantity")
        .sum("net_current_quantity as net_current_quantity")
        .sum("over_current_quantity as over_current_quantity")
        .sum("over_current_quantity_ratio as over_current_quantity_ratio")
        .groupBy("bussiness_man_name", "wa_yarn_order_requisition_id", 
        "yarn_name")
        .then(data => {
            queryResults = data
        })
        .catch(error => {
            console.log(error);
        })
    return queryResults
}