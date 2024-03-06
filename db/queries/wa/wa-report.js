
// Config
const { yarnTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const waAddRequisitionTableName = require("../../../util/database-tables-name").waAddRequisitionTableName;
const waAddRequisitionDetailsTableName = require("../../../util/database-tables-name").waAddRequisitionDetailsTableName;

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