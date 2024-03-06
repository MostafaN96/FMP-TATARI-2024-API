// Queries
const waQueries = require("../../db/queries/wa/wa");
const waAddRequisitionDetailsQueries = require("../../db/queries/wa/wa-add-requisition-details");
const waReconciliationRequisitionDetailsQueries = require("../../db/queries/wa/wa-reconciliation-requisition-details");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const yarnTableName = require("../../util/database-tables-name").yarnTableName;
const waTableName = require("../../util/database-tables-name").waTableName;
const waAddRequisitionTableName = require("../../util/database-tables-name").waAddRequisitionTableName;
const waAddRequisitionDetailsTableName = require("../../util/database-tables-name").waAddRequisitionDetailsTableName;
const waReconciliationRequisitionDetailsTableName = require("../../util/database-tables-name").waReconciliationRequisitionDetailsTableName;
const waReconciliationRequisitionTableName = require("../../util/database-tables-name").waReconciliationRequisitionTableName;
const waReconciliationRequisitionDetailsWaTableName = require("../../util/database-tables-name").waReconciliationRequisitionDetailsWaTableName;

// Helper
const trans = require("../../helpers/transform");
const { wbTransportRequisitionWbWaTableName, wbTransportRequisitionWbWaDetailsTableName } = require("../../util/database-tables-name");

exports.create = async (wa, items) => {
    wa.waId = trans.transform();

    const results = await waQueries.insert(wa, items);
    if (results) {
        return constants.insertSuccess;
    } else {
        return constants.insertError;
    }
};

exports.createForReconciliation = async (wa, items) => {
    wa.waId = trans.transform();

    const results = await waQueries.insertForReconciliation(wa, items);
    if (results) {
        return constants.insertSuccess;
    } else {
        return constants.insertError;
    }
};

exports.selectByYarnForSell = async (warehouseId, yarnId, yarnLotId, consigmentYarnId) => {
    let whereCluse = {};
    whereCluse[`${waTableName}.is_deleted`] = 0;
    whereCluse[`${waTableName}.is_active`] = 1;
    whereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    whereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${waAddRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${waAddRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${waReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transportWbWaWhereCluse = {};
    transportWbWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${waTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.type`] = constantsPayloads.transportFromBToAType;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaTableName}.warehouse_id`] = warehouseId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`] = yarnLotId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;

    let andWhereCluse = {whereTableName: `current_quantity`, operator: ">", value: "0"}
    let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, transportWbWaWhereCluse]
    let orderByCluse = {attributeName: `date`, value: "desc"}

    const results = await waQueries.selectByYarn(whereCluseArray, orderByCluse);
    return results;
};

exports.selectByYarnForReturn = async (warehouseId, yarnId, yarnLotId, consigmentYarnId, supplierId) => {
    let whereCluse = {};
    whereCluse[`${waTableName}.is_deleted`] = 0;
    whereCluse[`${waTableName}.is_active`] = 1;
    whereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${waAddRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${waAddRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    whereCluse[`${waAddRequisitionTableName}.supplier_id`] = supplierId;
    whereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    let andWhereCluse = {whereTableName: `${waTableName}.current_quantity`, operator: ">", value: "0"}
    let whereCluseArray = [whereCluse, andWhereCluse]
    let orderByCluse = {attributeName: `${waAddRequisitionTableName}.date`, value: "desc"}

    const results = await waQueries.selectByYarnForReturn(whereCluseArray, orderByCluse);
    return results;
};

// exports.selectSumCurrentQuantityByWarehouseByYarnWa = async (warehouseId, yarnId) => {
//     let callArray = []
//     let addWhereCluse = {};
//     addWhereCluse[`${waTableName}.is_deleted`] = 0;
//     addWhereCluse[`${waTableName}.is_active`] = 1;
//     addWhereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
//     addWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
//     callArray.push(await waAddRequisitionDetailsQueries.selectSumCurrentQuantityByWarehouseByYarnWa(addWhereCluse));
    
//     let reconciliationWhereCluse = {};
//     reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
//     reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
//     reconciliationWhereCluse[`${waTableName}.is_reconcilation`] = 1;
//     reconciliationWhereCluse[`${waReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
//     reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
//     reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;
//     callArray.push(await waReconciliationRequisitionDetailsQueries.selectSumCurrentQuantityByWarehouseByYarnWa(reconciliationWhereCluse));
//     const requisitions = await Promise.all(callArray)

//     let data = [...requisitions[0], ...requisitions[1]]
//     console.table(requisitions[0])
//     let sumCurrentQuantity = 0
//     for (let i = 0; i < data.length && (data[i] != null); i++) {
//         const element = data[i];
//         sumCurrentQuantity = sumCurrentQuantity + element.current_quantity
//     }
//     data[0].current_quantity = sumCurrentQuantity
//     const results = [data[0]]
//     return results;
// };

// exports.selectSumCurrentQuantityByYarnWa = async (yarnId) => {
//     let addWhereCluse = {};
//     addWhereCluse[`${waTableName}.is_deleted`] = 0;
//     addWhereCluse[`${waTableName}.is_active`] = 1;
//     addWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
    
//     let reconciliationWhereCluse = {};
//     reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
//     reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
//     reconciliationWhereCluse[`${waTableName}.is_reconcilation`] = 1;
//     reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
//     reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;
//     let andWhereCluse = {whereTableName: `current_quantity`, operator: ">", value: "0"}
//     let whereCluseArray = [addWhereCluse, reconciliationWhereCluse, andWhereCluse]

//     const results = await waQueries.selectYarnLotQuantityByWarehouseByYarnWa(whereCluseArray)
//     return results;
// };

exports.selectYarnLotQuantityByWarehouseByYarnByLotWa = async (warehouseId, yarnId, yarnLotId) => {
    let addWhereCluse = {};
    addWhereCluse[`${waTableName}.is_deleted`] = 0;
    addWhereCluse[`${waTableName}.is_active`] = 1;
    addWhereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    addWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
    addWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    
    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${waReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    let andWhereCluse = {whereTableName: `current_quantity`, operator: ">", value: "0"}

    let transportWbWaWhereCluse = {};
    transportWbWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${waTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.type`] = constantsPayloads.transportFromBToAType;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaTableName}.warehouse_id`] = warehouseId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`] = yarnLotId;

    let whereCluseArray = [addWhereCluse, reconciliationWhereCluse, andWhereCluse, transportWbWaWhereCluse]

    const results = await waQueries.selectYarnLotQuantityByWarehouseByYarnByLotWa(whereCluseArray)
    return results;
};

exports.selectSumCurrentQuantityByWarehouseByYarnByYarnLotByConsigmentYarnWa = async (warehouseId, yarnId, yarnLotId, consigmentYarnId) => {
    let callArray = []
    let addWhereCluse = {};
    addWhereCluse[`${waTableName}.is_deleted`] = 0;
    addWhereCluse[`${waTableName}.is_active`] = 1;
    addWhereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    addWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
    addWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    addWhereCluse[`${waAddRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    callArray.push(await waAddRequisitionDetailsQueries.selectSumCurrentQuantityByWarehouseByYarnWa(addWhereCluse));
    
    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${waReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    callArray.push(await waReconciliationRequisitionDetailsQueries.selectSumCurrentQuantityByWarehouseByYarnWa(reconciliationWhereCluse));
    const requisitions = await Promise.all(callArray)

    let data = [...requisitions[0], ...requisitions[1]]
    let sumCurrentQuantity = 0
    for (let i = 0; i < data.length && (data[i] != null); i++) {
        const element = data[i];
        sumCurrentQuantity = sumCurrentQuantity + element.current_quantity
    }
    data[0].current_quantity = sumCurrentQuantity
    const results = [data[0]]
    return results;
};

exports.selectSumCurrentQuantityByYarnAndSupplier = async (warehouseId, yarnId, yarnLotId, consigmentYarnId, supplierId) => {
    let whereCluse = {};
    whereCluse[`${waTableName}.is_deleted`] = 0;
    whereCluse[`${waTableName}.is_active`] = 1;
    whereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    whereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${waAddRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${waAddRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    whereCluse[`${waAddRequisitionTableName}.supplier_id`] = supplierId;
    let andWhereCluse = {whereTableName: `${waTableName}.current_quantity`, operator: ">", value: "0"}
    let whereCluseArray = [whereCluse, andWhereCluse]

    const results = await waQueries.selectSumCurrentQuantityByYarnForReturn(whereCluseArray);
    return results;
};

exports.selectYarnLotQuantityByWarehouseByYarnByLotForReturn = async (supplierId, warehouseId, yarnId, yarnLotId) => {
    let whereCluse = {};
    whereCluse[`${waTableName}.is_deleted`] = 0;
    whereCluse[`${waTableName}.is_active`] = 1;
    whereCluse[`${waAddRequisitionTableName}.supplier_id`] = supplierId;
    whereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    whereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${waAddRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    let andWhereCluse = {whereTableName: `${waTableName}.current_quantity`, operator: ">", value: "0"}
    let whereCluseArray = [whereCluse, andWhereCluse]

    const results = await waQueries.selectYarnLotQuantityByWarehouseByYarnByLotForReturn(whereCluseArray);
    return results;
};

exports.decrementWaCurrentQuantity = async (newQuantity, currentQuantity, yarnStoredInWa, updatedQuantity) => {
    if (newQuantity > currentQuantity) {
        await waQueries.update({
            current_quantity: 0
        }, {
            id: yarnStoredInWa.id
        });
        newQuantity = parseFloat((newQuantity - currentQuantity).toFixed(3));
        updatedQuantity = currentQuantity;
    } else {
        if (newQuantity == currentQuantity) {
            await waQueries.update({
                current_quantity: 0
            }, {
                id: yarnStoredInWa.id
            });
            newQuantity = 0;
            updatedQuantity = currentQuantity;
        } else {
            await waQueries.update({
                current_quantity: currentQuantity - newQuantity
            }, {
                id: yarnStoredInWa.id
            });
            updatedQuantity = newQuantity;
            newQuantity = 0;
        }
    }
    return { newQuantity, updatedQuantity };
}
