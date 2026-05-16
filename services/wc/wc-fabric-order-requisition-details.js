// Queries
const wcFabricOrderRequisitionDetailsQueries = require("../../db/queries/wc/wc-fabric-order-requisition-details");
const wcFabricOrderRequisitionQueries = require("../../db/queries/wc/wc-fabric-order-requisition");
const ordersRequisitionsQueries = require("../../db/queries/general/orders-requisitions");
const weDyedFabricOrderRequisitionDetailsQueries = require("../../db/queries/we/we-dyed-fabric-order-requisition-details");

// Services
const ordersRequisitionsService = require("../general/orders-requisitions");
const wcFabricOrderRequisitionService = require("./wc-fabric-order-requisition");
const generalService = require("../general/general");
const waYarnOrderRequisitionDetailsService = require("../wa/wa-yarn-order-requisition-details");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wcFabricOrderRequisitionTableName, wcFabricOrderRequisitionDetailsTableName,
    wcExecuteOrderRequisitionDetailsTableName,
    ordersRequisitionsTableName,
    weDyedFabricOrderRequisitionDetailsTableName,
    wcAddRequisitionDetailsFabricOrderTableName,
    wcTransitionBetweenOrdersRequisitionDetailsTableName,
    wbManufacturingOutputTableName,
    wdTransportRequisitionWdWcDetailsTableName,
    wdTransportWcWdDetailsTableName
} = require("../../util/database-tables-name");
const knex = require("../../db/config/connection").getConnection();

exports.create = async (wcFabricOrderRequisitionDetails) => {
    // جلب الـ parent_wc_fabric_order_requisition_id الفعلي من الـ DB
    const orderRow = await knex(wcFabricOrderRequisitionTableName)
        .select('parent_wc_fabric_order_requisition_id')
        .where({ id: wcFabricOrderRequisitionDetails.id })
        .first();
    if (orderRow?.parent_wc_fabric_order_requisition_id) {
        wcFabricOrderRequisitionDetails.parentWcFabricOrderRequisitionId = orderRow.parent_wc_fabric_order_requisition_id;
    }

    for (let i = 0; i < wcFabricOrderRequisitionDetails.items.length; i++) {
        wcFabricOrderRequisitionDetails.items[i].wcFabricOrderRequisitionDetailsId = trans.transform();

        if (!wcFabricOrderRequisitionDetails.items[i].parentWcFabricOrderRequisitionDetailsId) {
            wcFabricOrderRequisitionDetails.items[i].parentWcFabricOrderRequisitionDetailsId = wcFabricOrderRequisitionDetails.items[i].wcFabricOrderRequisitionDetailsId;
        }

        const results = await wcFabricOrderRequisitionDetailsQueries.insert(wcFabricOrderRequisitionDetails, wcFabricOrderRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        }
    }

    return { ...constants.insertSuccess, ...{ id: wcFabricOrderRequisitionDetails.id } };
};

exports.createDetails = async (wcFabricOrderRequisitionDetails) => {
    // جلب الـ parent_wc_fabric_order_requisition_id الفعلي من الـ DB
    const orderRow = await knex(wcFabricOrderRequisitionTableName)
        .select('parent_wc_fabric_order_requisition_id')
        .where({ id: wcFabricOrderRequisitionDetails.id })
        .first();
    if (orderRow?.parent_wc_fabric_order_requisition_id) {
        wcFabricOrderRequisitionDetails.parentWcFabricOrderRequisitionId = orderRow.parent_wc_fabric_order_requisition_id;
    }

    for (let i = 0; i < wcFabricOrderRequisitionDetails.items.length; i++) {
        wcFabricOrderRequisitionDetails.items[i].wcFabricOrderRequisitionDetailsId = trans.transform();

        if (!wcFabricOrderRequisitionDetails.items[i].parentWcFabricOrderRequisitionDetailsId) {
            wcFabricOrderRequisitionDetails.items[i].parentWcFabricOrderRequisitionDetailsId = wcFabricOrderRequisitionDetails.items[i].wcFabricOrderRequisitionDetailsId;
        }

        const results = await wcFabricOrderRequisitionDetailsQueries.insert(wcFabricOrderRequisitionDetails, wcFabricOrderRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        }
    }
    return { ...constants.insertSuccess, ...{ id: wcFabricOrderRequisitionDetails.id } };
};

exports.createOrderWithYarnOrder = async (wcFabricOrderRequisitionDetails) => {
    const ordersRequisitionsId = wcFabricOrderRequisitionDetails.ordersRequisitionsId
    const dyedFabricOrderRequisitionId = wcFabricOrderRequisitionDetails.orderId
    const yarnOrderRequisitionId = wcFabricOrderRequisitionDetails.id
    wcFabricOrderRequisitionDetails.items = []

    // check if not created fabric order before
    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionTableName}.is_active`] = 1;
    whereCluse[`${wcFabricOrderRequisitionTableName}.orders_requisitions_id`] = ordersRequisitionsId;
    const selectFabricOrderResult = await wcFabricOrderRequisitionService.select(whereCluse)

    if (selectFabricOrderResult.length < 1) {

        const selectInquireFabricResults = await wcFabricOrderRequisitionService.inquireFabricsForOrderWc(dyedFabricOrderRequisitionId)

        if (Array.isArray(selectInquireFabricResults) && selectInquireFabricResults.length > 0) {
            for (let i = 0; i < selectInquireFabricResults.length; i++) {
                const element = selectInquireFabricResults[i];

                wcFabricOrderRequisitionDetails.items.push({
                    fabricId: element.id,
                    fabricName: element.name,
                    fabricCode: element.code,
                    quantity: element.needed_quantity,
                    fabricWidth: element.fabric_width,
                    fabricQuantityM2: element.fabric_quantity_m2,
                    note: element.details_note,
                })
            }

            // create fabric order
            await wcFabricOrderRequisitionService.create(wcFabricOrderRequisitionDetails)
            wcFabricOrderRequisitionDetails.id = yarnOrderRequisitionId
        }
    }

};

exports.selectOne = async (whereCluse) => {
    const results = await wcFabricOrderRequisitionDetailsQueries.selectOne(whereCluse);
    return results;
};

exports.selectByRequisitionIdOpenedOrder = async (requisitionId) => {
    // await this.fixCurrentQuantityOrders()
    // check is found
    const isFound = await wcFabricOrderRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = requisitionId;
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

        let results = await wcFabricOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length < 1) {
            results = await wcFabricOrderRequisitionDetailsQueries.selectOneByRequisitionId(whereCluse);
        }
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                let quantityOfDyeing = 0

                // let warehouseDetailsWhereCluse = {};
                // warehouseDetailsWhereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_details_id`] = element.id;
                // element.warehouseDetails = await wcFabricOrderRequisitionDetailsQueries.selectOutputWarehouseByRequisitionDetailsId(warehouseDetailsWhereCluse);
                            
                // Increment current_quantity
                let transportAtoBWhereCluse = {};
                transportAtoBWhereCluse[`${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_details_id`] = element.id;
                transportAtoBWhereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
                transportAtoBWhereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;
                const transprtAToBResult = await generalService.selectSum(
                    wdTransportWcWdDetailsTableName,
                    "quantity as quantity",
                    `${wdTransportWcWdDetailsTableName}.wc_fabric_order_requisition_details_id`,
                    transportAtoBWhereCluse
                );
                if (Array.isArray(transprtAToBResult) && transprtAToBResult.length > 0) {
                    quantityOfDyeing = quantityOfDyeing + transprtAToBResult[0].quantity
                }

                // Decrement current_quantity
                let transportBtoAWhereCluse = {};
                transportBtoAWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.wc_fabric_order_requisition_details_id`] = element.id;
                transportBtoAWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
                transportBtoAWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;
                const transprtBToAResult = await generalService.selectSum(
                    wdTransportRequisitionWdWcDetailsTableName,
                    "quantity as quantity",
                    `${wdTransportRequisitionWdWcDetailsTableName}.wc_fabric_order_requisition_details_id`,
                    transportBtoAWhereCluse
                );
                if (Array.isArray(transprtBToAResult) && transprtBToAResult.length > 0) {
                    quantityOfDyeing = quantityOfDyeing - transprtBToAResult[0].quantity
                }
                element.quantity_of_dyeing = quantityOfDyeing
                element.remaining_quantity_ratio = (1 - (element.quantity_of_dyeing / element.quantity)) * 100
            }
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectForCheckOpenedOrderNotExecutedWc = async (whereCluse) => {

    let results = await wcFabricOrderRequisitionDetailsQueries.selectForCheckOpenedOrderNotExecutedWc(whereCluse);
    return results;
};

exports.selectByRequisitionIdClosedOrder = async (requisitionId) => {
    // check is found
    const isFound = await wcFabricOrderRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = requisitionId;
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 0;

        let results = await wcFabricOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                let warehouseDetailsWhereCluse = {};
                warehouseDetailsWhereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_details_id`] = element.id;
                // element.warehouseDetails = await wcFabricOrderRequisitionDetailsQueries.selectOutputWarehouseByRequisitionDetailsId(warehouseDetailsWhereCluse);
            }
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByRequisitionIdOpenedOrderForWcAddRequisition = async (wcAddRequisitionDetailsId) => {

    let whereCluse = {};
    whereCluse[`${wcAddRequisitionDetailsFabricOrderTableName}.wc_add_requisition_details_id`] = wcAddRequisitionDetailsId;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

    let results = await wcFabricOrderRequisitionDetailsQueries.selectByRequisitionIdForWcAddRequisition(whereCluse);

    return results;

};

exports.closeOrder = async (wcFabricOrderRequisitionDetailsId) => {
    // check is found
    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.id`] = wcFabricOrderRequisitionDetailsId;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wcFabricOrderRequisitionDetailsQueries.selectOneForUpdate(whereCluse);
    if (isFound[0] != null) {
        // let whereCluse = {};
        // whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.id`] = wcFabricOrderRequisitionDetailsId;
        // whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        // whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;

        const results = await wcFabricOrderRequisitionDetailsQueries.update({ is_order: 0 }, whereCluse);
        if (results) {
            return constants.updateSuccess;
        } else {
            return constants.updateError;
        }
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByFabricBySeller = async (fabricId, sellerId) => {

    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.fabric_id`] = fabricId;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;
    whereCluse[`${wcFabricOrderRequisitionTableName}.seller_id`] = sellerId;

    const results = await wcFabricOrderRequisitionDetailsQueries.selectByFabricBySeller(whereCluse);
    return results;
};

exports.updateForExecuteOrder = async (objectOrderData) => {
    let wcFabricOrderRequisitionDetailsWhereCluse = {}
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.id`] = objectOrderData.wcFabricOrderRequisitionDetailsId;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;
    const selectWcFabricOrderRequisitionDetailsQueriesOneResult = await wcFabricOrderRequisitionDetailsQueries.selectOne(wcFabricOrderRequisitionDetailsWhereCluse)
    if (Array.isArray(selectWcFabricOrderRequisitionDetailsQueriesOneResult) && selectWcFabricOrderRequisitionDetailsQueriesOneResult.length > 0) {
        if (selectWcFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity > parseFloat(objectOrderData.quantity)) {
            await wcFabricOrderRequisitionDetailsQueries.update({
                current_quantity: selectWcFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity - parseFloat(objectOrderData.quantity)
            }, {
                id: objectOrderData.wcFabricOrderRequisitionDetailsId
            })
        } else {
            // here will increase needed quantity if excuted quantity greater than needed quantity
            let excessQuantity = parseFloat((objectOrderData.quantity - selectWcFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity).toFixed(3))
            await wcFabricOrderRequisitionDetailsQueries.update({
                // initial_quantity: selectWcFabricOrderRequisitionDetailsQueriesOneResult[0].initial_quantity + excessQuantity,
                // current_quantity: 0,
                // is_order: "0"
                current_quantity: selectWcFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity - parseFloat(objectOrderData.quantity),
                is_order: "0"
            }, {
                id: objectOrderData.wcFabricOrderRequisitionDetailsId
            })
        }
        return true
    }
}

exports.updateIncrementForExecuteOrder = async (objectOrderData) => {
    let wcFabricOrderRequisitionDetailsWhereCluse = {}
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.id`] = objectOrderData.wcFabricOrderRequisitionDetailsId;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    const selectWcFabricOrderRequisitionDetailsQueriesOneResult = await wcFabricOrderRequisitionDetailsQueries.selectOne(wcFabricOrderRequisitionDetailsWhereCluse)
    if (Array.isArray(selectWcFabricOrderRequisitionDetailsQueriesOneResult) && selectWcFabricOrderRequisitionDetailsQueriesOneResult.length > 0) {
        await wcFabricOrderRequisitionDetailsQueries.update({
            current_quantity: selectWcFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity + parseFloat(objectOrderData.quantity)
        }, {
            id: objectOrderData.wcFabricOrderRequisitionDetailsId
        })
        return true
    }
}

exports.updateForIncrementQuantity = async (wcFabricOrderRequisitionDetailsId, newQuantity) => {
    let wcFabricOrderRequisitionDetailsWhereCluse = {}
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.id`] = wcFabricOrderRequisitionDetailsId;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    const selectWcFabricOrderRequisitionDetailsQueriesOneResult = await wcFabricOrderRequisitionDetailsQueries.selectOne(wcFabricOrderRequisitionDetailsWhereCluse)
    if (Array.isArray(selectWcFabricOrderRequisitionDetailsQueriesOneResult) && selectWcFabricOrderRequisitionDetailsQueriesOneResult.length > 0) {
        await wcFabricOrderRequisitionDetailsQueries.update({
            current_quantity: selectWcFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity + parseFloat(newQuantity)
        }, {
            id: wcFabricOrderRequisitionDetailsId
        })
        return true
    }
}

exports.updateForDecrementQuantity = async (wcFabricOrderRequisitionDetailsId, newQuantity) => {
    let wcFabricOrderRequisitionDetailsWhereCluse = {}
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.id`] = wcFabricOrderRequisitionDetailsId;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    const selectWcFabricOrderRequisitionDetailsQueriesOneResult = await wcFabricOrderRequisitionDetailsQueries.selectOne(wcFabricOrderRequisitionDetailsWhereCluse)
    if (Array.isArray(selectWcFabricOrderRequisitionDetailsQueriesOneResult) && selectWcFabricOrderRequisitionDetailsQueriesOneResult.length > 0) {
        await wcFabricOrderRequisitionDetailsQueries.update({
            current_quantity: selectWcFabricOrderRequisitionDetailsQueriesOneResult[0].current_quantity - parseFloat(newQuantity)
        }, {
            id: wcFabricOrderRequisitionDetailsId
        })
        return true
    }
}

exports.update = async (wcFabricOrderRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {}
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.id`] = wcFabricOrderRequisitionDetails.id
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1
    const isFound = await wcFabricOrderRequisitionDetailsQueries.selectOneForUpdate(whereCluse);
    if (isFound[0] != null) {

        let updateResults = false

        wcFabricOrderRequisitionDetails.wcFabricOrderRequisitionId = isFound[0].wc_fabric_order_requisition_id

        // Update wbManufacturingOrderRequisition Without Quantity
        callArray.push(wcFabricOrderRequisitionQueries.update({
            date: wcFabricOrderRequisitionDetails.date,
            name: wcFabricOrderRequisitionDetails.name,
            note: wcFabricOrderRequisitionDetails.note,
            is_order: 1,
        },
            {
                id: wcFabricOrderRequisitionDetails.wcFabricOrderRequisitionId
            }))

        // Update wcFabricOrderRequisitionDetails Without Quantity
        callArray.push(
            wcFabricOrderRequisitionDetailsQueries.update({
                fabric_width: wcFabricOrderRequisitionDetails.fabricWidth,
                fabric_quantity_m2: wcFabricOrderRequisitionDetails.fabricQuantityM2,
                note: wcFabricOrderRequisitionDetails.note2,
                is_order: 1,
            },
                {
                    id: wcFabricOrderRequisitionDetails.id
                })
        )
        await Promise.all(callArray)


        let currentQuantity = isFound[0].current_quantity
        let oldQuantity = isFound[0].initial_quantity
        let newQuantity = wcFabricOrderRequisitionDetails.quantity
        let defferenceQuantity = 0

        // Check Quantity
        if (newQuantity > oldQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

            // active order
            await wcFabricOrderRequisitionQueries.update({
                is_order: '1'
            },
                {
                    id: wcFabricOrderRequisitionDetails.wcFabricOrderRequisitionId
                })

            // Update wb manufacturing order requisition details current quantity
            updateResults = await wcFabricOrderRequisitionDetailsQueries.update({
                initial_quantity: oldQuantity + defferenceQuantity,
                current_quantity: currentQuantity + defferenceQuantity,
                is_order: '1'
            },
                {
                    id: wcFabricOrderRequisitionDetails.id
                })

        } else if (newQuantity < oldQuantity) {
            defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

            // Check current quantity in wb manufacturing order requisition details
            if (currentQuantity >= defferenceQuantity) {

                // active order
                await wcFabricOrderRequisitionQueries.update({
                    is_order: '1'
                },
                    {
                        id: wcFabricOrderRequisitionDetails.wcFabricOrderRequisitionId
                    })

                // Update wb manufacturing order requisition details Quantity
                updateResults = await wcFabricOrderRequisitionDetailsQueries.update({
                    initial_quantity: oldQuantity - defferenceQuantity,
                    current_quantity: currentQuantity - defferenceQuantity,
                    is_order: '1'
                },
                    {
                        id: wcFabricOrderRequisitionDetails.id
                    })

            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: currentQuantity,
                    newQuantity: newQuantity
                }
            }

        } else {
            updateResults = true
        }

        if (updateResults) {
            return constants.updateSuccess;
        } else {
            return constants.updateError;
        }
    } else {
        return constants.itemNotFound;
    }
};

exports.updateQuantityForWeDyedFabricOrder = async (wcFabricOrderRequisitionDetails) => {
    let updateResults = false

    let weDyedFabricOrderRequisitionDetaisWhereCluse = {}
    weDyedFabricOrderRequisitionDetaisWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`] = wcFabricOrderRequisitionDetails.orders_requisitions_id
    weDyedFabricOrderRequisitionDetaisWhereCluse[`row_fabric.id`] = wcFabricOrderRequisitionDetails.row_fabric_id
    const weDyedFabricOrderRequisitionDetaisResults = await weDyedFabricOrderRequisitionDetailsQueries.selectByRequisitionIdsForWeDyedFabricOrder(weDyedFabricOrderRequisitionDetaisWhereCluse, [wcFabricOrderRequisitionDetails.weDyedFabricOrderRequisitionId])
    // console.log("weDyedFabricOrderRequisitionDetaisResults ::: ", weDyedFabricOrderRequisitionDetaisResults);
    if (Array.isArray(weDyedFabricOrderRequisitionDetaisResults) && weDyedFabricOrderRequisitionDetaisResults.length > 0) {

        // console.log("wcFabricOrderRequisitionDetails ::: ", wcFabricOrderRequisitionDetails);
        // console.log("wcFabricOrderRequisitionDetails.defferenceQuantity ::: ", wcFabricOrderRequisitionDetails.defferenceQuantity);
        wcFabricOrderRequisitionDetails.quantity = weDyedFabricOrderRequisitionDetaisResults[0].quantity

        let calcQuantity = wcFabricOrderRequisitionDetails.quantity
        neededFabricQuantity = parseFloat(((calcQuantity / (1 - (constants.notZero(wcFabricOrderRequisitionDetails.wasteRatio) / 100)))).toFixed(3))
        // console.log("neededFabricQuantity :::: ", neededFabricQuantity);


        let wcFabricOrderRequisitionWhereCluse = {}
        wcFabricOrderRequisitionWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`] = wcFabricOrderRequisitionDetails.orders_requisitions_id
        wcFabricOrderRequisitionWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.fabric_id`] = wcFabricOrderRequisitionDetails.row_fabric_id

        const wcFabricOrderRequisitionResult = await this.selectOne(wcFabricOrderRequisitionWhereCluse)
        // console.log("wcFabricOrderRequisitionResult :::: ", wcFabricOrderRequisitionResult);

        if (Array.isArray(wcFabricOrderRequisitionResult) && wcFabricOrderRequisitionResult.length > 0) {

            let currentQuantity = wcFabricOrderRequisitionResult[0].current_quantity
            let oldQuantity = wcFabricOrderRequisitionResult[0].initial_quantity
            let newQuantity = neededFabricQuantity
            let defferenceQuantity = 0

            // console.log("oldQuantity :::: ", oldQuantity);
            // console.log("newQuantity :::: ", newQuantity);

            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))
                console.log("defferenceQuantity :::: ", defferenceQuantity);

                // update wa yarn order quantity
                wcFabricOrderRequisitionDetails.defferenceQuantity = defferenceQuantity

                // active order
                await wcFabricOrderRequisitionQueries.update({
                    is_order: '1'
                },
                    {
                        id: wcFabricOrderRequisitionResult[0].wc_fabric_order_requisition_id
                    })

                // Update wb manufacturing order requisition details current quantity
                updateResults = await wcFabricOrderRequisitionDetailsQueries.update({
                    initial_quantity: oldQuantity + defferenceQuantity,
                    current_quantity: currentQuantity + defferenceQuantity,
                    is_order: '1'
                },
                    {
                        id: wcFabricOrderRequisitionResult[0].id
                    })


                // update wa yarn order quantity
                await waYarnOrderRequisitionDetailsService.updateQuantityForWeDyedFabricOrder(Object.assign(wcFabricOrderRequisitionDetails, wcFabricOrderRequisitionResult[0]), "inc")

            } else if (newQuantity < oldQuantity) {
                defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))
                console.log("defferenceQuantity :::: ", defferenceQuantity);

                // update wa yarn order quantity
                wcFabricOrderRequisitionDetails.defferenceQuantity = defferenceQuantity

                // Check current quantity in wb manufacturing order requisition details
                if (currentQuantity >= defferenceQuantity) {

                    // active order
                    await wcFabricOrderRequisitionQueries.update({
                        is_order: '1'
                    },
                        {
                            id: wcFabricOrderRequisitionResult[0].wc_fabric_order_requisition_id
                        })

                    // Update wb manufacturing order requisition details Quantity
                    updateResults = await wcFabricOrderRequisitionDetailsQueries.update({
                        initial_quantity: oldQuantity - defferenceQuantity,
                        current_quantity: currentQuantity - defferenceQuantity,
                        is_order: '1'
                    },
                        {
                            id: wcFabricOrderRequisitionResult[0].id
                        })

                    // update wa yarn order quantity
                    await waYarnOrderRequisitionDetailsService.updateQuantityForWeDyedFabricOrder(Object.assign(wcFabricOrderRequisitionDetails, wcFabricOrderRequisitionResult[0]), "dec")

                    let quantityIsZero = oldQuantity - defferenceQuantity
                    if (quantityIsZero == 0) {
                        await wcFabricOrderRequisitionDetailsQueries.update({
                            is_order: '0'
                        },
                            {
                                id: wcFabricOrderRequisitionResult[0].id
                            })
                    }
                } else {
                    return {
                        ...constants.wrongQuantity,
                        spentQuantity: currentQuantity,
                        newQuantity: newQuantity
                    }
                }

            } else {
                updateResults = true
            }
        }
    }
}

exports.fixCurrentQuantityOrders = async () => {

    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;

    let orderRequisitionDetailsResults = await wcFabricOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
    if (Array.isArray(orderRequisitionDetailsResults) && orderRequisitionDetailsResults.length > 0) {
        for (let i = 0; i < orderRequisitionDetailsResults.length; i++) {
            const orderRequisitionDetailsElement = orderRequisitionDetailsResults[i];
            let orderRequisitionDetailsCurrentQuantity = orderRequisitionDetailsElement.current_quantity

            // Decrement current_quantity
            let fromTransitionBetweenOrdersRequisitionDetailsWhereCluse = {};
            fromTransitionBetweenOrdersRequisitionDetailsWhereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_wc_fabric_order_requisition_details_id`] = orderRequisitionDetailsElement.id;
            fromTransitionBetweenOrdersRequisitionDetailsWhereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
            fromTransitionBetweenOrdersRequisitionDetailsWhereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;
            const fromTransitionBetweenOrdersResult = await generalService.selectSum(
                wcTransitionBetweenOrdersRequisitionDetailsTableName,
                "quantity as quantity",
                `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.from_wc_fabric_order_requisition_details_id`,
                fromTransitionBetweenOrdersRequisitionDetailsWhereCluse
            );
            if (Array.isArray(fromTransitionBetweenOrdersResult) && fromTransitionBetweenOrdersResult.length > 0) {
                orderRequisitionDetailsCurrentQuantity = orderRequisitionDetailsCurrentQuantity + fromTransitionBetweenOrdersResult[0].quantity
                await wcFabricOrderRequisitionDetailsQueries.update({
                    current_quantity: orderRequisitionDetailsCurrentQuantity
                }, {
                    id: orderRequisitionDetailsElement.id
                })
            }
            // -----------------------------------------------    ---------------------------------------------- //
            let manufacturingOutputWhereCluse = {};
            manufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.wc_fabric_order_requisition_details_id`] = orderRequisitionDetailsElement.id;
            manufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
            manufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;
            const manufacturingOutputResult = await generalService.selectSum(
                wbManufacturingOutputTableName,
                "quantity as quantity",
                `${wbManufacturingOutputTableName}.wc_fabric_order_requisition_details_id`,
                manufacturingOutputWhereCluse
            );
            if (Array.isArray(manufacturingOutputResult) && manufacturingOutputResult.length > 0) {
                orderRequisitionDetailsCurrentQuantity = orderRequisitionDetailsCurrentQuantity - manufacturingOutputResult[0].quantity
                await wcFabricOrderRequisitionDetailsQueries.update({
                    current_quantity: orderRequisitionDetailsCurrentQuantity
                }, {
                    id: orderRequisitionDetailsElement.id
                })
            }
            // -----------------------------------------------    ---------------------------------------------- //
            // Increment current_quantity
            let toTransitionBetweenOrdersRequisitionDetailsWhereCluse = {};
            toTransitionBetweenOrdersRequisitionDetailsWhereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_fabric_order_requisition_details_id`] = orderRequisitionDetailsElement.id;
            toTransitionBetweenOrdersRequisitionDetailsWhereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_deleted`] = 0;
            toTransitionBetweenOrdersRequisitionDetailsWhereCluse[`${wcTransitionBetweenOrdersRequisitionDetailsTableName}.is_active`] = 1;
            const toTransitionBetweenOrdersResult = await generalService.selectSum(
                wcTransitionBetweenOrdersRequisitionDetailsTableName,
                "quantity as quantity",
                `${wcTransitionBetweenOrdersRequisitionDetailsTableName}.wc_fabric_order_requisition_details_id`,
                toTransitionBetweenOrdersRequisitionDetailsWhereCluse
            );
            if (Array.isArray(toTransitionBetweenOrdersResult) && toTransitionBetweenOrdersResult.length > 0) {
                orderRequisitionDetailsCurrentQuantity = orderRequisitionDetailsCurrentQuantity - toTransitionBetweenOrdersResult[0].quantity
                await wcFabricOrderRequisitionDetailsQueries.update({
                    current_quantity: orderRequisitionDetailsCurrentQuantity
                }, {
                    id: orderRequisitionDetailsElement.id
                })
            }
            // -----------------------------------------------    ---------------------------------------------- //
            if(orderRequisitionDetailsResults.length-1 == i ) {
                console.log("Finish ============== > fixCurrentQuantityOrders ");
            }
        }

    }

}