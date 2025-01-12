// Services
const wcFabricOrderRequisitionDetailsService = require("./wc-fabric-order-requisition-details");
const wcReportService = require("./wc-report");
const ordersRequisitionsService = require("../general/orders-requisitions");

// Queries
const wcFabricOrderRequisitionQueries = require("../../db/queries/wc/wc-fabric-order-requisition");
const wcFabricOrderRequisitionDetailsQueries = require("../../db/queries/wc/wc-fabric-order-requisition-details");
const weDyedFabricOrderRequisitionDetailsQueries = require("../../db/queries/we/we-dyed-fabric-order-requisition-details");
const wdQueries = require("../../db/queries/wd/wd");
const generalQueries = require("../../db/queries/general/general");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wcFabricOrderRequisitionTableName, 
    wcFabricOrderRequisitionDetailsTableName, 
    weDyedFabricOrderRequisitionDetailsTableName,
    fabricTableName,
    wcTableName,
    wcAddRequisitionDetailsTableName,
    wcReconciliationRequisitionDetailsTableName,
    wdTransportRequisitionWdWcDetailsTableName,
    wbManufacturingOutputTableName,
    wcReconciliationRequisitionTableName,
    wdTransportRequisitionWdWcTableName,
    wcTransitionBetweenWHRequisitionTableName,
    wdTransportWcWdDetailsTableName,
    wdTableName,
    wdReconciliationRequisitionDetailsTableName,
    wdTransitionBetweenDyersRequisitionDetailsTableName
} = require("../../util/database-tables-name");

exports.create = async (wcFabricOrderRequisition) => {
    wcFabricOrderRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wcFabricOrderRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wcFabricOrderRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wcFabricOrderRequisitionQueries.selectOne({ number: wcFabricOrderRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    // check if orders Requisitions added
    const ordersRequisitionsResults = await ordersRequisitionsService.checkForCreateOrder(wcFabricOrderRequisition);
    if (ordersRequisitionsResults) {
        const results = await wcFabricOrderRequisitionQueries.insert(wcFabricOrderRequisition);
        if (results) {
            return await wcFabricOrderRequisitionDetailsService.create(wcFabricOrderRequisition);
        } else {
            return constants.insertError;
        }
    } else {
        return constants.insertError;
    }
};

exports.select = async (whereCluse) => {

    const results = await wcFabricOrderRequisitionQueries.selectOne(whereCluse);
    return results;
  };

exports.selectOpenedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 1

    const results = await wcFabricOrderRequisitionQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await wcFabricOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrder(element.id);
        }
    }
    return results;
  };
  
exports.selectClosedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 0

    const results = await wcFabricOrderRequisitionQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await wcFabricOrderRequisitionDetailsService.selectByRequisitionIdClosedOrder(element.id);
        }
    }
    return results;
  };
  
exports.selectByWarehouseWc = async (warehouseId) => {
  
    let wcFabricWhereCluse = {};
    wcFabricWhereCluse[`${wcAddRequisitionDetailsTableName}.is_deleted`] = 0;
    wcFabricWhereCluse[`${wcAddRequisitionDetailsTableName}.is_active`] = 1;
    wcFabricWhereCluse[`${wcAddRequisitionDetailsTableName}.warehouse_id`] = warehouseId;

    let wcReconciliationWhereCluse = {};
    wcReconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
    wcReconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_active`] = 1;
    wcReconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    wcReconciliationWhereCluse[`${wcReconciliationRequisitionTableName}.warehouse_id`] = warehouseId;

    let wcTransportWdWcWhereCluse = {};
    wcTransportWdWcWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
    wcTransportWdWcWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;
    wcTransportWdWcWhereCluse[`${wdTransportRequisitionWdWcTableName}.warehouse_id`] = warehouseId;
    wcTransportWdWcWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportFromBToAType;

    let WcManufacturingOutputWhereCluse = {};
    WcManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
    WcManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;
    WcManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.warehouse_id`] = warehouseId;
    WcManufacturingOutputWhereCluse[`${wcTableName}.type`] = constantsPayloads.manufactruingType;
    
    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${wcTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportBetweenType;
    transitionBetweenWhWhereCluse[`${wcTransitionBetweenWHRequisitionTableName}.to_warehouse_id`] = warehouseId;

  let whereCluseArray = [
    wcFabricWhereCluse, 
    wcReconciliationWhereCluse, 
    wcTransportWdWcWhereCluse, 
    WcManufacturingOutputWhereCluse,
    transitionBetweenWhWhereCluse
]
  
    const results = await wcFabricOrderRequisitionQueries.selectStoredFabricsWc(whereCluseArray);
    return results;
  };

  
exports.selectByDyeingWd = async (dyeingId) => {

    const groupBy = [`wc_fabric_order_requisition_id`]

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

    let whereCluseArray = [
        whereCluse, 
        reconciliationWhereCluse, 
        andWhereCluse, 
        transitionBetweenWhereCluse
    ]
    const consigmentDyeingResults = await wdQueries.selectQuantityByDyeingWd(whereCluseArray, groupBy);

    return consigmentDyeingResults;
};

  exports.closedOrderByRequisition = async (requisitionId) => {

    let result = false
    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = requisitionId;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

    const selectOpenedOrderResults = await wcFabricOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
    if(selectOpenedOrderResults[0] != null) {
        for (let i = 0; i < selectOpenedOrderResults.length; i++) {
            const selectOpenedOrderResult = selectOpenedOrderResults[i];

            // close requisition details order
            let waYarnOrderRequisitionDetailsWhereCluse = {};
            waYarnOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.id`] = selectOpenedOrderResult.id;
            await wcFabricOrderRequisitionDetailsQueries.update({
                is_order : 0
            }, 
            waYarnOrderRequisitionDetailsWhereCluse)
        }

        // close requisition order ??????????????????????????????
        // let waYarnOrderRequisitionWhereCluse = {};
        // waYarnOrderRequisitionWhereCluse[`${wcFabricOrderRequisitionTableName}.id`] = requisitionId;
        // const waYarnOrderRequisitionResult = await wcFabricOrderRequisitionQueries.update({
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
  
  exports.selectFabricsOrderRequisition = async (requisitionId) => {

    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = requisitionId;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

    let wcFabricOrderRequisitionDetailsResult = await wcFabricOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse)
    if (Array.isArray(wcFabricOrderRequisitionDetailsResult) && wcFabricOrderRequisitionDetailsResult.length > 0) {
        return wcFabricOrderRequisitionDetailsResult
    } else {
        return constants.invalidDataResponse
    }
   
}
  
exports.inquireFabricsForOrderWc = async (dyeingOrderRequisitionId) => {
    let data = []

    let whereCluse = {};
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

    let dyeingOrderRequisitions = await weDyedFabricOrderRequisitionDetailsQueries.selectByRequisitionIds(whereCluse, [dyeingOrderRequisitionId])
    // console.log("dyeingOrderRequisitions ::: ", dyeingOrderRequisitions);

    data = await wcReportService.fabricsForOrderWc(dyeingOrderRequisitions)

    let resultData = await this.filterOrderFabricsArray(data, dyeingOrderRequisitions)
    // console.log("resultData ::::::::::::::: ", resultData);
    if (Array.isArray(resultData) && resultData.length > 0) {
        resultData[0].dyeingOrderRequisition = dyeingOrderRequisitions[0]
    }

    // console.log("resultData ::: ", resultData);
    return resultData

}

exports.filterOrderFabricsArray = async (data) => {
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
