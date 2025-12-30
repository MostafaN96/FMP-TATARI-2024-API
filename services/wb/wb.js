// Queries
const wbQueries = require("../../db/queries/wb/wb");
const wbTransportWaWbDetailsQueries = require("../../db/queries/wb/wb-transport-wa-wb-details");
const wbReconciliationRequisitionDetailsQueries = require("../../db/queries/wb/wb-reconciliation-requisition-details");
const wbTransitionBetweenIndustriesRequisitionDetailsQueries = require("../../db/queries/wb/wb-transition-between-industries-requisition-details");
const wdFormRequisitionDetailsQueries = require("../../db/queries/wd/wd-form-dyeing-requisition-details");
const wbManufacturingInputWbQueries = require("../../db/queries/wb/wb-manufacturing-input-wb");

// Helper
const trans = require("../../helpers/transform");

// Services
const wbTransportWaWbDetailsService = require("./wb-transport-wa-wb-details");
const wbReconciliationRequisitionDetailsService = require("./wb-reconciliation-requisition-details");
const wbTransitionBetweenIndustriesRequisitionDetailsService = require("./wb-transition-between-industries-requisition-details");
const fabricYarnsService = require("../general/fabric-yarns");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { 
    wbTableName, 
    wbReconciliationRequisitionDetailsTableName, 
    wbTransportWaWbDetailsTableName, 
    wbTransitionBetweenIndustriesRequisitionDetailsTableName, 
    wbManufacturingInputWbTableName,
    wbTransitionBetweenIndustriesRequisitionDetailsWbTableName,
    wdFormDyeingRequisitionDetailsTableName
} = require("../../util/database-tables-name");


exports.createForReconciliation = async (wb, items) => {
    wb.wbId = trans.transform();

    const results = await wbQueries.insertForReconciliation(wb, items);
    if (results) {
        return constants.insertSuccess;
    } else {
        return constants.insertError;
    }
};

exports.selectSumCurrentQuantityByIndustryByYarnByYarnLotInWb = async (industryId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId) => {

    let whereCluse = {};
    whereCluse[`${wbTableName}.is_deleted`] = 0;
    whereCluse[`${wbTableName}.is_active`] = 1;
    whereCluse[`${wbTableName}.industry_id`] = industryId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`] = consigmentYarnId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.industry_id`] = industryId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;

    let whereCluseArray = [whereCluse, reconciliationWhereCluse, transitionBetweenIndustriesWhereCluse]
    const yarnResults = await wbQueries.selectSumCurrentQuantityByIndustryByYarnByYarnLotInWb(whereCluseArray);

    return yarnResults
};

exports.decrementWbCurrentQuantity = async (newQuantity, currentQuantity, materialStoredInWb, updatedQuantity) => {
    if (newQuantity > currentQuantity) {
        await wbQueries.update({
            current_quantity: 0
        }, {
            id: materialStoredInWb.id
        });
        newQuantity = parseFloat((newQuantity - currentQuantity).toFixed(3));
        updatedQuantity = currentQuantity;
    } else {
        if (newQuantity == currentQuantity) {
            await wbQueries.update({
                current_quantity: 0
            }, {
                id: materialStoredInWb.id
            });
            newQuantity = 0;
            updatedQuantity = currentQuantity;
        } else {
            await wbQueries.update({
                current_quantity: currentQuantity - newQuantity
            }, {
                id: materialStoredInWb.id
            });
            updatedQuantity = newQuantity;
            newQuantity = 0;
        }
    }
    return { newQuantity, updatedQuantity };
}

exports.selectConsigmentYarnQuantityByYarnByIndustryByLotWb = async (yarnId, industryId, yarnLotId, yarnOrderId) => {

    let whereCluse = {};
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    whereCluse[`${wbTableName}.industry_id`] = industryId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.industry_id`] = industryId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;

    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }

    let yarnLotWhereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, transitionBetweenIndustriesWhereCluse]
    const yarnLotResults = await wbQueries.selectConsigmentYarnQuantityByYarnByIndustryByLotWb(yarnLotWhereCluseArray);

    return yarnLotResults;
};

exports.selectNotIncludedYarnLotQuantityByYarnByIndustryWb = async (yarnId, industryId, includedYarnLots) => {

    let whereCluse = {};
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${wbTableName}.industry_id`] = industryId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.industry_id`] = industryId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;

    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }

    let yarnLotWhereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, transitionBetweenIndustriesWhereCluse]
    const yarnLotResults = await wbQueries.selectNotIncludedYarnLotQuantityByYarnByIndustryWb(yarnLotWhereCluseArray, includedYarnLots);

    return yarnLotResults;
};


exports.selectRecordsByIndustryByYarnByYarnLot = async (
    industryId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId) => {
        
    let whereCluse = {};
    whereCluse[`${wbTableName}.is_deleted`] = 0;
    whereCluse[`${wbTableName}.is_active`] = 1;
    whereCluse[`${wbTableName}.industry_id`] = industryId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`] = consigmentYarnId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.industry_id`] = industryId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;

    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }
    let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, transitionBetweenIndustriesWhereCluse]
    let orderByCluse = { attributeName: `date`, value: "desc" }

    const results = await wbQueries.selectRecordsByIndustryByYarnByYarnLot(whereCluseArray, orderByCluse);
    return results;
};

exports.selectQuantityByIndustryWb = async (industryId) => {

    let whereCluse = {};
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
    whereCluse[`${wbTableName}.industry_id`] = industryId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.industry_id`] = industryId;

    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }

    let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, transitionBetweenIndustriesWhereCluse]
    const yarnLotResults = await wbQueries.selectQuantityByIndustryWb(whereCluseArray);

    return yarnLotResults;
};

exports.selectQuantityandFabricToBeManufacturedByIndustryWb = async (industryId) => {

    let whereCluse = {};
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
    whereCluse[`${wbTableName}.industry_id`] = industryId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.industry_id`] = industryId;

    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }

    let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, transitionBetweenIndustriesWhereCluse]
    const yarnLotResults = await wbQueries.selectQuantityandFabricToBeManufacturedByIndustryWb(whereCluseArray);

    return yarnLotResults;
};

exports.selectQuantityByIndustryByFabricWb = async (industryId, fabricId, yarnOrderId) => {

    let whereCluse = {};
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
    whereCluse[`${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    whereCluse[`${wbTableName}.industry_id`] = industryId;
    whereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
    reconciliationWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricId;

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.industry_id`] = industryId;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricId;

    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }

    let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, transitionBetweenIndustriesWhereCluse]
    const yarnLotResults = await wbQueries.selectQuantityByIndustryWb(whereCluseArray);

    // get yarn ratio and wast ratio
    for (let i = 0; i < yarnLotResults.length; i++) {
        const element = yarnLotResults[i];
        let fabricYarn = await fabricYarnsService.selectByFabricIdByYarnId(fabricId, element.yarn_id)
        if (Array.isArray(fabricYarn) && fabricYarn.length > 0) {
            element.ratio = fabricYarn[0].ratio
        element.wast_ratio = fabricYarn[0].wast_ratio
        } else {
            element.ratio = 0
        element.wast_ratio = 0
        }

    }
    return yarnLotResults;
};

exports.selectByIndustryByNeededFabricToBeManufacturedNotIncludedYarnsAndLotsWb = async (industryId, neededFabricId, includedYarns, includedYarnLots, includedConsigmentYarn) => {

    let whereCluse = {};
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
    whereCluse[`${wbTableName}.industry_id`] = industryId;
    whereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = neededFabricId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
    reconciliationWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = neededFabricId;

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.industry_id`] = industryId;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = neededFabricId;
    
    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }

    let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, transitionBetweenIndustriesWhereCluse]
    const yarnLotResults = await wbQueries.selectByIndustryByNeededFabricToBeManufacturedNotIncludedYarnsAndLotsWb(whereCluseArray, includedYarns, includedYarnLots, includedConsigmentYarn);

    return yarnLotResults;
};

exports.selectSumCurrentQuantityByIndustryByYarnByYarnLotByFabricToBeManufacturedInWb = async (industryId, yarnId, yarnLotId, consigmentYarnId, fabricToBeManufacturedId, yarnOrderId) => {

    let whereCluse = {};
    whereCluse[`${wbTableName}.is_deleted`] = 0;
    whereCluse[`${wbTableName}.is_active`] = 1;
    whereCluse[`${wbTableName}.industry_id`] = industryId;
    whereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricToBeManufacturedId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`] = consigmentYarnId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
    reconciliationWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricToBeManufacturedId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenWhereCluse = {};
    transitionBetweenWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenWhereCluse[`${wbTableName}.industry_id`] = industryId;
    transitionBetweenWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricToBeManufacturedId;
    transitionBetweenWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
    transitionBetweenWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    transitionBetweenWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    transitionBetweenWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;

    let whereCluseArray = [whereCluse, reconciliationWhereCluse, transitionBetweenWhereCluse]
    const yarnResults = await wbQueries.selectSumCurrentQuantityByIndustryByYarnByYarnLotInWb(whereCluseArray);

    return yarnResults
};


exports.selectRecordsByIndustryByYarnByYarnLotByFabricToBeManufactured = async (industryId, yarnId, yarnLotId, consigmentYarnId, fabricToBeManufacturedId, yarnOrderId) => {
    let whereCluse = {};
    whereCluse[`${wbTableName}.is_deleted`] = 0;
    whereCluse[`${wbTableName}.is_active`] = 1;
    whereCluse[`${wbTableName}.industry_id`] = industryId;
    whereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricToBeManufacturedId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`] = consigmentYarnId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
    reconciliationWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricToBeManufacturedId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenWhereCluse = {};
    transitionBetweenWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenWhereCluse[`${wbTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenWhereCluse[`${wbTableName}.industry_id`] = industryId;
    transitionBetweenWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricToBeManufacturedId;
    transitionBetweenWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
    transitionBetweenWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    transitionBetweenWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    transitionBetweenWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = yarnOrderId;


    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }
    let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, transitionBetweenWhereCluse]
    let orderByCluse = { attributeName: `date`, value: "desc" }

    const results = await wbQueries.selectRecordsByIndustryByYarnByYarnLotByFabricToBeManufactured(whereCluseArray, orderByCluse);
    return results;
};


exports.selectRequisitionsForWbYarnOrderRequisition = async (requisitionDetailsId) => {
    let callArray = []

    let whereCluse = {};
    whereCluse[`${wbManufacturingInputWbTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingInputWbTableName}.is_active`] = 1;
    whereCluse[`${wbManufacturingInputWbTableName}.wb_manufacturing_input_id`] = requisitionDetailsId;
    callArray.push(wbTransportWaWbDetailsQueries.selectRequisitionsForWbYarnOrderRequisition(whereCluse))

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbManufacturingInputWbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbManufacturingInputWbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbManufacturingInputWbTableName}.wb_manufacturing_input_id`] = requisitionDetailsId;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    callArray.push(wbReconciliationRequisitionDetailsQueries.selectInputRequisitionsForWbYarnOrderRequisition(reconciliationWhereCluse))

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${wbManufacturingInputWbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbManufacturingInputWbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbManufacturingInputWbTableName}.wb_manufacturing_input_id`] = requisitionDetailsId;
    callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectToRequisitionsForWbYarnOrderRequisition(transitionBetweenIndustriesWhereCluse))

    let requisitions = await Promise.all(callArray)    
    requisitions = [...new Set([].concat(...requisitions.map((o) => o)))]   
    
    return requisitions
};


exports.selectTransitionBetweenIndustriesRequisitionsForWaYarnOrderRequisition = async (requisitionDetailsId) => {
    let callArray = []

    let whereCluse = {};
    whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.is_active`] = 1;
    whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.wb_transition_between_industries_requisition_details_id`] = requisitionDetailsId;
    callArray.push(wbTransportWaWbDetailsQueries.selectTransitionBetweenIndustriesRequisitionsForWaYarnOrderRequisition(whereCluse))

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.wb_transition_between_industries_requisition_details_id`] = requisitionDetailsId;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    callArray.push(wbReconciliationRequisitionDetailsQueries.selectInputTransitionBetweenIndustriesRequisitionsForWaYarnOrderRequisition(reconciliationWhereCluse))

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.wb_transition_between_industries_requisition_details_id`] = requisitionDetailsId;
    callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectToTransitionBetweenIndustriesRequisitionsForWaYarnOrderRequisition(transitionBetweenWhWhereCluse))

    let requisitions = await Promise.all(callArray)        
    requisitions = [...new Set([].concat(...requisitions.map((o) => o)))]   
    return requisitions
};


exports.selectRequisitionsForWdFabricOrderRequisitionForWbOutputManufacturingRequisition = async (
    ordersRequisitionsId, 
    wcFabricOrderRequisitionDetailsId, 
    fabricId
) => {
    let callArray = []

    let whereCluse = {};
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.orders_requisitions_id`] = ordersRequisitionsId;
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.wc_fabric_order_requisition_details_id`] = wcFabricOrderRequisitionDetailsId;
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.fabric_id`] = fabricId;
    callArray.push(wdFormRequisitionDetailsQueries.selectRequisitionsForWdFabricOrderRequisitionForWbOutputManufacturingRequisition(whereCluse))

    let requisitions = await Promise.all(callArray)    
    requisitions = [...new Set([].concat(...requisitions.map((o) => o)))]   
    return requisitions
};

exports.selectManufacturingRequisitionsForTransportWaWb = async (wbId) => {
    let callArray = []

    let whereCluse = {};
    whereCluse[`${wbManufacturingInputWbTableName}.wb_id`] = wbId;
    callArray.push(wbManufacturingInputWbQueries.selectManufacturingRequisitionsForTransportWaWb(whereCluse))

    let requisitions = await Promise.all(callArray)    
    requisitions = [...new Set([].concat(...requisitions.map((o) => o)))]   
    return requisitions
};

exports.updateFabricToBeManufactured = async (wb) => {

    // Check is found
    let whereCluse = {};
    whereCluse[`${wbTableName}.id`] = wb.id;
    whereCluse[`${wbTableName}.is_deleted`] = 0;
    whereCluse[`${wbTableName}.is_active`] = 1;
    const isFound = await wbQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        // let currentQuantity = waCottonResult[0].current_quantity
        let defferenceQuantity = 0

        // we will decrement current quantity from store (wb) by following Steps :
        // Step 1 => Check If has current quantity in store (wb)

        const sumCurrentQuantityWb = await this.selectSumCurrentQuantityByIndustryByYarnByYarnLotByFabricToBeManufacturedInWb(
            wb.industryId,
            wb.yarnId,
            wb.yarnLotId,
            (wb.requisition_type == constantsPayloads.transportFromAToBType) ? 
                    wb.fromConsigmentYarnId : wb.consigmentYarnId,
            isFound[0].fabric_to_be_manufactured_id,
            wb.yarnOrderId

        )
        if (sumCurrentQuantityWb[0] != null) {
            // console.log("sumCurrentQuantityWb ::: ", sumCurrentQuantityWb);
            const sumCurrentQuantity = sumCurrentQuantityWb[0].current_quantity
            let newQuantity = parseFloat(wb.quantity)
            // let oldQuantity = isFound[0].current_quantity
            defferenceQuantity = parseFloat((sumCurrentQuantity - newQuantity).toFixed(3))

            if (sumCurrentQuantity >= newQuantity) {

                // Step 3 => select from (WB) Records for decrement current quantity
                const wbRecords = await this.selectRecordsByIndustryByYarnByYarnLotByFabricToBeManufactured(
                    wb.industryId,
                    wb.yarnId,
                    wb.yarnLotId,
                    (wb.requisition_type == constantsPayloads.transportFromAToBType) ? 
                    wb.fromConsigmentYarnId : wb.consigmentYarnId,
                    isFound[0].fabric_to_be_manufactured_id,
                    wb.yarnOrderId
                )
                if (wbRecords[0] != null) {
                    // console.log("wbRecords ::: ", wbRecords);

                    // Increment Wb current_quantity
                    // await wbQueries.update({
                    //     current_quantity: selectOneWbRecord[0].current_quantity + defferenceQuantity
                    // }, {
                    //     id: selectOneWbRecord[0].id
                    // })

                    for (let i = 0; i < wbRecords.length; i++) {
                        const wbRecord = wbRecords[i];
                        let currentQuantity = wbRecord.current_quantity
                        let updatedQuantity = 0

                        // decrement Wb CurrentQuantity
                        // let returnedQuantityObj = await this.decrementWbCurrentQuantity(defferenceQuantity, currentQuantity, wbRecord, updatedQuantity);
                        // defferenceQuantity = returnedQuantityObj.newQuantity
                        // updatedQuantity = returnedQuantityObj.updatedQuantity

                        if (currentQuantity >= newQuantity) {
                            wbRecord.quantity = newQuantity
                            wb.quantity = newQuantity
                            newQuantity = 0
                            defferenceQuantity = 0

                        } else {
                            wbRecord.quantity = currentQuantity
                            wb.quantity = currentQuantity
                            defferenceQuantity = defferenceQuantity - currentQuantity
                            newQuantity = newQuantity - currentQuantity
                        }

                        wbRecord.personid = wb.personid
                        wbRecord.ipaddress = wb.ipaddress
                        wb.price = wbRecord.price
                        wb.priceDollar = wbRecord.price_dollar
                        // wb.fromConsigmentYarnId = wbRecord.from_consigment_yarn_id

                        wbRecord.items = [wb]
                        if (wbRecord.requisition_type == constantsPayloads.transportFromAToBType) {
                            // wbRecord.fromYarnOrderId = wbRecord.personid
                            const wbTransportWaWbDetailsResult = await wbTransportWaWbDetailsService.updateDecrement(wbRecord)

                            if (wbTransportWaWbDetailsResult) {
                                await wbTransportWaWbDetailsService.create(wbRecord)
                            } else {
                                updateResults = false
                            }

                        } else if (wbRecord.requisition_type == constantsPayloads.reconcilitionType) {
                            const wbReconciliationRequisitionDetailsResult = await wbReconciliationRequisitionDetailsService.updateDecrement(wbRecord)

                            if (wbReconciliationRequisitionDetailsResult) {
                                wb.inputOutput = 1
                                wbRecord.industryId = wb.industryId
                                await wbReconciliationRequisitionDetailsService.create(wbRecord)
                            } else {
                                updateResults = false
                            }
                        } else if (wbRecord.requisition_type == constantsPayloads.transportBetweenType) {
                            const wbTransitionBetweenIndustriesRequisitionDetailsResult = await wbTransitionBetweenIndustriesRequisitionDetailsService.updateDecrement(wbRecord)

                            if (wbTransitionBetweenIndustriesRequisitionDetailsResult) {
                                wbRecord.toIndustryId = wb.industryId
                                await wbTransitionBetweenIndustriesRequisitionDetailsService.create(wbRecord)
                            } else {
                                updateResults = false
                            }
                        }


                        // Enter to if condition when stock runs out
                        if (newQuantity == 0) {
                            updateResults = true
                            break;
                        }
                    }
                } else {
                    updateResults = false
                }
            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: sumCurrentQuantity,
                    newQuantity: newQuantity
                }
            }
        } else {
            return {
                ...constants.wrongQuantity,
                spentQuantity: 0,
                newQuantity: defferenceQuantity
            }
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
