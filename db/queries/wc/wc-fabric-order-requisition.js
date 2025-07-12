// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const constants = require("../../../util/constants");
const { bussinessmanTableName, wcFabricOrderRequisitionDetailsTableName,
    wcFabricOrderRequisitionTableName,
    fabricTableName,
    wcAddRequisitionDetailsTableName,
    wcTableName,
    wcReconciliationRequisitionDetailsTableName,
    wcReconciliationRequisitionTableName,
    wcReconciliationRequisitionDetailsWcTableName,
    wdTransportRequisitionWdWcDetailsTableName,
    wdTransportRequisitionWdWcTableName,
    wbManufacturingOutputTableName,
    wcAddRequisitionDetailsFabricOrderTableName,
    wcAddRequisitionTableName,
    wcTransitionBetweenWHRequisitionDetailsTableName,
    wcTransitionBetweenWHRequisitionTableName,
    wcTransitionBetweenOrdersRequisitionDetailsWcTableName,
    wcTransitionBetweenOrdersRequisitionDetailsTableName,
    wcTransitionBetweenOrdersRequisitionTableName
} = require("../../../util/database-tables-name");

exports.insert = async (wcFabricOrderRequisition) => {
    let queryResults = false;
    await sqlFun
        .insert(wcFabricOrderRequisitionTableName, {
            id: wcFabricOrderRequisition.id,
            orders_requisitions_id: wcFabricOrderRequisition.ordersRequisitionsId,
            seller_id: wcFabricOrderRequisition.sellerId,
            number: wcFabricOrderRequisition.number,
            name: wcFabricOrderRequisition.name,
            date: wcFabricOrderRequisition.date,
            note: wcFabricOrderRequisition.note,
            creator_id: wcFabricOrderRequisition.personid,
            ip_address: wcFabricOrderRequisition.ipaddress,
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
        .limitedSelect(wcFabricOrderRequisitionTableName, [
            `${wcFabricOrderRequisitionTableName}.id`
        ], whereCluse, 1)
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

    await knex(wcFabricOrderRequisitionTableName)
        .select([
            `${wcFabricOrderRequisitionTableName}.id`,
            `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
            `${wcFabricOrderRequisitionTableName}.number`,
            `${wcFabricOrderRequisitionTableName}.name`,
            `${wcFabricOrderRequisitionTableName}.date`,
            `${wcFabricOrderRequisitionTableName}.note`,
            `${wcFabricOrderRequisitionTableName}.is_order`,
            `${bussinessmanTableName}.name as seller_name`,
            `${bussinessmanTableName}.id as seller_id`,
        ])
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wcFabricOrderRequisitionTableName}.seller_id`
        )
        .where(whereCluse)
        .orderBy(`${wcFabricOrderRequisitionTableName}.number`, 'desc')
        .whereIn(`${wcFabricOrderRequisitionTableName}.id`, function () {
            this.select(`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
                .from(`${wcFabricOrderRequisitionDetailsTableName}`)
                .where({ "is_order": isOrder })
        })
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.selectStoredFabricsWc = async (whereCluseArray, isGreaterThanZero = 1) => {
    let queryResults = []
    let columns = [
        `orders_requisitions_id`,
        `id`,
        `name`,
        `number`,
        `requisition_details_id`,
        `quantity`
    ]
    await knex.select(columns).from(function () {
        this.select([
            `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
            `${wcFabricOrderRequisitionTableName}.id`,
            `${wcFabricOrderRequisitionTableName}.name`,
            `${wcFabricOrderRequisitionTableName}.number`,
            `${wcAddRequisitionDetailsTableName}.id as requisition_details_id`,
            `${wcAddRequisitionDetailsTableName}.quantity`,
            `${wcTableName}.current_quantity`
        ])
            .from(`${wcTableName}`)
            .innerJoin(`${wcAddRequisitionDetailsTableName}`,
                `${wcAddRequisitionDetailsTableName}.id`,
                `${wcTableName}.wc_add_requisition_details_id`)
            .innerJoin(`${wcAddRequisitionDetailsFabricOrderTableName}`,
                `${wcAddRequisitionDetailsFabricOrderTableName}.wc_add_requisition_details_id`,
                `${wcAddRequisitionDetailsTableName}.id`)
            .innerJoin(`${wcFabricOrderRequisitionTableName}`,
                `${wcFabricOrderRequisitionTableName}.id`,
                `${wcAddRequisitionDetailsFabricOrderTableName}.wc_fabric_order_requisition_id`)
            .where(whereCluseArray[0])
            .andWhere((qb) => {
                if (isGreaterThanZero) {
                    qb.where(`${wcTableName}.current_quantity`, ">", "0")
                } else {
                    qb.where(`${wcTableName}.current_quantity`, ">=", "0")
                }
            })
            // .groupBy(`${wcAddRequisitionDetailsTableName}.fabric_id`)
            .as('t1')
            .union(function () {
                this.select([
                    `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
                    `${wcFabricOrderRequisitionTableName}.id`,
                    `${wcFabricOrderRequisitionTableName}.name`,
                    `${wcFabricOrderRequisitionTableName}.number`,
                    `${wcReconciliationRequisitionDetailsTableName}.id as requisition_details_id`,
                    `${wcReconciliationRequisitionDetailsTableName}.quantity`,
                    `${wcTableName}.current_quantity`
                ])
                    .from(`${wcTableName}`)
                    .innerJoin(`${wcReconciliationRequisitionDetailsWcTableName}`,
                        `${wcReconciliationRequisitionDetailsWcTableName}.wc_id`,
                        `${wcTableName}.id`)
                    .innerJoin(`${wcReconciliationRequisitionDetailsTableName}`,
                        `${wcReconciliationRequisitionDetailsTableName}.id`,
                        `${wcReconciliationRequisitionDetailsWcTableName}.wc_reconcilition_requisition_details_id`)
                    .innerJoin(`${wcReconciliationRequisitionTableName}`,
                        `${wcReconciliationRequisitionTableName}.id`,
                        `${wcReconciliationRequisitionDetailsTableName}.wc_reconcilition_requisition_id`)
                    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
                        `${wcFabricOrderRequisitionTableName}.id`,
                        `${wcReconciliationRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
                    .where(whereCluseArray[1])
                    .andWhere(
                        (qb) => {
                            if (isGreaterThanZero) {
                                qb.where(`${wcTableName}.current_quantity`, ">", "0")
                            } else {
                                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
                            }
                        })
                // .groupBy(`${wcReconciliationRequisitionDetailsTableName}.fabric_id`)

            })
            .union(function () {
                this.select([
                    `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
                    `${wcFabricOrderRequisitionTableName}.id`,
                    `${wcFabricOrderRequisitionTableName}.name`,
                    `${wcFabricOrderRequisitionTableName}.number`,
                    `${wdTransportRequisitionWdWcDetailsTableName}.id as requisition_details_id`,
                    `${wdTransportRequisitionWdWcDetailsTableName}.quantity`,
                    `${wcTableName}.current_quantity`
                ])
                    .from(`${wcTableName}`)
                    .innerJoin(`${wdTransportRequisitionWdWcDetailsTableName}`,
                        `${wdTransportRequisitionWdWcDetailsTableName}.id`,
                        `${wcTableName}.wd_transport_requisition_wd_wc_details_id`)
                    .innerJoin(`${wdTransportRequisitionWdWcTableName}`,
                        `${wdTransportRequisitionWdWcTableName}.id`,
                        `${wdTransportRequisitionWdWcDetailsTableName}.wd_transport_requisition_wd_wc_id`)
                    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
                        `${wcFabricOrderRequisitionTableName}.id`,
                        `${wdTransportRequisitionWdWcDetailsTableName}.wc_fabric_order_requisition_id`)
                    .where(whereCluseArray[2])
                    .andWhere(
                        (qb) => {
                            if (isGreaterThanZero) {
                                qb.where(`${wcTableName}.current_quantity`, ">", "0")
                            } else {
                                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
                            }
                        })
            })
            .union(function () {
                this.select([
                    `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
                    `${wcFabricOrderRequisitionTableName}.id`,
                    `${wcFabricOrderRequisitionTableName}.name`,
                    `${wcFabricOrderRequisitionTableName}.number`,
                    `${wbManufacturingOutputTableName}.id as requisition_details_id`,
                    `${wbManufacturingOutputTableName}.quantity`,
                    `${wcTableName}.current_quantity`
                ])
                    .from(`${wcTableName}`)
                    .innerJoin(`${wbManufacturingOutputTableName}`,
                        `${wbManufacturingOutputTableName}.id`,
                        `${wcTableName}.wb_manufacturing_output_id`)
                    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
                        `${wcFabricOrderRequisitionTableName}.id`,
                        `${wbManufacturingOutputTableName}.wc_fabric_order_requisition_id`)
                    .where(whereCluseArray[3])
                    .andWhere(
                        (qb) => {
                            if (isGreaterThanZero) {
                                qb.where(`${wcTableName}.current_quantity`, ">", "0")
                            } else {
                                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
                            }
                        })
            })
            .union(function () {
                this.select([
                    `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
                    `${wcFabricOrderRequisitionTableName}.id`,
                    `${wcFabricOrderRequisitionTableName}.name`,
                    `${wcFabricOrderRequisitionTableName}.number`,
                    `${wcTransitionBetweenWHRequisitionDetailsTableName}.id as requisition_details_id`,
                    `${wcTransitionBetweenWHRequisitionDetailsTableName}.quantity`,
                    `${wcTableName}.current_quantity`
                ])
                    .from(`${wcTableName}`)
                    .innerJoin(`${wcTransitionBetweenWHRequisitionDetailsTableName}`,
                        `${wcTransitionBetweenWHRequisitionDetailsTableName}.id`,
                        `${wcTableName}.wc_transition_between_wh_requisitions_details_id`)
                    .innerJoin(`${wcTransitionBetweenWHRequisitionTableName}`,
                        `${wcTransitionBetweenWHRequisitionTableName}.id`,
                        `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_transition_between_wh_requisitions_id`)
                    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
                        `${wcFabricOrderRequisitionTableName}.id`,
                        `${wcTransitionBetweenWHRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
                    .where(whereCluseArray[4])
                    .andWhere(
                        (qb) => {
                            if (isGreaterThanZero) {
                                qb.where(`${wcTableName}.current_quantity`, ">", "0")
                            } else {
                                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
                            }
                        })
            })
            .union(function () {
                this.select([
                    `${wcFabricOrderRequisitionTableName}.orders_requisitions_id`,
                    `${wcFabricOrderRequisitionTableName}.id`,
                    `${wcFabricOrderRequisitionTableName}.name`,
                    `${wcFabricOrderRequisitionTableName}.number`,
                    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id as requisition_details_id`,
                    `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.quantity`,
                    `${wcTableName}.current_quantity`
                ])
                    .from(`${wcTableName}`)
                    .innerJoin(`${wcTransitionBetweenOrdersRequisitionDetailsTableName}`,
                        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.id`,
                        `${wcTableName}.wc_transition_between_orders_requisitions_details_id`)
                    .innerJoin(`${wcTransitionBetweenOrdersRequisitionTableName}`,
                        `${wcTransitionBetweenOrdersRequisitionTableName}.id`,
                        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_transition_between_orders_requisitions_id`)
                    .innerJoin(`${wcFabricOrderRequisitionTableName}`,
                        `${wcFabricOrderRequisitionTableName}.id`,
                        `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_fabric_order_requisition_id`)
                    .where(whereCluseArray[5])
                    .andWhere(
                        (qb) => {
                            if (isGreaterThanZero) {
                                qb.where(`${wcTableName}.current_quantity`, ">", "0")
                            } else {
                                qb.where(`${wcTableName}.current_quantity`, ">=", "0")
                            }
                        })
            })
    }).as('temp')
        .sum(`current_quantity as current_quantity`)
        .groupBy(`id`)
        .then(data => {
            queryResults = data
        })
        .catch(error => {
            console.log("error :::: ", error);
            queryResults = constants.errorPayload
        })
    return queryResults
}

exports.update = async (wcFabricOrderRequisition, whereCluse) => {
    let queryResults = false;
    await sqlFun
        .update(
            wcFabricOrderRequisitionTableName,
            wcFabricOrderRequisition,
            whereCluse
        )
        .then((data) => {
            queryResults = true;
        })
        .catch((err) => console.log(err));
    return queryResults;
};
