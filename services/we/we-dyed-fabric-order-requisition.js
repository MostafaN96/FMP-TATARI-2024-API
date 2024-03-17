// Services
const weDyedFabricOrderRequisitionDetailsService = require("./we-dyed-fabric-order-requisition-details");
const ordersRequisitionsService = require("../general/orders-requisitions");

// Queries
const weDyedFabricOrderRequisitionQueries = require("../../db/queries/we/we-dyed-fabric-order-requisition");
const weDyedFabricOrderRequisitionDetailsQueries = require("../../db/queries/we/we-dyed-fabric-order-requisition-details");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");

// Helper
const trans = require("../../helpers/transform");
const { weDyedFabricOrderRequisitionTableName, weDyedFabricOrderRequisitionDetailsTableName } = require("../../util/database-tables-name");

exports.create = async (weDyedFabricOrderRequisition) => {
    weDyedFabricOrderRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(weDyedFabricOrderRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    weDyedFabricOrderRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await weDyedFabricOrderRequisitionQueries.selectOne({ number: weDyedFabricOrderRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await weDyedFabricOrderRequisitionQueries.insert(weDyedFabricOrderRequisition);
    if (results) {
        return await weDyedFabricOrderRequisitionDetailsService.create(weDyedFabricOrderRequisition);
    } else {
        return constants.insertError;
    }
};

exports.selectOpenedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${weDyedFabricOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${weDyedFabricOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 1

    const results = await weDyedFabricOrderRequisitionQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await weDyedFabricOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrder(element.id);
            element.yarnOrders = await ordersRequisitionsService.selectByDyeingIdForYarnOrder(element.id);
        }
    }
    return results;
  };
  
exports.selectClosedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${weDyedFabricOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${weDyedFabricOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 0

    const results = await weDyedFabricOrderRequisitionQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await weDyedFabricOrderRequisitionDetailsService.selectByRequisitionIdClosedOrder(element.id);
        }
    }
    return results;
  };
  
exports.closedOrderByRequisition = async (requisitionId) => {

    let result = false
    const selectOpenedOrderResults = await weDyedFabricOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrder(requisitionId);
    if(selectOpenedOrderResults[0] != null) {
        for (let i = 0; i < selectOpenedOrderResults.length; i++) {
            const selectOpenedOrderResult = selectOpenedOrderResults[i];

            const selectFormDyeingRequisitionResults = await weDyedFabricOrderRequisitionDetailsService.selectFormDyeingRequisitionDetailsByFormDyeingOrderDetails(selectOpenedOrderResult.id)
            if(selectFormDyeingRequisitionResults[0] != null) {
                for (let j = 0; j < selectFormDyeingRequisitionResults.length; j++) {
                    const selectFormDyeingRequisitionResult = selectFormDyeingRequisitionResults[j];
                    
                    const selectFormDyeingRequisitionDetailsOneResult = await wdFormDyeingRequisitionDetailsQueries.selectOne({ 
                        "wd_form_dyeing_requisition_details.id": selectFormDyeingRequisitionResult.wd_form_dyeing_requisition_details_id
                    })
                    if(selectFormDyeingRequisitionDetailsOneResult[0] != null) {
                        let formCurrentQuantity = selectFormDyeingRequisitionDetailsOneResult[0].current_quantity
                        if(formCurrentQuantity > 0) {
                            const settlingFormResult = await wdsettlingFormService.settlingFormByOrder({
                                wdFormDyeingRequisitionDetailsId: selectFormDyeingRequisitionResult.wd_form_dyeing_requisition_details_id
                                })
                                if(typeof(settlingFormResult) == "boolean") {
                                    if(settlingFormResult) {
                                        await weDyedFabricOrderRequisitionDetailsService.closeOrder(selectOpenedOrderResult.id)
                                        result = true
                                    } else {
                                        result = constants.updateError
                                    }
                                } else {
                                    result = settlingFormResult
                                    break;
                                }
                        } else {
                            await weDyedFabricOrderRequisitionDetailsService.closeOrder(selectOpenedOrderResult.id)
                        }
                    }
                }
            } else {
                await weDyedFabricOrderRequisitionDetailsService.closeOrder(selectOpenedOrderResult.id)
            }
        }
    } else {
        result = constants.invalidDataResponse
    }
    return result;
  };
  
  exports.selectDyedFabricsOrderRequisition = async (requisitionId) => {

    let whereCluse = {};
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`] = requisitionId;
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

    let weDyedFabricOrderRequisitionDetailsResult = await weDyedFabricOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse)
    if (Array.isArray(weDyedFabricOrderRequisitionDetailsResult) && weDyedFabricOrderRequisitionDetailsResult.length > 0) {
        return weDyedFabricOrderRequisitionDetailsResult
    } else {
        return constants.invalidDataResponse
    }
   
}