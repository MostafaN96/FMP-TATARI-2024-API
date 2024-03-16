// Queries
const wcQueries = require("../../db/queries/wc/wc");
const wcAddRequisitionDetailsQueries = require("../../db/queries/wc/wc-add-requisition-details");
const wcReconciliationRequisitionDetailsQueries = require("../../db/queries/wc/wc-reconciliation-requisition-details");
const wdTransportRequisitionWdWcDetailsQueries = require("../../db/queries/wd/wd-transport-requisition-wd-wc-details");
const wbManufacturingOutputQueries = require("../../db/queries/wb/wb-manufacturing-output");
const wcExecuteOrderRequisitionDetailsQueries = require("../../db/queries/wc/wc-execute-order-requisition-details");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wcTableName, wcAddRequisitionDetailsTableName, wdTransportRequisitionWdWcTableName, wdTransportRequisitionWdWcDetailsTableName, wcReconciliationRequisitionTableName, wcReconciliationRequisitionDetailsTableName, wcAddRequisitionTableName, wbManufacturingOutputTableName, wcExecuteOrderRequisitionTableName, wcExecuteOrderRequisitionDetailsTableName } = require("../../util/database-tables-name");

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wc, items) => {
    wc.wcId = trans.transform();

    const results = await wcQueries.insert(wc, items);
    if (results) {
        return constants.insertSuccess;
    } else {
        return constants.insertError;
    }
};

exports.createForManufacturing = async (wc) => {
    wc.wcId = trans.transform();

    const results = await wcQueries.insertForManufacturing(wc);
    if (results) {
        return constants.insertSuccess;
    } else {
        return constants.insertError;
    }
};

exports.createForReconciliation = async (wc, items) => {
    wc.wcId = trans.transform();

    const results = await wcQueries.insertForReconciliation(wc, items);
    if (results) {
        return constants.insertSuccess;
    } else {
        return constants.insertError;
    }
};

exports.selectByFabricForSell = async (warehouseId, fabricId, consigmentManufacturingId) => {
    let whereCluse = {};
    whereCluse[`${wcTableName}.is_deleted`] = 0;
    whereCluse[`${wcTableName}.is_active`] = 1;
    whereCluse[`${wcAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    whereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
    whereCluse[`${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wcTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wcTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wcTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wcReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
    reconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
    reconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
    reconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transportWdWcWhereCluse = {};
    transportWdWcWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transportWdWcWhereCluse[`${wcTableName}.is_active`] = 1;
    transportWdWcWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportFromBToAType;
    transportWdWcWhereCluse[`${wdTransportRequisitionWdWcTableName}.warehouse_id`] = warehouseId;
    transportWdWcWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;
    transportWdWcWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;

    let manufacturingOutputWhereCluse = {};
    manufacturingOutputWhereCluse[`${wcTableName}.is_deleted`] = 0;
    manufacturingOutputWhereCluse[`${wcTableName}.is_active`] = 1;
    manufacturingOutputWhereCluse[`${wcTableName}.type`] = constantsPayloads.manufactruingType;
    manufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.warehouse_id`] = warehouseId;
    manufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;
    manufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;

    let executeOrderWhereCluse = {};
    executeOrderWhereCluse[`${wcTableName}.is_deleted`] = 0;
    executeOrderWhereCluse[`${wcTableName}.is_active`] = 1;
    executeOrderWhereCluse[`${wcTableName}.type`] = constantsPayloads.executeOrderType;
    executeOrderWhereCluse[`${wcExecuteOrderRequisitionTableName}.warehouse_id`] = warehouseId;
    executeOrderWhereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`] = fabricId;
    executeOrderWhereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;

    let andWhereCluse = {whereTableName: `current_quantity`, operator: ">", value: "0"}
    let whereCluseArray = [whereCluse, reconciliationWhereCluse,
         andWhereCluse, transportWdWcWhereCluse, 
         manufacturingOutputWhereCluse, executeOrderWhereCluse]
    let orderByCluse = {attributeName: `date`, value: "desc"}

    const results = await wcQueries.selectByFabric(whereCluseArray, orderByCluse);
    return results;
};

exports.selectByFabricForReturn = async (warehouseId, fabricId, consigmentManufacturingId, supplierId) => {
    let whereCluse = {};
    whereCluse[`${wcTableName}.is_deleted`] = 0;
    whereCluse[`${wcTableName}.is_active`] = 1;
    whereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
    whereCluse[`${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
    whereCluse[`${wcAddRequisitionTableName}.supplier_id`] = supplierId;
    whereCluse[`${wcAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    let andWhereCluse = {whereTableName: `${wcTableName}.current_quantity`, operator: ">", value: "0"}
    let whereCluseArray = [whereCluse, andWhereCluse]
    let orderByCluse = {attributeName: `${wcAddRequisitionTableName}.date`, value: "desc"}

    const results = await wcQueries.selectByFabricForReturn(whereCluseArray, orderByCluse);
    return results;
};

exports.selectConsigmentManufacturingQuantityByWarehouseByFabricWc = async (warehouseId, fabricId) => {
    let addWhereCluse = {};
    addWhereCluse[`${wcTableName}.is_deleted`] = 0;
    addWhereCluse[`${wcTableName}.is_active`] = 1;
    addWhereCluse[`${wcAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    addWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
    
    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wcTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wcTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wcTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wcReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
    reconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
    reconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transportWdWcWhereCluse = {};
    transportWdWcWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transportWdWcWhereCluse[`${wcTableName}.is_active`] = 1;
    transportWdWcWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportFromBToAType;
    transportWdWcWhereCluse[`${wdTransportRequisitionWdWcTableName}.warehouse_id`] = warehouseId;
    transportWdWcWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;

    let manufacturingOutputWhereCluse = {};
    manufacturingOutputWhereCluse[`${wcTableName}.is_deleted`] = 0;
    manufacturingOutputWhereCluse[`${wcTableName}.is_active`] = 1;
    manufacturingOutputWhereCluse[`${wcTableName}.type`] = constantsPayloads.manufactruingType;
    manufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.warehouse_id`] = warehouseId;
    manufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;

    let executeOrderWhereCluse = {};
    executeOrderWhereCluse[`${wcTableName}.is_deleted`] = 0;
    executeOrderWhereCluse[`${wcTableName}.is_active`] = 1;
    executeOrderWhereCluse[`${wcTableName}.type`] = constantsPayloads.executeOrderType;
    executeOrderWhereCluse[`${wcExecuteOrderRequisitionTableName}.warehouse_id`] = warehouseId;
    executeOrderWhereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`] = fabricId;

    let andWhereCluse = {whereTableName: `current_quantity`, operator: ">", value: "0"}

    let whereCluseArray = [addWhereCluse, reconciliationWhereCluse, 
        andWhereCluse, transportWdWcWhereCluse, 
        manufacturingOutputWhereCluse, executeOrderWhereCluse
    ]

    const results = await wcQueries.selectConsigmentManufacturingQuantityByWarehouseByFabricWc(whereCluseArray)
    return results;
};


exports.selectSumCurrentQuantityByWarehouseByFabricByConsigmentManufacturingLotWc = async (warehouseId, fabricId, consigmentManufacturingId) => {
    let callArray = []
    let addWhereCluse = {};
    addWhereCluse[`${wcTableName}.is_deleted`] = 0;
    addWhereCluse[`${wcTableName}.is_active`] = 1;
    addWhereCluse[`${wcAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    addWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
    addWhereCluse[`${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
    callArray.push(await wcAddRequisitionDetailsQueries.selectSumCurrentQuantityByWarehouseByFabricWc(addWhereCluse));
    
    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wcTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wcTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wcTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wcReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
    reconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.fabric_id`] = fabricId;
    reconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
    reconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    callArray.push(await wcReconciliationRequisitionDetailsQueries.selectSumCurrentQuantityByWarehouseByFabricWc(reconciliationWhereCluse));
    
    let transportWdWcWhereCluse = {};
    transportWdWcWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transportWdWcWhereCluse[`${wcTableName}.is_active`] = 1;
    transportWdWcWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportFromBToAType;
    transportWdWcWhereCluse[`${wdTransportRequisitionWdWcTableName}.warehouse_id`] = warehouseId;
    transportWdWcWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.fabric_id`] = fabricId;
    transportWdWcWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
    callArray.push(await wdTransportRequisitionWdWcDetailsQueries.selectSumCurrentQuantityByWarehouseByFabricWc(transportWdWcWhereCluse));

    let manufacturingOutputWhereCluse = {};
    manufacturingOutputWhereCluse[`${wcTableName}.is_deleted`] = 0;
    manufacturingOutputWhereCluse[`${wcTableName}.is_active`] = 1;
    manufacturingOutputWhereCluse[`${wcTableName}.type`] = constantsPayloads.manufactruingType;
    manufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.warehouse_id`] = warehouseId;
    manufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;
    manufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
    callArray.push(await wbManufacturingOutputQueries.selectSumCurrentQuantityByWarehouseByFabricWc(manufacturingOutputWhereCluse));

    let executeOrderWhereCluse = {};
    executeOrderWhereCluse[`${wcTableName}.is_deleted`] = 0;
    executeOrderWhereCluse[`${wcTableName}.is_active`] = 1;
    executeOrderWhereCluse[`${wcTableName}.type`] = constantsPayloads.executeOrderType;
    executeOrderWhereCluse[`${wcExecuteOrderRequisitionTableName}.warehouse_id`] = warehouseId;
    executeOrderWhereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.fabric_id`] = fabricId;
    executeOrderWhereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
    callArray.push(await wcExecuteOrderRequisitionDetailsQueries.selectSumCurrentQuantityByWarehouseByFabricWc(executeOrderWhereCluse));

    const requisitions = await Promise.all(callArray)

    let data = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4]
]
    let sumCurrentQuantity = 0
    for (let i = 0; i < data.length && (data[i] != null); i++) {
        const element = data[i];
        sumCurrentQuantity = sumCurrentQuantity + element.current_quantity
    }
    let results = []
    if(data[0] != null) {
        data[0].current_quantity = sumCurrentQuantity
        results = [data[0]]
    }
    return results;
};

exports.selectSumCurrentQuantityByFabricAndSupplier = async (warehouseId, fabricId, consigmentManufacturingId, supplierId) => {
    let whereCluse = {};
    whereCluse[`${wcTableName}.is_deleted`] = 0;
    whereCluse[`${wcTableName}.is_active`] = 1;
    whereCluse[`${wcAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    whereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
    whereCluse[`${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
    whereCluse[`${wcAddRequisitionTableName}.supplier_id`] = supplierId;
    let andWhereCluse = {whereTableName: `${wcTableName}.current_quantity`, operator: ">", value: "0"}
    let whereCluseArray = [whereCluse, andWhereCluse]

    const results = await wcQueries.selectSumCurrentQuantityByFabricForReturn(whereCluseArray);
    return results;
};


exports.selectConsigmentManufacturingQuantityByWarehouseByFabricForReturn = async (supplierId, warehouseId, fabricId) => {
    let whereCluse = {};
    whereCluse[`${wcTableName}.is_deleted`] = 0;
    whereCluse[`${wcTableName}.is_active`] = 1;
    whereCluse[`${wcAddRequisitionTableName}.supplier_id`] = supplierId;
    whereCluse[`${wcAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    whereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
    let andWhereCluse = {whereTableName: `${wcTableName}.current_quantity`, operator: ">", value: "0"}
    let whereCluseArray = [whereCluse, andWhereCluse]

    const results = await wcQueries.selectConsigmentManufacturingQuantityByWarehouseByFabricForReturn(whereCluseArray);
    return results;
};

exports.decrementWcCurrentQuantity = async (newQuantity, currentQuantity, fabricStoredInWc, updatedQuantity) => {
    if (newQuantity > currentQuantity) {
        await wcQueries.update({
            current_quantity: 0
        }, {
            id: fabricStoredInWc.id
        });
        newQuantity = parseFloat((newQuantity - currentQuantity).toFixed(3));
        updatedQuantity = currentQuantity;
    } else {
        if (newQuantity == currentQuantity) {
            await wcQueries.update({
                current_quantity: 0
            }, {
                id: fabricStoredInWc.id
            });
            newQuantity = 0;
            updatedQuantity = currentQuantity;
        } else {
            await wcQueries.update({
                current_quantity: currentQuantity - newQuantity
            }, {
                id: fabricStoredInWc.id
            });
            updatedQuantity = newQuantity;
            newQuantity = 0;
        }
    }
    return { newQuantity, updatedQuantity };
}
