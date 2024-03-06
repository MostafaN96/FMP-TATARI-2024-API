
// Config
const knex = require("../../config/connection").getConnection();

// Util
const { consigmentManufacturingTableName, wcAddRequisitionTableName, wcAddRequisitionDetailsTableName, wbManufacturingOutputTableName, wbManufacturingInputOutputTableName, wbManufacturingRequisitionTableName } = require("../../../util/database-tables-name");

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