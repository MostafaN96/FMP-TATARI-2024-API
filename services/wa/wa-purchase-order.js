// Services
const waPurchaseOrderDetailsService = require("./wa-purchase-order-details");
const waReportService = require("./wa-report");
const waYarnOrderRequisitionDetailsService = require("./wa-yarn-order-requisition-details");

// Queries
const waPurchaseOrderQueries = require("../../db/queries/wa/wa-purchase-order");
const waPurchaseOrderDetailsQueries = require("../../db/queries/wa/wa-purchase-order-details");
const weDyedFabricOrderRequisitionDetailsQueries = require("../../db/queries/we/we-dyed-fabric-order-requisition-details");
const wcFabricOrderRequisitionDetailsQueries = require("../../db/queries/wc/wc-fabric-order-requisition-details");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");

// Helper
const trans = require("../../helpers/transform");
const { 
    waPurchaseOrderTableName, 
    waPurchaseOrderDetailsTableName, 
    wdDyeingOrderRequisitionDetailsTableName, 
    weDyedFabricOrderRequisitionDetailsTableName, 
    waYarnOrderRequisitionDetailsTableName, 
    wcFabricOrderRequisitionDetailsTableName
} = require("../../util/database-tables-name");

exports.create = async (waPurchaseOrder) => {
    waPurchaseOrder.id = trans.transform();

    // For Add wa requisition (optional)
    waPurchaseOrder.purchaseOrderId = waPurchaseOrder.id;

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(waPurchaseOrderTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    waPurchaseOrder.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await waPurchaseOrderQueries.selectOne({ name: waPurchaseOrder.name });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await waPurchaseOrderQueries.insert(waPurchaseOrder);
    if (results) {
        return await waPurchaseOrderDetailsService.create(waPurchaseOrder);
    } else {
        return constants.insertError;
    }
};

exports.selectOpenedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${waPurchaseOrderTableName}.is_deleted`] = 0;
    whereCluse[`${waPurchaseOrderTableName}.is_active`] = 1;
    const isOrder = 1

    const results = await waPurchaseOrderQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await waPurchaseOrderDetailsService.selectByRequisitionIdOpenedOrder(element.id);
        }
        
    }
    return results;
  };
  
exports.selectClosedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${waPurchaseOrderTableName}.is_deleted`] = 0;
    whereCluse[`${waPurchaseOrderTableName}.is_active`] = 1;
    const isOrder = 0

    const results = await waPurchaseOrderQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await waPurchaseOrderDetailsService.selectByRequisitionIdClosedOrder(element.id);
        }
    }
    return results;
  };
  
  exports.closedOrderByRequisition = async (requisitionId) => {

    let result = false
    let whereCluse = {};
    whereCluse[`${waPurchaseOrderDetailsTableName}.wa_add_purchase_order_id`] = requisitionId;
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_active`] = 1;
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_order`] = 1;

    const selectOpenedOrderResults = await waPurchaseOrderDetailsQueries.selectByRequisitionId(whereCluse);
    if(selectOpenedOrderResults[0] != null) {
        for (let i = 0; i < selectOpenedOrderResults.length; i++) {
            const selectOpenedOrderResult = selectOpenedOrderResults[i];

            // close requisition details order
            let waYarnOrderRequisitionDetailsWhereCluse = {};
            waYarnOrderRequisitionDetailsWhereCluse[`${waPurchaseOrderDetailsTableName}.id`] = selectOpenedOrderResult.id;
            await waPurchaseOrderDetailsQueries.update({
                is_order : 0
            }, 
            waYarnOrderRequisitionDetailsWhereCluse)
        }

        // close requisition order
        // let waYarnOrderRequisitionWhereCluse = {};
        // waYarnOrderRequisitionWhereCluse[`${waPurchaseOrderTableName}.id`] = requisitionId;
        // const waYarnOrderRequisitionResult = await waPurchaseOrderQueries.update({
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
    whereCluse[`${waPurchaseOrderDetailsTableName}.wa_add_purchase_order_id`] = requisitionId;
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_active`] = 1;
    whereCluse[`${waPurchaseOrderDetailsTableName}.is_order`] = 1;

    let waYarnOrderRequisitionDetailsResult = await waPurchaseOrderDetailsQueries.selectByRequisitionId(whereCluse)
    if (Array.isArray(waYarnOrderRequisitionDetailsResult) && waYarnOrderRequisitionDetailsResult.length > 0) {
        return waYarnOrderRequisitionDetailsResult
    } else {
        return constants.invalidDataResponse
    }
   
}
  
  exports.inquireYarnsOfFabricForOrderWa = async (weDyedFabricOrderRequisitionId) => {
    console.log("[weDyedFabricOrderRequisitionId] ::: ", [weDyedFabricOrderRequisitionId]);
    
    let data = []

    let whereCluse = {};
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

        let dyeingOrderRequisitions = await weDyedFabricOrderRequisitionDetailsQueries.selectByRequisitionIds(whereCluse, [weDyedFabricOrderRequisitionId])

        for (let i = 0; i < dyeingOrderRequisitions.length; i++) {
        const element = dyeingOrderRequisitions[i];
        
        let result = await waReportService.inquireYarnsOfFabricForOrderWa(element, data)

        if(data.length > 0) {
            data = [...result, ...data]
        } else {
            data = result
        }

    }

    let resultData = await this.filterOrderYarnsArray(data, dyeingOrderRequisitions)
    // console.log("resultData ::::::::::::::: ", resultData);
    if (Array.isArray(resultData) && resultData.length > 0) {
        resultData[0].dyeingOrderRequisition = dyeingOrderRequisitions[0]
    }
    return resultData
   
}
  
  exports.inquireYarnsOfFabricForOrderWa2 = async (weDyedFabricOrderRequisitionId) => {    
    let data = []

    let whereCluse = {};
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

        let dyeingOrderRequisitions = await weDyedFabricOrderRequisitionDetailsQueries.selectByRequisitionIds(whereCluse, weDyedFabricOrderRequisitionId)

        for (let i = 0; i < dyeingOrderRequisitions.length; i++) {
        const element = dyeingOrderRequisitions[i];
        
        let result = await waReportService.inquireYarnsOfFabricForOrderWa(element, data)

        if(data.length > 0) {
            data = [...result, ...data]
        } else {
            data = result
        }

    }

    let resultData = await this.filterOrderYarnsArray(data, dyeingOrderRequisitions)
    // console.log("resultData ::::::::::::::: ", resultData);
    if (Array.isArray(resultData) && resultData.length > 0) {
        // console.log("resultData ::: ", resultData);
        // console.log("dyeingOrderRequisitions ::: ", dyeingOrderRequisitions);
        resultData[0].dyeingOrderRequisition = dyeingOrderRequisitions[0]
    }
    return resultData
   
}


exports.getCurrentNeededYarnQuantityOfFabricForOrder = async (bodyPaylod) => {
    let data = []

    let whereCluse = {};
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.fabric_id`] = bodyPaylod.fabricId;
    whereCluse[`${wcFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`] = bodyPaylod.ordersRequisitionsId;

    let wcFabricOrderRequisitionDetailsResult = await wcFabricOrderRequisitionDetailsQueries.selectByFabricByOrderRequisitions(whereCluse)    
    if (Array.isArray(wcFabricOrderRequisitionDetailsResult) && wcFabricOrderRequisitionDetailsResult.length > 0) {
        wcFabricOrderRequisitionDetailsResult[0].yarn_id = bodyPaylod.yarnId
        console.log("wcFabricOrderRequisitionDetailsResult ::: ", wcFabricOrderRequisitionDetailsResult);
        data = await waReportService.getCurrentNeededYarnQuantityOfFabricForOrder(wcFabricOrderRequisitionDetailsResult[0])
        console.log("data ::: ", data);

        if (Array.isArray(data) && data.length > 0) {
            if (data[0].needed_quantity <= 0) {
                data[0].needed_quantity = 0
            }
        }
    } else {
        data.push({
            needed_quantity: 0,
        })
    }
    console.log("data ::::::::::::::: ", data);
    
    return data

}
  
  exports.inquireYarnsOfFabricForOrderWaByOrders = async (weDyedFabricOrdersRequisition) => {
    let data = []
    console.log("weDyedFabricOrdersRequisition :::::: ", weDyedFabricOrdersRequisition);
    
    let ordersIds = weDyedFabricOrdersRequisition.map(a => a.orderId);
    let ordersRequisitionsIds = weDyedFabricOrdersRequisition.map(a => a.ordersRequisitionsId);

    // for (let i = 0; i < weDyedFabricOrdersRequisition.length; i++) {
    //     const weDyedFabricOrder = weDyedFabricOrdersRequisition[i];

        const inquireYarnsData = await this.inquireYarnsOfFabricForOrderWa2(ordersIds)
        if (Array.isArray(inquireYarnsData) && inquireYarnsData.length > 0) {
            if(data.length > 0) {
                data = [...inquireYarnsData, ...data]
                data = await this.filterOrderYarnsArray(data)
            } else {
                data = inquireYarnsData
            }
        }
        
    // }
    // console.log("data ::::::::::::: ", data);
    await yarnOrdered(data, ordersRequisitionsIds);
    
    return data
   
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

async function yarnOrdered(data, ordersRequisitionsIds) {
    for (let j = 0; j < data.length; j++) {
        const dataElement = data[j];

        let whereCluse = {};
        whereCluse[`${waYarnOrderRequisitionDetailsTableName}.yarn_id`] = dataElement.id;
        whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_order`] = 1;

        let groupBy = ['orders_requisitions_id'];

        const selectWaYarnOrdersRequisitionDetsilsResult = await waYarnOrderRequisitionDetailsService.selectGroupByWhereIn(whereCluse, ordersRequisitionsIds, groupBy);
        console.log(selectWaYarnOrdersRequisitionDetsilsResult);
        
        if (Array.isArray(selectWaYarnOrdersRequisitionDetsilsResult) && selectWaYarnOrdersRequisitionDetsilsResult.length > 0) {
            let orderedQuantity = selectWaYarnOrdersRequisitionDetsilsResult[0].quantity;
            let neededQuantity = dataElement.needed_quantity;

            if (orderedQuantity >= neededQuantity) {
                data.splice(j, 1);
                j--;
            } else {
                dataElement.needed_quantity = dataElement.needed_quantity - orderedQuantity;
            }
        }
    }
}

