// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { bussinessmanTableName, waYarnOrderRequisitionDetailsTableName,
    waYarnOrderRequisitionTableName,
    fabricTableName,
    yarnTableName,
    waTableName,
    waAddRequisitionDetailsTableName,
    waReconciliationRequisitionDetailsWaTableName,
    waReconciliationRequisitionDetailsTableName,
    waReconciliationRequisitionTableName,
    waAddRequisitionDetailsYarnOrderTableName,
    wbTransportRequisitionWbWaDetailsTableName,
    wbTransportRequisitionWbWaTableName,
    waTransitionBetweenWHRequisitionDetailsTableName,
    waTransitionBetweenWHRequisitionTableName,
    wbTransportWaWbDetailsTableName,
    wbTableName,
    wbReconciliationRequisitionDetailsWbTableName,
    wbReconciliationRequisitionDetailsTableName,
    wbReconciliationRequisitionTableName,
    wbTransitionBetweenIndustriesRequisitionDetailsTableName,
    wbTransitionBetweenIndustriesRequisitionTableName,
    waAddRequisitionTableName } = require("../../../util/database-tables-name");

exports.insert = async (waYarnOrderRequisition) => {
    let queryResults = false;
    await sqlFun
        .insert(waYarnOrderRequisitionTableName, {
            id: waYarnOrderRequisition.id,
            orders_requisitions_id: waYarnOrderRequisition.ordersRequisitionsId,
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
        .whereIn(`${waYarnOrderRequisitionTableName}.id`, function () {
            this.select(`${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
                .from(`${waYarnOrderRequisitionDetailsTableName}`)
                .where({ "is_order": isOrder })
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

exports.selectByYarnWa = async (whereCluse) => {

    let queryResults = [];
    let columns = [
        `id`,
        `wa_yarn_order_requisition_id`,
        `orders_requisitions_id`,
        `name`,
        `number`,
    ]
    await knex.select(columns).from(function () {
        this.select([
            `${waYarnOrderRequisitionDetailsTableName}.id`,
            `${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`,
            `${waYarnOrderRequisitionTableName}.orders_requisitions_id`,
            `${waYarnOrderRequisitionTableName}.name`,
            `${waYarnOrderRequisitionTableName}.number`,
        ])
            .from(`${waYarnOrderRequisitionDetailsTableName}`)
            .innerJoin(`${waYarnOrderRequisitionTableName}`,
                `${waYarnOrderRequisitionTableName}.id`,
                `${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
            .where(whereCluse)
            .as('t1')
    }).as('temp')
        .groupBy(`id`)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;

}

exports.selectByWarehouseWa = async (whereCluseArray) => {

    let queryResults = [];
    let columns = [
        `orders_requisitions_id`,
        `id`,
        `name`,
        `number`,
        `wa_add_requisition_id`,
        `supplier_id`,
        `current_quantity`,
    ]
    await knex.select(columns).from(function () {
        this.select([
            `${waYarnOrderRequisitionTableName}.orders_requisitions_id`,
            `${waYarnOrderRequisitionTableName}.id`,
            `${waYarnOrderRequisitionTableName}.name`,
            `${waYarnOrderRequisitionTableName}.number`,
            `${waTableName}.wa_add_requisition_id`,
            `${waTableName}.supplier_id`,
            `${waTableName}.current_quantity`,
        ])
            .from(`${waTableName}`)
            .innerJoin(`${waAddRequisitionDetailsTableName}`,
                `${waAddRequisitionDetailsTableName}.id`,
                `${waTableName}.wa_add_requisition_details_id`)
            .innerJoin(`${waAddRequisitionDetailsYarnOrderTableName}`,
                `${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`,
                `${waAddRequisitionDetailsTableName}.id`)
            .innerJoin(`${waYarnOrderRequisitionTableName}`,
                `${waYarnOrderRequisitionTableName}.id`,
                `${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`)
            .where(whereCluseArray[0])
            .as('t1')
            .union(function () {
                this.select([
                    `${waYarnOrderRequisitionTableName}.orders_requisitions_id`,
                    `${waYarnOrderRequisitionTableName}.id`,
                    `${waYarnOrderRequisitionTableName}.name`,
                    `${waYarnOrderRequisitionTableName}.number`,
                    `${waTableName}.wa_add_requisition_id`,
                    `${waTableName}.supplier_id`,
                    `${waTableName}.current_quantity`,
                ])
                    .from(`${waTableName}`)
                    .innerJoin(`${waReconciliationRequisitionDetailsWaTableName}`,
                        `${waReconciliationRequisitionDetailsWaTableName}.wa_id`,
                        `${waTableName}.id`)
                    .innerJoin(`${waReconciliationRequisitionDetailsTableName}`,
                        `${waReconciliationRequisitionDetailsTableName}.id`,
                        `${waReconciliationRequisitionDetailsWaTableName}.wa_reconcilition_requisition_details_id`)
                    .innerJoin(`${waReconciliationRequisitionTableName}`,
                        `${waReconciliationRequisitionTableName}.id`,
                        `${waReconciliationRequisitionDetailsTableName}.wa_reconcilition_requisition_id`)
                    .innerJoin(`${waYarnOrderRequisitionTableName}`,
                        `${waYarnOrderRequisitionTableName}.id`,
                        `${waReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
                    .where(whereCluseArray[1])
            })
            .union(function () {
                this.select([
                    `${waYarnOrderRequisitionTableName}.orders_requisitions_id`,
                    `${waYarnOrderRequisitionTableName}.id`,
                    `${waYarnOrderRequisitionTableName}.name`,
                    `${waYarnOrderRequisitionTableName}.number`,
                    `${waTableName}.wa_add_requisition_id`,
                    `${waTableName}.supplier_id`,
                    `${waTableName}.current_quantity`,
                ])
                    .from(`${waTableName}`)
                    .innerJoin(`${wbTransportRequisitionWbWaDetailsTableName}`,
                        `${wbTransportRequisitionWbWaDetailsTableName}.id`,
                        `${waTableName}.wb_transport_requisition_wb_wa_details_id`)
                    .innerJoin(`${wbTransportRequisitionWbWaTableName}`,
                        `${wbTransportRequisitionWbWaTableName}.id`,
                        `${wbTransportRequisitionWbWaDetailsTableName}.wb_transport_requisition_wb_wa_id`)
                    .innerJoin(`${waYarnOrderRequisitionTableName}`,
                        `${waYarnOrderRequisitionTableName}.id`,
                        `${wbTransportRequisitionWbWaDetailsTableName}.wa_yarn_order_requisition_id`)
                    .where(whereCluseArray[3])
            })
            .union(function () {
                this.select([
                    `${waYarnOrderRequisitionTableName}.orders_requisitions_id`,
                    `${waYarnOrderRequisitionTableName}.id`,
                    `${waYarnOrderRequisitionTableName}.name`,
                    `${waYarnOrderRequisitionTableName}.number`,
                    `${waTableName}.wa_add_requisition_id`,
                    `${waTableName}.supplier_id`,
                    `${waTableName}.current_quantity`,
                ])
                    .from(`${waTableName}`)
                    .innerJoin(`${waTransitionBetweenWHRequisitionDetailsTableName}`,
                        `${waTransitionBetweenWHRequisitionDetailsTableName}.id`,
                        `${waTableName}.wa_transition_between_wh_requisitions_details_id`)
                    .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
                        `${waTransitionBetweenWHRequisitionTableName}.id`,
                        `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
                    .innerJoin(`${waYarnOrderRequisitionTableName}`,
                        `${waYarnOrderRequisitionTableName}.id`,
                        `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
                    .where(whereCluseArray[4])
            })
    }).as('temp')
        .where(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
        .groupBy(`id`)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;

}

exports.selectByWarehouseBySupplierWa = async (whereCluseArray) => {

    let queryResults = [];
    let columns = [
        `orders_requisitions_id`,
        `id`,
        `name`,
        `number`,
        `wa_add_requisition_id`,
        `supplier_id`,
        `current_quantity`,
    ]
    await knex.select(columns).from(function () {
        this.select([
            `${waYarnOrderRequisitionTableName}.orders_requisitions_id`,
            `${waYarnOrderRequisitionTableName}.id`,
            `${waYarnOrderRequisitionTableName}.name`,
            `${waYarnOrderRequisitionTableName}.number`,
            `${waTableName}.wa_add_requisition_id`,
            `${waTableName}.supplier_id`,
            `${waTableName}.current_quantity`,
        ])
            .from(`${waTableName}`)
            .innerJoin(`${waAddRequisitionDetailsTableName}`,
                `${waAddRequisitionDetailsTableName}.id`,
                `${waTableName}.wa_add_requisition_details_id`)
            .innerJoin(`${waAddRequisitionTableName}`,
                `${waAddRequisitionTableName}.id`,
                `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`)
            .innerJoin(`${waAddRequisitionDetailsYarnOrderTableName}`,
                `${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`,
                `${waAddRequisitionDetailsTableName}.id`)
            .innerJoin(`${waYarnOrderRequisitionTableName}`,
                `${waYarnOrderRequisitionTableName}.id`,
                `${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`)
            .where(whereCluseArray[0])
            .as('t1')
            .union(function () {
                this.select([
                    `${waYarnOrderRequisitionTableName}.orders_requisitions_id`,
                    `${waYarnOrderRequisitionTableName}.id`,
                    `${waYarnOrderRequisitionTableName}.name`,
                    `${waYarnOrderRequisitionTableName}.number`,
                    `${waTableName}.wa_add_requisition_id`,
                    `${waTableName}.supplier_id`,
                    `${waTableName}.current_quantity`,
                ])
                    .from(`${waTableName}`)
                    .innerJoin(`${waTransitionBetweenWHRequisitionDetailsTableName}`,
                        `${waTransitionBetweenWHRequisitionDetailsTableName}.id`,
                        `${waTableName}.wa_transition_between_wh_requisitions_details_id`)
                    .innerJoin(`${waTransitionBetweenWHRequisitionTableName}`,
                        `${waTransitionBetweenWHRequisitionTableName}.id`,
                        `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`)
                    .innerJoin(`${waYarnOrderRequisitionTableName}`,
                        `${waYarnOrderRequisitionTableName}.id`,
                        `${waTransitionBetweenWHRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
                    .where(whereCluseArray[2])
            })
    }).as('temp')
        .where(whereCluseArray[1].whereTableName, whereCluseArray[1].operator, whereCluseArray[1].value)
        .groupBy(`id`)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;

}

exports.selectByIndustryByFabricWb = async (whereCluseArray) => {

    let queryResults = [];
    let columns = [
        `orders_requisitions_id`,
        `id`,
        `name`,
        `number`,
        `current_quantity`,
    ]
    await knex.select(columns).from(function () {
        this.select([
            `${waYarnOrderRequisitionTableName}.orders_requisitions_id`,
            `${waYarnOrderRequisitionTableName}.id`,
            `${waYarnOrderRequisitionTableName}.name`,
            `${waYarnOrderRequisitionTableName}.number`,
            `${wbTableName}.current_quantity`,
        ])
            .from(`${wbTableName}`)
            .innerJoin(`${wbTransportWaWbDetailsTableName}`,
                `${wbTransportWaWbDetailsTableName}.id`,
                `${wbTableName}.wb_transport_wa_wb_details_id`)
            .innerJoin(`${waYarnOrderRequisitionTableName}`,
                `${waYarnOrderRequisitionTableName}.id`,
                `${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`)
            .where(whereCluseArray[0])
            .as('t1')
            .union(function () {
                this.select([
                    `${waYarnOrderRequisitionTableName}.orders_requisitions_id`,
                    `${waYarnOrderRequisitionTableName}.id`,
                    `${waYarnOrderRequisitionTableName}.name`,
                    `${waYarnOrderRequisitionTableName}.number`,
                    `${wbTableName}.current_quantity`,
                ])
                    .from(`${wbTableName}`)
                    .innerJoin(`${wbReconciliationRequisitionDetailsWbTableName}`,
                        `${wbReconciliationRequisitionDetailsWbTableName}.wb_id`,
                        `${wbTableName}.id`)
                    .innerJoin(`${wbReconciliationRequisitionDetailsTableName}`,
                        `${wbReconciliationRequisitionDetailsTableName}.id`,
                        `${wbReconciliationRequisitionDetailsWbTableName}.wb_reconcilition_requisition_details_id`)
                    .innerJoin(`${wbReconciliationRequisitionTableName}`,
                        `${wbReconciliationRequisitionTableName}.id`,
                        `${wbReconciliationRequisitionDetailsTableName}.wb_reconcilition_requisition_id`)
                    .innerJoin(`${waYarnOrderRequisitionTableName}`,
                        `${waYarnOrderRequisitionTableName}.id`,
                        `${wbReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
                    .where(whereCluseArray[1])
            })
            .union(function () {
                this.select([
                    `${waYarnOrderRequisitionTableName}.orders_requisitions_id`,
                    `${waYarnOrderRequisitionTableName}.id`,
                    `${waYarnOrderRequisitionTableName}.name`,
                    `${waYarnOrderRequisitionTableName}.number`,
                    `${wbTableName}.current_quantity`,
                ])
                    .from(`${wbTableName}`)
                    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}`,
                        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`,
                        `${wbTableName}.wb_transition_between_industries_requisition_details_id`)
                    .innerJoin(`${wbTransitionBetweenIndustriesRequisitionTableName}`,
                        `${wbTransitionBetweenIndustriesRequisitionTableName}.id`,
                        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wb_transition_between_industries_requisition_id`)
                    .innerJoin(`${waYarnOrderRequisitionTableName}`,
                        `${waYarnOrderRequisitionTableName}.id`,
                        `${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wa_yarn_order_requisition_id`)
                    .where(whereCluseArray[3])
            })
    }).as('temp')
        .where(whereCluseArray[2].whereTableName, whereCluseArray[2].operator, whereCluseArray[2].value)
        .groupBy(`id`)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;

}