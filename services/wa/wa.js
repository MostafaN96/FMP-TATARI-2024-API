// Queries
const waQueries = require("../../db/queries/wa/wa");
const waAddRequisitionDetailsQueries = require("../../db/queries/wa/wa-add-requisition-details");
const waReconciliationRequisitionDetailsQueries = require("../../db/queries/wa/wa-reconciliation-requisition-details");
const wbTransportRequisitionWbWaDetailsQueries = require("../../db/queries/wb/wb-transport-requisition-wb-wa-details");
const waExecuteOrderRequisitionWbWaDetailsQueries = require("../../db/queries/wa/wa-execute-order-requisition-details");
const waTransitionBetweenWhRequisitionDetailsQueries = require("../../db/queries/wa/wa-transition-between-wh-requisition-details");

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
const { wbTransportRequisitionWbWaTableName, wbTransportRequisitionWbWaDetailsTableName, waExecuteOrderRequisitionTableName, waExecuteOrderRequisitionDetailsTableName, waTransitionBetweenWHRequisitionTableName, waTransitionBetweenWHRequisitionDetailsTableName, waAddRequisitionDetailsYarnOrderTableName, wbTransportWaWbDetailsWaTableName, wbTransitionBetweenIndustriesRequisitionDetailsTableName, wbTransitionBetweenIndustriesRequisitionDetailsWbTableName, waTransitionBetweenWHRequisitionDetailsWaTableName } = require("../../util/database-tables-name");

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

exports.selectByYarnForSell = async (warehouseId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId) => {
    let whereCluse = {};
    whereCluse[`${waTableName}.is_deleted`] = 0;
    whereCluse[`${waTableName}.is_active`] = 1;
    whereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    whereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${waAddRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${waAddRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    whereCluse[`${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${waReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transportWbWaWhereCluse = {};
    transportWbWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${waTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.type`] = constantsPayloads.transportFromBToAType;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaTableName}.warehouse_id`] = warehouseId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`] = yarnLotId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${waTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${waTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${waTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = warehouseId;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`] = yarnId;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;


    let andWhereCluse = {whereTableName: `current_quantity`, operator: ">", value: "0"}
    let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, 
        transportWbWaWhereCluse, 
        transitionBetweenWhWhereCluse]
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

exports.selectYarnLotQuantityByWarehouseByYarnByLotWa = async (warehouseId, yarnId, yarnLotId, yarnOrderId) => {
    let addWhereCluse = {};
    addWhereCluse[`${waTableName}.is_deleted`] = 0;
    addWhereCluse[`${waTableName}.is_active`] = 1;
    addWhereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    addWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
    addWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    addWhereCluse[`${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${waReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    let andWhereCluse = {whereTableName: `current_quantity`, operator: ">", value: "0"}

    let transportWbWaWhereCluse = {};
    transportWbWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${waTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.type`] = constantsPayloads.transportFromBToAType;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaTableName}.warehouse_id`] = warehouseId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`] = yarnLotId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${waTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${waTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${waTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = warehouseId;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`] = yarnId;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;

    let whereCluseArray = [addWhereCluse, reconciliationWhereCluse, 
        andWhereCluse, transportWbWaWhereCluse, 
        transitionBetweenWhWhereCluse]

    const results = await waQueries.selectYarnLotQuantityByWarehouseByYarnByLotWa(whereCluseArray)
    return results;
};

exports.selectSumCurrentQuantityByWarehouseByYarnByYarnLotByConsigmentYarnWa = async (warehouseId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId) => {
    let callArray = []
    let addWhereCluse = {};
    addWhereCluse[`${waTableName}.is_deleted`] = 0;
    addWhereCluse[`${waTableName}.is_active`] = 1;
    addWhereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
    addWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
    addWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    addWhereCluse[`${waAddRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    addWhereCluse[`${waAddRequisitionDetailsYarnOrderTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    callArray.push(await waAddRequisitionDetailsQueries.selectSumCurrentQuantityByWarehouseByYarnWa(addWhereCluse));
    
    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${waReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    callArray.push(await waReconciliationRequisitionDetailsQueries.selectSumCurrentQuantityByWarehouseByYarnWa(reconciliationWhereCluse));
    
    let transportWbWaWhereCluse = {};
    transportWbWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${waTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.type`] = constantsPayloads.transportFromBToAType;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaTableName}.warehouse_id`] = warehouseId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_id`] = yarnId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.yarn_lot_id`] = yarnLotId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    transportWbWaWhereCluse[`${wbTransportRequisitionWbWaDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    callArray.push(await wbTransportRequisitionWbWaDetailsQueries.selectSumCurrentQuantityByWarehouseByYarnWa(transportWbWaWhereCluse));
    
    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${waTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${waTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${waTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = warehouseId;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_id`] = yarnId;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    callArray.push(await waTransitionBetweenWhRequisitionDetailsQueries.selectSumCurrentQuantityByWarehouseByYarnWa(transitionBetweenWhWhereCluse));


    const requisitions = await Promise.all(callArray)

    let data = [...requisitions[0], ...requisitions[1], 
    ...requisitions[2], ...requisitions[3]
]
    let sumCurrentQuantity = 0
    for (let i = 0; i < data.length && (data[i] != null); i++) {
        const element = data[i];
        sumCurrentQuantity = sumCurrentQuantity + element.current_quantity
    }
    if(data.length > 0) {
        data[0].current_quantity = sumCurrentQuantity
    }
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


exports.selectRequisitionsForWaYarnOrderRequisition = async (requisitionDetailsId) => {
    let callArray = []

    let whereCluse = {};
    whereCluse[`${wbTransportWaWbDetailsWaTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransportWaWbDetailsWaTableName}.is_active`] = 1;
    whereCluse[`${wbTransportWaWbDetailsWaTableName}.wb_transport_wa_wb_details_id`] = requisitionDetailsId;
    callArray.push(waAddRequisitionDetailsQueries.selectRequisitionsForWaYarnOrderRequisition(whereCluse))

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTransportWaWbDetailsWaTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTransportWaWbDetailsWaTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTransportWaWbDetailsWaTableName}.wb_transport_wa_wb_details_id`] = requisitionDetailsId;
    reconciliationWhereCluse[`${waTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    callArray.push(waReconciliationRequisitionDetailsQueries.selectInputRequisitionsForWaYarnOrderRequisition(reconciliationWhereCluse))

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${wbTransportWaWbDetailsWaTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${wbTransportWaWbDetailsWaTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${wbTransportWaWbDetailsWaTableName}.wb_transport_wa_wb_details_id`] = requisitionDetailsId;
    callArray.push(waTransitionBetweenWhRequisitionDetailsQueries.selectToRequisitionsForWaYarnOrderRequisition(transitionBetweenWhWhereCluse))

    let requisitions = await Promise.all(callArray)        
    requisitions = [...new Set([].concat(...requisitions.map((o) => o)))]   
    return requisitions
};

exports.selectTransitionBetweenWhRequisitionsForWaYarnOrderRequisition = async (requisitionDetailsId) => {
    let callArray = []

    let whereCluse = {};
    whereCluse[`${waTransitionBetweenWHRequisitionDetailsWaTableName}.is_deleted`] = 0;
    whereCluse[`${waTransitionBetweenWHRequisitionDetailsWaTableName}.is_active`] = 1;
    whereCluse[`${waTransitionBetweenWHRequisitionDetailsWaTableName}.wa_transition_between_wh_requisitions_details_id`] = requisitionDetailsId;
    callArray.push(waAddRequisitionDetailsQueries.selectTransitionBetweenWhRequisitionsForWaYarnOrderRequisition(whereCluse))

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${waTransitionBetweenWHRequisitionDetailsWaTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${waTransitionBetweenWHRequisitionDetailsWaTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waTransitionBetweenWHRequisitionDetailsWaTableName}.wa_transition_between_wh_requisitions_details_id`] = requisitionDetailsId;
    reconciliationWhereCluse[`${waTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    callArray.push(waReconciliationRequisitionDetailsQueries.selectInputTransitionBetweenWhRequisitionsForWaYarnOrderRequisition(reconciliationWhereCluse))

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionDetailsWaTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionDetailsWaTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionDetailsWaTableName}.wa_transition_between_wh_requisitions_details_id`] = requisitionDetailsId;
    callArray.push(waTransitionBetweenWhRequisitionDetailsQueries.selectToTransitionBetweenWhRequisitionsForWaYarnOrderRequisition(transitionBetweenWhWhereCluse))

    let requisitions = await Promise.all(callArray)        
    requisitions = [...new Set([].concat(...requisitions.map((o) => o)))]   
    return requisitions
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
