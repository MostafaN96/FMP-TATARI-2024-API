// Services
const wdDyeingOrderRequisitionDetailsService = require("./wd-dyeing-order-requisition-details");
const wdsettlingFormService = require("./wd-settling-form");
const ordersRequisitionsService = require("../general/orders-requisitions");

// Queries
const wdDyeingOrderRequisitionQueries = require("../../db/queries/wd/wd-dyeing-order-requisition");
const wdFormDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-form-dyeing-requisition-details");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");

// Helper
const trans = require("../../helpers/transform");
const { wdDyeingOrderRequisitionTableName, wdFormDyeingRequisitionDetailsTableName } = require("../../util/database-tables-name");

exports.create = async (wdDyeingOrderRequisition) => {
    wdDyeingOrderRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wdDyeingOrderRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wdDyeingOrderRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wdDyeingOrderRequisitionQueries.selectOne({ number: wdDyeingOrderRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wdDyeingOrderRequisitionQueries.insert(wdDyeingOrderRequisition);
    if (results) {
        return await wdDyeingOrderRequisitionDetailsService.create(wdDyeingOrderRequisition);
    } else {
        return constants.insertError;
    }
};

exports.selectOpenedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${wdDyeingOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wdDyeingOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 1

    const results = await wdDyeingOrderRequisitionQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await wdDyeingOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrder(element.id);
            element.yarnOrders = await ordersRequisitionsService.selectByDyeingIdForYarnOrder(element.id);
        }
    }
    return results;
  };
  
exports.selectClosedOrders = async () => {
    let whereCluse = {};
    whereCluse[`${wdDyeingOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wdDyeingOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 0

    const results = await wdDyeingOrderRequisitionQueries.select(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await wdDyeingOrderRequisitionDetailsService.selectByRequisitionIdClosedOrder(element.id);
        }
    }
    return results;
  };
  
exports.closedOrderByRequisition = async (requisitionId) => {

    let result = false
    const selectOpenedOrderResults = await wdDyeingOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrder(requisitionId);
    if(selectOpenedOrderResults[0] != null) {
        for (let i = 0; i < selectOpenedOrderResults.length; i++) {
            const selectOpenedOrderResult = selectOpenedOrderResults[i];

            const selectFormDyeingRequisitionResults = await wdDyeingOrderRequisitionDetailsService.selectFormDyeingRequisitionDetailsByFormDyeingOrderDetails(selectOpenedOrderResult.id)
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
                                        await wdDyeingOrderRequisitionDetailsService.closeOrder(selectOpenedOrderResult.id)
                                        result = true
                                    } else {
                                        result = constants.updateError
                                    }
                                } else {
                                    result = settlingFormResult
                                    break;
                                }
                        } else {
                            await wdDyeingOrderRequisitionDetailsService.closeOrder(selectOpenedOrderResult.id)
                        }
                    }
                }
            } else {
                await wdDyeingOrderRequisitionDetailsService.closeOrder(selectOpenedOrderResult.id)
            }
        }
    } else {
        result = constants.invalidDataResponse
    }
    return result;
  };
  