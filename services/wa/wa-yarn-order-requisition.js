// Services
const waYarnOrderRequisitionDetailsService = require("./wa-yarn-order-requisition-details");
const waReportService = require("./wa-report");
const ordersRequisitionsService = require("../general/orders-requisitions");

// Queries
const waYarnOrderRequisitionQueries = require("../../db/queries/wa/wa-yarn-order-requisition");
const waYarnOrderRequisitionDetailsQueries = require("../../db/queries/wa/wa-yarn-order-requisition-details");
const weDyedOrderRequisitionDetailsQueries = require("../../db/queries/we/we-dyed-fabric-order-requisition-details");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");

// Helper
const trans = require("../../helpers/transform");
const { 
    waYarnOrderRequisitionTableName, 
    waYarnOrderRequisitionDetailsTableName, 
    weDyedFabricOrderRequisitionDetailsTableName, 
    waAddRequisitionDetailsTableName, 
    waTableName, 
    waReconciliationRequisitionTableName, 
    waTransitionBetweenWHRequisitionTableName, 
    wbTransportRequisitionWbWaTableName, 
    wbTransportWaWbDetailsTableName, 
    wbTableName, 
    wbReconciliationRequisitionDetailsTableName, 
    wbTransitionBetweenIndustriesRequisitionDetailsTableName, 
    waTransitionBetweenWHRequisitionDetailsTableName,
    wbTransportRequisitionWbWaDetailsTableName,
    waReconciliationRequisitionDetailsTableName
} = require("../../util/database-tables-name");

exports.create = async (waYarnOrderRequisition) => {
    waYarnOrderRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(waYarnOrderRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    waYarnOrderRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await waYarnOrderRequisitionQueries.selectOne({ number: waYarnOrderRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    // check if orders Requisitions added
    const ordersRequisitionsResults = await ordersRequisitionsService.checkForCreateOrder(waYarnOrderRequisition);
    if(ordersRequisitionsResults) {
        const results = await waYarnOrderRequisitionQueries.insert(waYarnOrderRequisition);
        if (results) {
            return await waYarnOrderRequisitionDetailsService.create(waYarnOrderRequisition);
        } else {
            return constants.insertError;
        }
    } else {
        return constants.insertError;
    }
    
};

exports.selectOpenedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${waYarnOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${waYarnOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 1

    const results = await waYarnOrderRequisitionQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await waYarnOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrder(element.id);
        }
    }
    return results;
  };
  
exports.selectClosedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${waYarnOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${waYarnOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 0

    const results = await waYarnOrderRequisitionQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await waYarnOrderRequisitionDetailsService.selectByRequisitionIdClosedOrder(element.id);
        }
    }
    return results;
  };
  
  exports.closedOrderByRequisition = async (requisitionId) => {

    let result = false
    let whereCluse = {};
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = requisitionId;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_order`] = 1;

    const selectOpenedOrderResults = await waYarnOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
    if(selectOpenedOrderResults[0] != null) {
        for (let i = 0; i < selectOpenedOrderResults.length; i++) {
            const selectOpenedOrderResult = selectOpenedOrderResults[i];

            // close requisition details order
            let waYarnOrderRequisitionDetailsWhereCluse = {};
            waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.id`] = selectOpenedOrderResult.id;
            await waYarnOrderRequisitionDetailsQueries.update({
                is_order : 0
            }, 
            waYarnOrderRequisitionDetailsWhereCluse)
        }

        // close requisition order ??????????????????????????????
        // let waYarnOrderRequisitionWhereCluse = {};
        // waYarnOrderRequisitionWhereCluse[`${waYarnOrderRequisitionTableName}.id`] = requisitionId;
        // const waYarnOrderRequisitionResult = await waYarnOrderRequisitionQueries.update({
        //     is_order : 0
        // },
        // waYarnOrderRequisitionWhereCluse)
        // if(waYarnOrderRequisitionResult) {
            result = constants.updateSuccess
        // } else {
        //     result = constants.updateError
        // }
    } else {
        result = constants.invalidDataResponse
    }
    return result
}
  
  exports.closedOrderByOrdersRequisitionsId = async (ordersRequisitionsId) => {

    let result = false
    let whereCluse = {};
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.orders_requisitions_id`] = ordersRequisitionsId;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_order`] = 1;

    const selectOpenedOrderResults = await waYarnOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
    if(selectOpenedOrderResults[0] != null) {
        for (let i = 0; i < selectOpenedOrderResults.length; i++) {
            const selectOpenedOrderResult = selectOpenedOrderResults[i];

            // close requisition details order
            let waYarnOrderRequisitionDetailsWhereCluse = {};
            waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.id`] = selectOpenedOrderResult.id;
            await waYarnOrderRequisitionDetailsQueries.update({
                is_order : 0
            }, 
            waYarnOrderRequisitionDetailsWhereCluse)
        }

        // close requisition order ??????????????????????????????
        // let waYarnOrderRequisitionWhereCluse = {};
        // waYarnOrderRequisitionWhereCluse[`${waYarnOrderRequisitionTableName}.id`] = requisitionId;
        // const waYarnOrderRequisitionResult = await waYarnOrderRequisitionQueries.update({
        //     is_order : 0
        // },
        // waYarnOrderRequisitionWhereCluse)
        // if(waYarnOrderRequisitionResult) {
            result = constants.updateSuccess
        // } else {
        //     result = constants.updateError
        // }
    } else {
        result = constants.invalidDataResponse
    }
    return result
}
  
  exports.selectYarnsOfYarnOrderRequisition = async (requisitionId) => {

    let whereCluse = {};
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.wa_yarn_order_requisition_id`] = requisitionId;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_order`] = 1;

    let waYarnOrderRequisitionDetailsResult = await waYarnOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse)
    if (Array.isArray(waYarnOrderRequisitionDetailsResult) && waYarnOrderRequisitionDetailsResult.length > 0) {
        return waYarnOrderRequisitionDetailsResult
    } else {
        return constants.invalidDataResponse
    }
   
}


exports.selectByYarnWa = async (yarnId) => {
    let whereCluse = {};
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.yarn_id`] = yarnId;
  
    const results = await waYarnOrderRequisitionQueries.selectByYarnWa(whereCluse);
    return results;
  };

exports.selectByWarehouseWa = async (warehouseId) => {
    let whereCluse = {};
      whereCluse[`${waAddRequisitionDetailsTableName}.is_deleted`] = 0;
      whereCluse[`${waAddRequisitionDetailsTableName}.is_active`] = 1;
      whereCluse[`${waAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;
  
      let reconciliationWhereCluse = {};
      reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
      reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
      reconciliationWhereCluse[`${waTableName}.type`] = constantsPayloads.reconcilitionType;
      reconciliationWhereCluse[`${waReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;
  
      let transportWbWaWhereCluse = {};
      transportWbWaWhereCluse[`${waTableName}.is_deleted`] = 0;
      transportWbWaWhereCluse[`${waTableName}.is_active`] = 1;
      transportWbWaWhereCluse[`${waTableName}.type`] = constantsPayloads.transportFromBToAType;
      transportWbWaWhereCluse[`${wbTransportRequisitionWbWaTableName}.warehouse_id`] = warehouseId;
  
      let transitionBetweenWhWhereCluse = {};
      transitionBetweenWhWhereCluse[`${waTableName}.is_deleted`] = 0;
      transitionBetweenWhWhereCluse[`${waTableName}.is_active`] = 1;
      transitionBetweenWhWhereCluse[`${waTableName}.type`] = constantsPayloads.transportBetweenType;
      transitionBetweenWhWhereCluse[`${waTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = warehouseId;
  
      let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }
  
      let whereCluseArray = [whereCluse, reconciliationWhereCluse, andWhereCluse, 
        transportWbWaWhereCluse, transitionBetweenWhWhereCluse]
  
    const results = await waYarnOrderRequisitionQueries.selectByWarehouseWa(whereCluseArray);
    return results;
  };

  
exports.selectByIndustryWb = async (industryId) => {

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
  
    const results = await waYarnOrderRequisitionQueries.selectByIndustryByFabricWb(whereCluseArray);
    return results;
  };

exports.selectByIndustryByFabricWb = async (industryId, fabricId) => {
    let wbTransportWaWbDetailsWhereCluse = {};
      wbTransportWaWbDetailsWhereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
      wbTransportWaWbDetailsWhereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
      wbTransportWaWbDetailsWhereCluse[`${wbTableName}.industry_id`] = industryId;
      wbTransportWaWbDetailsWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricId;
  
      let reconciliationWhereCluse = {};
      reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
      reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.is_active`] = 1;
      reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;
      reconciliationWhereCluse[`${wbTableName}.industry_id`] = industryId;
      reconciliationWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricId;

      let transitionBetweenIndustriesWhWhereCluse = {};
      transitionBetweenIndustriesWhWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_deleted`] = 0;
      transitionBetweenIndustriesWhWhereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_active`] = 1;
      transitionBetweenIndustriesWhWhereCluse[`${wbTableName}.industry_id`] = industryId;
      transitionBetweenIndustriesWhWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabricId;

      let andWhereCluse = { whereTableName: `current_quantity`, operator: ">", value: "0" }
  
      let whereCluseArray = [wbTransportWaWbDetailsWhereCluse, reconciliationWhereCluse, andWhereCluse, 
        transitionBetweenIndustriesWhWhereCluse]
  
    const results = await waYarnOrderRequisitionQueries.selectByIndustryByFabricWb(whereCluseArray);
    return results;
  };
  
  exports.inquireYarnsOfFabricForOrderWa = async (weDyedFabricOrderRequisition) => {
    let data = []

    let whereCluse = {};
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

        let weDyedFabricOrderRequisitions = await weDyedOrderRequisitionDetailsQueries.selectByRequisitionIds(whereCluse, [weDyedFabricOrderRequisition])

    for (let i = 0; i < weDyedFabricOrderRequisitions.length; i++) {
        const element = weDyedFabricOrderRequisitions[i];
        
        let result = await waReportService.yarnsOfFabricForOrderWa(element)

        if(data.length > 0) {
            data = [...result, ...data]
        } else {
            data = result
        }

    }

    let resultData = await this.filterOrderYarnsArray(data, weDyedFabricOrderRequisitions)
    // console.log("resultData ::::::::::::::: ", resultData);
    if (Array.isArray(resultData) && resultData.length > 0) {
        resultData[0].weDyedFabricOrderRequisition = weDyedFabricOrderRequisitions[0]
    }
    return resultData
   
}

exports.filterOrderYarnsArray = async (data) => {
    // Declare a new array
    let newArray = [];
 
    // Declare an empty object
    let uniqueObject = {};
 
    // Loop for the array elements
    for (let i in data) {
 
        // Extract the title
        objTitle = data[i]['id'];
 
        // Use the title as the index
        // console.log(data[i]);
        if(uniqueObject[objTitle]) {
            // console.log("uniqueObject[objTitle] :::::: ", uniqueObject[objTitle]);
            // console.log("data[i]['id'] :::::: ", data[i]['needed_quantity']);
            data[i].needed_quantity = parseFloat((data[i]['needed_quantity'] + uniqueObject[objTitle].needed_quantity).toFixed(3))
        }
        uniqueObject[objTitle] = data[i];
    }
 
    // Loop to push unique object into array
    for (i in uniqueObject) {
        if(uniqueObject[i].needed_quantity > 0) {
            newArray.push(uniqueObject[i]);
        }
    }

    return newArray

}
