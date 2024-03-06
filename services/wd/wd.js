// Queries
const wdQueries = require("../../db/queries/wd/wd");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wdTableName, wdTransportWcWdDetailsTableName, wdReconciliationRequisitionDetailsTableName, wdTransitionBetweenDyersRequisitionDetailsTableName } = require("../../util/database-tables-name");

// Helper
const trans = require("../../helpers/transform");

// Services
// const wbTransportWaWbDetailsService = require("./wb-transport-wa-wb-details");
// const wbReconciliationRequisitionDetailsService = require("./wb-reconciliation-requisition-details");
// const wbTransitionBetweenIndustriesRequisitionDetailsService = require("./wb-transition-between-industries-requisition-details");


exports.createForReconciliation = async (wd, items) => {
    wd.wdId = trans.transform();

    const results = await wdQueries.insertForReconciliation(wd, items);
    if (results) {
        return constants.insertSuccess;
    } else {
        return constants.insertError;
    }
};

exports.selectConsigmentDyeingQuantityByFabricByDyeingWd = async (fabricId, dyeingId) => {

    let whereCluse = {};
    whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;
    whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
    whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wdTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wdTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wdTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
    reconciliationWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;

    let transitionBetweenWhereCluse = {};
    transitionBetweenWhereCluse[`${wdTableName}.is_deleted`] = 0;
    transitionBetweenWhereCluse[`${wdTableName}.is_active`] = 1;
    transitionBetweenWhereCluse[`${wdTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
    transitionBetweenWhereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;

    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }

    let consigmentDyeingWhereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, transitionBetweenWhereCluse]
    const consigmentDyeingResults = await wdQueries.selectConsigmentDyeingQuantityByFabricByDyeingWd(consigmentDyeingWhereCluseArray);

    return consigmentDyeingResults;
};

exports.selectQuantityByDyeingWd = async (dyeingId, groupBy) => {

    let whereCluse = {};
    whereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;
    whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wdTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wdTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wdTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;

    let transitionBetweenWhereCluse = {};
    transitionBetweenWhereCluse[`${wdTableName}.is_deleted`] = 0;
    transitionBetweenWhereCluse[`${wdTableName}.is_active`] = 1;
    transitionBetweenWhereCluse[`${wdTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;

    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }

    let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, transitionBetweenWhereCluse]
    const consigmentDyeingResults = await wdQueries.selectQuantityByDyeingWd(whereCluseArray, groupBy);

    return consigmentDyeingResults;
};


exports.selectRecordsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId) => {
    let whereCluse = {};
    whereCluse[`${wdTableName}.is_deleted`] = 0;
    whereCluse[`${wdTableName}.is_active`] = 1;
    whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
    whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
    whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wdTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wdTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wdTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
    reconciliationWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
    reconciliationWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
    reconciliationWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenWhereCluse = {};
    transitionBetweenWhereCluse[`${wdTableName}.is_deleted`] = 0;
    transitionBetweenWhereCluse[`${wdTableName}.is_active`] = 1;
    transitionBetweenWhereCluse[`${wdTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
    transitionBetweenWhereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
    transitionBetweenWhereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;

    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }
    let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, transitionBetweenWhereCluse]
    let orderByCluse = { attributeName: `date`, value: "desc" }

    const results = await wdQueries.selectRecordsByDyeingByFabricByConsigmentDyeing(whereCluseArray, orderByCluse);
    return results;
};

exports.decrementWdCurrentQuantity = async (newQuantity, currentQuantity, materialStoredInWd, updatedQuantity) => {
    if (newQuantity > currentQuantity) {
        await wdQueries.update({
            current_quantity: 0
        }, {
            id: materialStoredInWd.id
        });
        newQuantity = parseFloat((newQuantity - currentQuantity).toFixed(3));
        updatedQuantity = currentQuantity;
    } else {
        if (newQuantity == currentQuantity) {
            await wdQueries.update({
                current_quantity: 0
            }, {
                id: materialStoredInWd.id
            });
            newQuantity = 0;
            updatedQuantity = currentQuantity;
        } else {
            await wdQueries.update({
                current_quantity: currentQuantity - newQuantity
            }, {
                id: materialStoredInWd.id
            });
            updatedQuantity = newQuantity;
            newQuantity = 0;
        }
    }
    return { newQuantity, updatedQuantity };
}

exports.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd = async (dyeingId, fabricId, consigmentDyeingId) => {

    let whereCluse = {};
    whereCluse[`${wdTableName}.is_deleted`] = 0;
    whereCluse[`${wdTableName}.is_active`] = 1;
    whereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
    whereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
    whereCluse[`${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wdTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wdTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wdTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
    reconciliationWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
    reconciliationWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
    reconciliationWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenDyersWhereCluse = {};
    transitionBetweenDyersWhereCluse[`${wdTableName}.is_deleted`] = 0;
    transitionBetweenDyersWhereCluse[`${wdTableName}.is_active`] = 1;
    transitionBetweenDyersWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
    transitionBetweenDyersWhereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.fabric_id`] = fabricId;
    transitionBetweenDyersWhereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;

    let whereCluseArray = [whereCluse, reconciliationWhereCluse, transitionBetweenDyersWhereCluse]
    const fabricResults = await wdQueries.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd(whereCluseArray);

    return fabricResults
};