// Queries
const weQueries = require("../../db/queries/we/we");
const weAddRequisitionDetailsQueries = require("../../db/queries/we/we-add-requisition-details");
const weReconciliationRequisitionDetailsQueries = require("../../db/queries/we/we-reconciliation-requisition-details");
const wdFormDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-form-dyeing-requisition-details");
const wdDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-dyeing-requisition-details");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");

// Services
const weSellRequisitionDirectDetailsService = require("./we-sell-requisition-direct-details");

// Helper
const trans = require("../../helpers/transform");
const { weTableName, weReconciliationRequisitionDetailsTableName, weAddRequisitionDetailsTableName, wdDyeingRequisitionDetailsTableName, anointedColorsPricesTableName, weAddRequisitionTableName, weSellRequisitionTableName, wdFormDyeingRequisitionDetailsTableName, weTransitionBetweenWHRequisitionDetailsTableName, weExecuteOrderRequisitionDetailsTableName, weReturnSellRequisitionDetailsTableName } = require("../../util/database-tables-name");

exports.create = async (we, items) => {
    we.weId = trans.transform();

    const results = await weQueries.insert(we, items);
    if (results) {
        return constants.insertSuccess;
    } else {
        return constants.insertError;
    }
};


exports.createForDyeing = async (we, items) => {

    const results = await weQueries.insertForDyeing(we, items);
    if (results) {
        return constants.insertSuccess;
    } else {
        return constants.insertError;
    }
};

exports.createForReconciliation = async (we, items) => {
    we.weId = trans.transform();

    const results = await weQueries.insertForReconciliation(we, items);
    if (results) {
        return constants.insertSuccess;
    } else {
        return constants.insertError;
    }
};

// exports.createForReturnSell = async (we, items) => {

//     const results = await weQueries.createForReturnSell(we, items);
//     if (results) {
//         return constants.insertSuccess;
//     } else {
//         return constants.insertError;
//     }
// };

exports.selectStoreWe = async () => {
    let whereCluse = {};
    whereCluse[`${weTableName}.is_deleted`] = 0;
    whereCluse[`${weTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${weTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${weTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${weTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let dyeingWhereCluse = {};
    dyeingWhereCluse[`${weTableName}.is_deleted`] = 0;
    dyeingWhereCluse[`${weTableName}.is_active`] = 1;
    dyeingWhereCluse[`${weTableName}.type`] = constantsPayloads.dyeingType;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${weTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${weTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${weTableName}.type`] = constantsPayloads.transportBetweenType;

    let returnSellWhereCluse = {};
    returnSellWhereCluse[`${weTableName}.is_deleted`] = 0;
    returnSellWhereCluse[`${weTableName}.is_active`] = 1;
    returnSellWhereCluse[`${weTableName}.type`] = constantsPayloads.returnSellType;

    let transitionBetweenOrdersWhereCluse = {};
    transitionBetweenOrdersWhereCluse[`${weTableName}.is_deleted`] = 0;
    transitionBetweenOrdersWhereCluse[`${weTableName}.is_active`] = 1;
    transitionBetweenOrdersWhereCluse[`${weTableName}.type`] = constantsPayloads.transportBetweenOrdersType;


    let andWhereCluse = {whereTableName: `current_quantity`, operator: ">", value: "0"}
    let whereCluseArray = [
        whereCluse, reconciliationWhereCluse, 
        andWhereCluse, dyeingWhereCluse, 
        transitionBetweenWhWhereCluse,
        returnSellWhereCluse,
        transitionBetweenOrdersWhereCluse
    ]
    let orderByCluse = {attributeName: `date`, value: "desc"}

    const results = await weQueries.selectStoreWe(whereCluseArray, orderByCluse);
    const selectSellDirectQuantity = await weQueries.selectSellDirectQuantity(results)
    return selectSellDirectQuantity;
};

exports.selectStoreWeByWeDyedFabricOrderRequisitionIdOfOrderDyedFabrics = async (weDyedFabricOrderRequisitionId) => {
    let whereCluse = {};
    whereCluse[`${weTableName}.is_deleted`] = 0;
    whereCluse[`${weTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${weTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${weTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${weTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let dyeingWhereCluse = {};
    dyeingWhereCluse[`${weTableName}.is_deleted`] = 0;
    dyeingWhereCluse[`${weTableName}.is_active`] = 1;
    dyeingWhereCluse[`${weTableName}.type`] = constantsPayloads.dyeingType;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${weTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${weTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${weTableName}.type`] = constantsPayloads.transportBetweenType;

    let returnSellWhereCluse = {};
    returnSellWhereCluse[`${weTableName}.is_deleted`] = 0;
    returnSellWhereCluse[`${weTableName}.is_active`] = 1;
    returnSellWhereCluse[`${weTableName}.type`] = constantsPayloads.returnSellType;

    let transitionBetweenOrdersWhereCluse = {};
    transitionBetweenOrdersWhereCluse[`${weTableName}.is_deleted`] = 0;
    transitionBetweenOrdersWhereCluse[`${weTableName}.is_active`] = 1;
    transitionBetweenOrdersWhereCluse[`${weTableName}.type`] = constantsPayloads.transportBetweenOrdersType;

    let andWhereCluse = {whereTableName: `current_quantity`, operator: ">", value: "0"}
    let whereCluseArray = [
        whereCluse, reconciliationWhereCluse, 
        andWhereCluse, dyeingWhereCluse, 
        transitionBetweenWhWhereCluse,
        returnSellWhereCluse,
        transitionBetweenOrdersWhereCluse
    ]
    let orderByCluse = {attributeName: `date`, value: "desc"}

    const results = await weQueries.selectStoreWeByWeDyedFabricOrderRequisitionIdOfOrderDyedFabrics(whereCluseArray, orderByCluse, weDyedFabricOrderRequisitionId);
    const selectSellDirectQuantity = await weQueries.selectSellDirectQuantity(results)
    return selectSellDirectQuantity;
};

exports.selectStoreBySupplierForReturnWe = async (supplierId) => {
    let whereCluse = {};
    whereCluse[`${weTableName}.is_deleted`] = 0;
    whereCluse[`${weTableName}.is_active`] = 1;
    whereCluse[`${weAddRequisitionTableName}.supplier_id`] = supplierId;

    let andWhereCluse = {whereTableName: `current_quantity`, operator: ">", value: "0"}
    let whereCluseArray = [whereCluse, andWhereCluse]
    let orderByCluse = {attributeName: `date`, value: "desc"}

    const results = await weQueries.selectStoreBySupplierForReturnWe(whereCluseArray, orderByCluse);
    return results;
};

exports.selectSoldedBySellerForReturnSellWe = async (sellerId) => {
    let whereCluse = {};
    whereCluse[`${weTableName}.is_deleted`] = 0;
    whereCluse[`${weTableName}.is_active`] = 1;
    whereCluse[`${weSellRequisitionTableName}.seller_id`] = sellerId;

    let dyeingWhereCluse = {};
    dyeingWhereCluse[`${weTableName}.is_deleted`] = 0;
    dyeingWhereCluse[`${weTableName}.is_active`] = 1;
    dyeingWhereCluse[`${weSellRequisitionTableName}.seller_id`] = sellerId;
    dyeingWhereCluse[`${weTableName}.type`] = constantsPayloads.dyeingType;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${weTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${weTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${weSellRequisitionTableName}.seller_id`] = sellerId;
    transitionBetweenWhWhereCluse[`${weTableName}.type`] = constantsPayloads.transportBetweenType;

    let returnSellWhereCluse = {};
    returnSellWhereCluse[`${weTableName}.is_deleted`] = 0;
    returnSellWhereCluse[`${weTableName}.is_active`] = 1;
    returnSellWhereCluse[`${weSellRequisitionTableName}.seller_id`] = sellerId;
    returnSellWhereCluse[`${weTableName}.type`] = constantsPayloads.returnSellType;

    let andWhereCluse = {whereTableName: `current_quantity`, operator: ">", value: "0"}
    let whereCluseArray = [whereCluse, dyeingWhereCluse, andWhereCluse, 
        transitionBetweenWhWhereCluse, returnSellWhereCluse]
    let orderByCluse = {attributeName: `date`, value: "desc"}

    const soldedData = await weQueries.selectSoldedBySellerForReturnSellWe(whereCluseArray, orderByCluse);
    const soldedDataWithDyeingServicesWeResult = await weQueries.selectStoreWithDyeingServicesWe(soldedData);
    return soldedDataWithDyeingServicesWeResult;
};

exports.selectStoreForDirectSellWe = async (requisitionId) => {
    const results = []
    const responseData = []
    const selectRequisitionResults = await weSellRequisitionDirectDetailsService.selectByRequisitionIdForConfirm(requisitionId);
    for (let i = 0; i < selectRequisitionResults.length; i++) {
        const record = selectRequisitionResults[i];
        
        let whereCluse = {};
        whereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = record.dyed_fabric_id;
        whereCluse[`${weAddRequisitionDetailsTableName}.work_order_number`] = record.work_order_number;
        whereCluse[`${weAddRequisitionDetailsTableName}.color_id`] = record.color_id;
        whereCluse[`${weTableName}.is_deleted`] = 0;
        whereCluse[`${weTableName}.is_active`] = 1;
    
        let reconciliationWhereCluse = {};
        reconciliationWhereCluse[`${weTableName}.is_deleted`] = 0;
        reconciliationWhereCluse[`${weTableName}.is_active`] = 1;
        reconciliationWhereCluse[`${weTableName}.type`] = constantsPayloads.reconcilitionType;
        reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`] = record.dyed_fabric_id;
        reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.work_order_number`] = record.work_order_number;
        reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.color_id`] = record.color_id;
        reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    
        let dyeingWhereCluse = {};
        dyeingWhereCluse[`${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`] = record.dyed_fabric_id;
        dyeingWhereCluse[`${wdDyeingRequisitionDetailsTableName}.work_order_number`] = record.work_order_number;
        dyeingWhereCluse[`${anointedColorsPricesTableName}.color_id`] = record.color_id;
        dyeingWhereCluse[`${weTableName}.is_deleted`] = 0;
        dyeingWhereCluse[`${weTableName}.is_active`] = 1;
        dyeingWhereCluse[`${weTableName}.type`] = constantsPayloads.dyeingType;
    
        let transitionBetweenWhWhereCluse = {};
        transitionBetweenWhWhereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.dyed_fabric_id`] = record.dyed_fabric_id;
        transitionBetweenWhWhereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.work_order_number`] = record.work_order_number;
        transitionBetweenWhWhereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`] = record.color_id;
        transitionBetweenWhWhereCluse[`${weTableName}.is_deleted`] = 0;
        transitionBetweenWhWhereCluse[`${weTableName}.is_active`] = 1;
        transitionBetweenWhWhereCluse[`${weTableName}.type`] = constantsPayloads.transportBetweenType;
    
        let returnSellWhereCluse = {};
        returnSellWhereCluse[`${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`] = record.dyed_fabric_id;
        returnSellWhereCluse[`${weReturnSellRequisitionDetailsTableName}.work_order_number`] = record.work_order_number;
        returnSellWhereCluse[`${weReturnSellRequisitionDetailsTableName}.color_id`] = record.color_id;
        returnSellWhereCluse[`${weTableName}.is_deleted`] = 0;
        returnSellWhereCluse[`${weTableName}.is_active`] = 1;
        returnSellWhereCluse[`${weTableName}.type`] = constantsPayloads.returnSellType;
    
        // let executeOrderWhereCluse = {};
        // executeOrderWhereCluse[`${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`] = record.dyed_fabric_id;
        // executeOrderWhereCluse[`${weExecuteOrderRequisitionDetailsTableName}.work_order_number`] = record.work_order_number;
        // executeOrderWhereCluse[`${weExecuteOrderRequisitionDetailsTableName}.color_id`] = record.color_id;
        // executeOrderWhereCluse[`${weTableName}.is_deleted`] = 0;
        // executeOrderWhereCluse[`${weTableName}.is_active`] = 1;
        // executeOrderWhereCluse[`${weTableName}.type`] = constantsPayloads.executeOrderType;


        let andWhereCluse = {whereTableName: `current_quantity`, operator: ">", value: "0"}
        let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, 
            dyeingWhereCluse, transitionBetweenWhWhereCluse, returnSellWhereCluse
            // executeOrderWhereCluse
        ]
        let orderByCluse = {attributeName: `date`, value: "desc"}
        let storeData = await weQueries.selectStoreWeForSellDirect(whereCluseArray, orderByCluse);
        if(storeData[0] != null) {
            for (let j = 0; j < storeData.length; j++) {
                const element = storeData[j];
                
                element.we_sell_requisition_direct_details_id = record.id
                element.direct_quantity = record.quantity
                element.direct_price = record.price
                element.direct_fabric_piece = record.fabric_piece
                element.direct_document = record.document
                element.direct_statement = record.statement
                element.direct_bussiness_man_id = record.seller_id
                element.direct_delivery_car_id = record.delivery_car_id
                results.push(element)
            }

            for (let k = 0; k < results.length; k++) {
                let insertedFlag = true
                const data = results[k];
                if(responseData[0] != null) {
                    
                    for (let g = 0; g < responseData.length; g++) {
                        const data2 = responseData[g];
                        if(data.we_sell_requisition_direct_details_id == data2.we_sell_requisition_direct_details_id) {
                            insertedFlag = false
                        }

                        if(g == responseData.length-1) {
                            if(insertedFlag) {
                                // console.log("data :::::::::::: ", data);
                                if(data.we_id != null) {
                                    responseData.push(data)
                                }
                            }
                        }
                    }
                } else {
                    responseData.push(data)
                }
            }
        }
    }
    return responseData;
};

exports.selectStoreWithDyeingServicesWe = async () => {
    let whereCluse = {};
    whereCluse[`${weTableName}.is_deleted`] = 0;
    whereCluse[`${weTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${weTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${weTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${weTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let dyeingWhereCluse = {};
    dyeingWhereCluse[`${weTableName}.is_deleted`] = 0;
    dyeingWhereCluse[`${weTableName}.is_active`] = 1;
    dyeingWhereCluse[`${weTableName}.type`] = constantsPayloads.dyeingType;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${weTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${weTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${weTableName}.type`] = constantsPayloads.transportBetweenType;

    let executeOrderWhereCluse = {};
    executeOrderWhereCluse[`${weTableName}.is_deleted`] = 0;
    executeOrderWhereCluse[`${weTableName}.is_active`] = 1;
    executeOrderWhereCluse[`${weTableName}.type`] = constantsPayloads.executeOrderType;

    let returnSellWhereCluse = {};
    returnSellWhereCluse[`${weTableName}.is_deleted`] = 0;
    returnSellWhereCluse[`${weTableName}.is_active`] = 1;
    returnSellWhereCluse[`${weTableName}.type`] = constantsPayloads.returnSellType;

    let andWhereCluse = {whereTableName: `current_quantity`, operator: ">", value: "0"}
    let whereCluseArray = [
        whereCluse, reconciliationWhereCluse, andWhereCluse, 
        dyeingWhereCluse, transitionBetweenWhWhereCluse, executeOrderWhereCluse, 
        returnSellWhereCluse
    ]
    let orderByCluse = {attributeName: `date`, value: "desc"}

    const storeWeResult = await weQueries.selectStoreWe(whereCluseArray, orderByCluse);
    const storeWithDyeingServicesWeResult = await weQueries.selectStoreWithDyeingServicesWe(storeWeResult);
    return storeWithDyeingServicesWeResult;
};

exports.selectRequisitionsForWeDyedFabricOrderRequisitionFordyedFabricOrder = async (ordersRequisitionsId, weDyedFabricOrderRequisitionDetailsId) => {
    let callArray = []

    let whereCluse = {};
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.orders_requisitions_id`] = ordersRequisitionsId;
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_details_id`] = weDyedFabricOrderRequisitionDetailsId;
    callArray.push(wdDyeingRequisitionDetailsQueries.selectRequisitionsForWeFabricOrderRequisitionFordyedFabricOrder(whereCluse))

    let requisitions = await Promise.all(callArray)    
    requisitions = [...new Set([].concat(...requisitions.map((o) => o)))]   
    return requisitions
};

exports.decrementWeCurrentQuantity = async (newQuantity, currentQuantity, fabricStoredInWe, updatedQuantity) => {
    if (newQuantity > currentQuantity) {
        await weQueries.update({
            current_quantity: 0
        }, {
            id: fabricStoredInWe.id
        });
        newQuantity = parseFloat((newQuantity - currentQuantity).toFixed(3));
        updatedQuantity = currentQuantity;
    } else {
        if (newQuantity == currentQuantity) {
            await weQueries.update({
                current_quantity: 0
            }, {
                id: fabricStoredInWe.id
            });
            newQuantity = 0;
            updatedQuantity = currentQuantity;
        } else {
            await weQueries.update({
                current_quantity: currentQuantity - newQuantity
            }, {
                id: fabricStoredInWe.id
            });
            updatedQuantity = newQuantity;
            newQuantity = 0;
        }
    }
    return { newQuantity, updatedQuantity };
}

exports.decrementWeCurrentQuantityDirect = async (newQuantity, currentQuantity, fabricStoredInWe, updatedQuantity) => {
    if (newQuantity > currentQuantity) {
        await weQueries.update({
            current_quantity: 0
        }, {
            id: fabricStoredInWe.we_id
        });
        newQuantity = parseFloat((newQuantity - currentQuantity).toFixed(3));
        updatedQuantity = currentQuantity;
    } else {
        if (newQuantity == currentQuantity) {
            await weQueries.update({
                current_quantity: 0
            }, {
                id: fabricStoredInWe.we_id
            });
            newQuantity = 0;
            updatedQuantity = currentQuantity;
        } else {
            await weQueries.update({
                current_quantity: currentQuantity - newQuantity
            }, {
                id: fabricStoredInWe.we_id
            });
            updatedQuantity = newQuantity;
            newQuantity = 0;
        }
    }
    return { newQuantity, updatedQuantity };
}

exports.update = async (bodyPalod) => {
    let updateResults = false

    let weAddRequisitionDetaisWhereCluse = {}
    weAddRequisitionDetaisWhereCluse[`${weAddRequisitionDetailsTableName}.id`] = bodyPalod.requisitionDetailsId
    const selectAddRequisitionOneRecord = await weAddRequisitionDetailsQueries.selectOne(weAddRequisitionDetaisWhereCluse)
    if (selectAddRequisitionOneRecord[0] != null) {
        updateResults = await weAddRequisitionDetailsQueries.update({
            color_category_id: bodyPalod.colorCategoryId,
            color_id: bodyPalod.colorId,
            color_code: bodyPalod.colorCode
        }, {
            id: bodyPalod.requisitionDetailsId
        })
    }

    let weReconciliationRequisitionDetailsWhereCluse = {}
    weReconciliationRequisitionDetailsWhereCluse[`${weReconciliationRequisitionDetailsTableName}.id`] = bodyPalod.requisitionDetailsId
    const selectWeReconciliationRequisitionDetailsOneRecord = await weReconciliationRequisitionDetailsQueries.selectOne(weReconciliationRequisitionDetailsWhereCluse)
    if (selectWeReconciliationRequisitionDetailsOneRecord[0] != null) {
        updateResults = await weReconciliationRequisitionDetailsQueries.update({
            color_category_id: bodyPalod.colorCategoryId,
            color_id: bodyPalod.colorId,
            color_code: bodyPalod.colorCode
        }, {
            id: bodyPalod.requisitionDetailsId
        })
    }

    let wdFormDyeingRequisitionDetailsWhereCluse = {}
    wdFormDyeingRequisitionDetailsWhereCluse[`${wdFormDyeingRequisitionDetailsTableName}.id`] = bodyPalod.wd_form_dyeing_requisition_details_id
    const selectWdFormDyeingRequisitionDetailsOneRecord = await wdFormDyeingRequisitionDetailsQueries.selectOne(wdFormDyeingRequisitionDetailsWhereCluse)
    if (selectWdFormDyeingRequisitionDetailsOneRecord[0] != null) {
        updateResults = await weReconciliationRequisitionDetailsQueries.update({
            dyeing_colors_prices_id: bodyPalod.dyeing_colors_prices_id
        }, {
            id: bodyPalod.wd_form_dyeing_requisition_details_id
        })
    }

    updateResults = await weQueries.update({
        storage_place: bodyPalod.storagePlace,
        note1: bodyPalod.note1,
        note2: bodyPalod.note2
    }, {
        id: bodyPalod.weId
    })
    if(updateResults) {
        return constants.updateSuccess;
    } else {
        return constants.updateError;
    }

}