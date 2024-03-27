// Queries
const wbQueries = require("../../db/queries/wb/wb");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { lotFormTableName, wbTableName, wbReconciliationRequisitionDetailsTableName, wbReconciliationRequisitionDetailsWbTableName, wbTransportWaWbDetailsTableName, wbTransitionBetweenIndustriesRequisitionDetailsTableName, wbTransitionBetweenIndustriesRequisitionDetailsWbTableName } = require("../../util/database-tables-name");

// Helper
const trans = require("../../helpers/transform");

// Services
const wbTransportWaWbDetailsService = require("./wb-transport-wa-wb-details");
const wbReconciliationRequisitionDetailsService = require("./wb-reconciliation-requisition-details");
const wbTransitionBetweenIndustriesRequisitionDetailsService = require("./wb-transition-between-industries-requisition-details");
const fabricYarnsService = require("../general/fabric-yarns");

exports.createForReconciliation = async (wb, items) => {
    wb.wbId = trans.transform();

    const results = await wbQueries.insertForReconciliation(wb, items);
    if (results) {
        return constants.insertSuccess;
    } else {
        return constants.insertError;
    }
};

exports.selectSumCurrentQuantityByIndustryByYarnByYarnLotInWb = async (industryId, yarnId, yarnLotId, consigmentYarnId) => {

    let whereCluse = {};
    whereCluse[`${wbTableName}.is_deleted`] = 0;
    whereCluse[`${wbTableName}.is_active`] = 1;
    whereCluse[`${wbTableName}.industry_id`] = industryId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`] = consigmentYarnId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.industry_id`] = industryId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;

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

exports.selectConsigmentYarnQuantityByYarnByIndustryByLotWb = async (yarnId, industryId, yarnLotId) => {

    let whereCluse = {};
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${wbTableName}.industry_id`] = industryId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.industry_id`] = industryId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;

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


exports.selectRecordsByIndustryByYarnByYarnLot = async (industryId, yarnId, yarnLotId, consigmentYarnId) => {
    let whereCluse = {};
    whereCluse[`${wbTableName}.is_deleted`] = 0;
    whereCluse[`${wbTableName}.is_active`] = 1;
    whereCluse[`${wbTableName}.industry_id`] = industryId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`] = consigmentYarnId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.industry_id`] = industryId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    transitionBetweenIndustriesWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;

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

exports.selectQuantityByIndustryByFabricWb = async (industryId, fabricId) => {

    let whereCluse = {};
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
    whereCluse[`${wbTableName}.industry_id`] = industryId;
    whereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
    reconciliationWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricId;

    let transitionBetweenIndustriesWhereCluse = {};
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

exports.selectSumCurrentQuantityByIndustryByYarnByYarnLotByFabricToBeManufacturedInWb = async (industryId, yarnId, yarnLotId, consigmentYarnId, fabricToBeManufacturedId) => {

    let whereCluse = {};
    whereCluse[`${wbTableName}.is_deleted`] = 0;
    whereCluse[`${wbTableName}.is_active`] = 1;
    whereCluse[`${wbTableName}.industry_id`] = industryId;
    whereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricToBeManufacturedId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`] = consigmentYarnId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
    reconciliationWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricToBeManufacturedId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenWhereCluse = {};
    transitionBetweenWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenWhereCluse[`${wbTableName}.industry_id`] = industryId;
    transitionBetweenWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricToBeManufacturedId;
    transitionBetweenWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_id`] = yarnId;
    transitionBetweenWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    transitionBetweenWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;

    let whereCluseArray = [whereCluse, reconciliationWhereCluse, transitionBetweenWhereCluse]
    const yarnResults = await wbQueries.selectSumCurrentQuantityByIndustryByYarnByYarnLotInWb(whereCluseArray);

    return yarnResults
};


exports.selectRecordsByIndustryByYarnByYarnLotByFabricToBeManufactured = async (industryId, yarnId, yarnLotId, consigmentYarnId, fabricToBeManufacturedId) => {
    let whereCluse = {};
    whereCluse[`${wbTableName}.is_deleted`] = 0;
    whereCluse[`${wbTableName}.is_active`] = 1;
    whereCluse[`${wbTableName}.industry_id`] = industryId;
    whereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricToBeManufacturedId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = yarnLotId;
    whereCluse[`${wbTransportWaWbDetailsTableName}.from_consigment_yarn_id`] = consigmentYarnId;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.type`] = constantsPayloads.reconcilitionType;
    reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
    reconciliationWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricToBeManufacturedId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_id`] = yarnId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
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


    let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }
    let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, transitionBetweenWhereCluse]
    let orderByCluse = { attributeName: `date`, value: "desc" }

    const results = await wbQueries.selectRecordsByIndustryByYarnByYarnLotByFabricToBeManufactured(whereCluseArray, orderByCluse);
    return results;
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
            isFound[0].fabric_to_be_manufactured_id
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
                    isFound[0].fabric_to_be_manufactured_id
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
