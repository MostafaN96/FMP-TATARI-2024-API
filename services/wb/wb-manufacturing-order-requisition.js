// Services
const wbManufacturingOrderRequisitionDetailsService = require("./wb-manufacturing-order-requisition-details");
const wbReportService = require("./wb-report");

// Queries
const wbManufacturingOrderRequisitionQueries = require("../../db/queries/wb/wb-manufacturing-order-requisition");
const wbManufacturingOrderRequisitionDetailsQueries = require("../../db/queries/wb/wb-manufacturing-order-requisition-details");
const generalQueries = require("../../db/queries/general/general");
const wdDyeingOrderRequisitionDetailsQueries = require("../../db/queries/wd/wd-dyeing-order-requisition-details");

// Util
const constants = require("../../util/constants");
const wbManufacturingOrderRequisitionTableName = require("../../util/database-tables-name").wbManufacturingOrderRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");
const { wbManufacturingOrderRequisitionDetailsTableName, wdDyeingOrderRequisitionDetailsTableName } = require("../../util/database-tables-name");

exports.create = async (wbManufacturingOrderRequisition) => {
    wbManufacturingOrderRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wbManufacturingOrderRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wbManufacturingOrderRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wbManufacturingOrderRequisitionQueries.selectOne({ number: wbManufacturingOrderRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wbManufacturingOrderRequisitionQueries.insert(wbManufacturingOrderRequisition);
    if (results) {
        return await wbManufacturingOrderRequisitionDetailsService.create(wbManufacturingOrderRequisition);
    } else {
        return constants.insertError;
    }
};

exports.selectOpenedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${wbManufacturingOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 1

    const results = await wbManufacturingOrderRequisitionQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await wbManufacturingOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrder(element.id);
        }
    }
    return results;
  };
  
exports.selectClosedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${wbManufacturingOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 0

    const results = await wbManufacturingOrderRequisitionQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await wbManufacturingOrderRequisitionDetailsService.selectByRequisitionIdClosedOrder(element.id);
        }
    }
    return results;
  };
  
  exports.closedOrderByRequisition = async (requisitionId) => {

    let result = false
    let whereCluse = {};
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.wb_manufacturing_order_requisition_id`] = requisitionId;
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_order`] = 1;

    const selectOpenedOrderResults = await wbManufacturingOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
    if(selectOpenedOrderResults[0] != null) {
        for (let i = 0; i < selectOpenedOrderResults.length; i++) {
            const selectOpenedOrderResult = selectOpenedOrderResults[i];

            // close requisition details order
            let wbManufacturingOrderRequisitionDetailsWhereCluse = {};
            wbManufacturingOrderRequisitionDetailsWhereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.id`] = selectOpenedOrderResult.id;
            await wbManufacturingOrderRequisitionDetailsQueries.update({
                is_order : 0
            }, 
            wbManufacturingOrderRequisitionDetailsWhereCluse)
        }

        // close requisition order
        let wbManufacturingOrderRequisitionWhereCluse = {};
        wbManufacturingOrderRequisitionWhereCluse[`${wbManufacturingOrderRequisitionTableName}.id`] = requisitionId;
        const wbManufacturingOrderRequisitionResult = await wbManufacturingOrderRequisitionQueries.update({
            is_order : 0
        },
        wbManufacturingOrderRequisitionWhereCluse)
        if(wbManufacturingOrderRequisitionResult) {
            result = constants.updateSuccess
        } else {
            result = constants.updateError
        }
    } else {
        result = constants.invalidDataResponse
    }
    return result
}


exports.inquireFabricsByDyeingOrderForOrderWb = async (dyeingOrderRequisitionId) => {
    let data = []

    let whereCluse = {};
        whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${wdDyeingOrderRequisitionDetailsTableName}.is_order`] = 1;

        let dyeingOrderRequisitions = await wdDyeingOrderRequisitionDetailsQueries.selectByRequisitionIds(whereCluse, [dyeingOrderRequisitionId])

    for (let i = 0; i < dyeingOrderRequisitions.length; i++) {
        const element = dyeingOrderRequisitions[i];
        
        let result = await wbReportService.inquireFabricsByDyeingOrderForOrderWb(element)

        if(data.length > 0) {
            data = [...result, ...data]
        } else {
            data = result
        }

    }

    let resultData = await this.filterOrderYarnsArray(data, dyeingOrderRequisitions)

    if (Array.isArray(resultData) && resultData.length > 0) {
        resultData[0].dyeingOrderRequisition = dyeingOrderRequisitions[0]
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