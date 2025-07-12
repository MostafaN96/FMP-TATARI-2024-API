// Services
const weDyedFabricOrderRequisitionDetailsService = require("./we-dyed-fabric-order-requisition-details");
const ordersRequisitionsService = require("../general/orders-requisitions");
const wdDyeingOrderRequisitionDetailsService = require("../wd/wd-dyeing-order-requisition-details");
const wdFormDyeingRequisitionDetailsService = require("../wd/wd-form-dyeing-requisition-details");
const wdsettlingFormService = require("../wd/wd-settling-form");
const wcFabricOrderRequisitionService = require("../wc/wc-fabric-order-requisition");
const wcFabricOrderRequisitionDetailsService = require("../wc/wc-fabric-order-requisition-details");
const waYarnOrderRequisitionService = require("../wa/wa-yarn-order-requisition");
const waYarnOrderRequisitionDetailsService = require("../wa/wa-yarn-order-requisition-details");

// Queries
const weDyedFabricOrderRequisitionQueries = require("../../db/queries/we/we-dyed-fabric-order-requisition");
const weDyedFabricOrderRequisitionDetailsQueries = require("../../db/queries/we/we-dyed-fabric-order-requisition-details");
const generalQueries = require("../../db/queries/general/general");
const wdFormDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-form-dyeing-requisition-details");

// Util
const constants = require("../../util/constants");

// Helper
const trans = require("../../helpers/transform");
const { weDyedFabricOrderRequisitionTableName, weDyedFabricOrderRequisitionDetailsTableName, wcFabricOrderRequisitionDetailsTableName, waYarnOrderRequisitionDetailsTableName, wdFormDyeingRequisitionDetailsTableName } = require("../../util/database-tables-name");

exports.create = async (weDyedFabricOrderRequisition) => {

    // insert orders requisitions
    const ordersRequisitionsResults = await ordersRequisitionsService.createForDyedFabricOrderwe(weDyedFabricOrderRequisition)
    if (ordersRequisitionsResults) {
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
            element.yarnOrders = await ordersRequisitionsService.selectByDyeingIdForYarnOrder(element.orders_requisitions_id);
            element.fabricOrders = await ordersRequisitionsService.selectByDyeingIdForFabricOrderWc(element.orders_requisitions_id);
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
            element.yarnOrders = await ordersRequisitionsService.selectByDyeingIdForYarnOrder(element.id);
            element.fabricOrders = await ordersRequisitionsService.selectByDyeingIdForFabricOrderWc(element.id);
        }
    }
    return results;
};

exports.selectOpenedOrdersForAddPurchaseWa = async () => {
    let whereCluse = {};
    whereCluse[`${weDyedFabricOrderRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${weDyedFabricOrderRequisitionTableName}.is_active`] = 1;
    const isOrder = 1

    const results = await weDyedFabricOrderRequisitionQueries.selectForAddPurchaseWa(whereCluse, isOrder);
    if (Array.isArray(results) && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
            const element = results[i];

            element.requestionDetails = await weDyedFabricOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrder(element.id);
            element.yarnOrders = await ordersRequisitionsService.selectByDyeingIdForYarnOrder(element.orders_requisitions_id);
            element.fabricOrders = await ordersRequisitionsService.selectByDyeingIdForFabricOrderWc(element.orders_requisitions_id);
        }
    }
    return results;
};

exports.closedOrderByRequisition = async (requisitionId) => {

    let result = false
    const selectOpenedOrderResults = await weDyedFabricOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrder(requisitionId);
    if (selectOpenedOrderResults[0] != null) {
        // console.log("selectOpenedOrderResults :::::::: ", selectOpenedOrderResults);

        // select wc fabric order
        let wcFabricOpenedOrderWhereCluse = {};
        wcFabricOpenedOrderWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        wcFabricOpenedOrderWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        wcFabricOpenedOrderWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;
        wcFabricOpenedOrderWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`] = selectOpenedOrderResults[0].orders_requisitions_id;

        const selectWcFabricOpenedOrderResults = await wcFabricOrderRequisitionDetailsService.selectForCheckOpenedOrderNotExecutedWc(wcFabricOpenedOrderWhereCluse);
        if (Array.isArray(selectWcFabricOpenedOrderResults) && selectWcFabricOpenedOrderResults.length < 1) {
            // console.log("selectWcFabricOpenedOrderResults :::::::: ", selectWcFabricOpenedOrderResults);

            // select wa yarn order
            let waYarnOpenedOrderWhereCluse = {};
            waYarnOpenedOrderWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
            waYarnOpenedOrderWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
            waYarnOpenedOrderWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_order`] = 1;
            waYarnOpenedOrderWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.orders_requisitions_id`] = selectOpenedOrderResults[0].orders_requisitions_id;

            const selectWaYarnOpenedOrderResults = await waYarnOrderRequisitionDetailsService.selectForCheckOpenedOrderNotExecutedWa(waYarnOpenedOrderWhereCluse);
            if (Array.isArray(selectWaYarnOpenedOrderResults) && selectWaYarnOpenedOrderResults.length < 1) {
                // console.log("selectWaYarnOpenedOrderResults :::::::: ", selectWaYarnOpenedOrderResults);

                // ------------------------------------ Start select form dyeing this order ------------------------------------
                // let formDyeingRequisitionWhereCluse = {};
                // formDyeingRequisitionWhereCluse[`${wdFormDyeingRequisitionDetailsTableName}.orders_requisitions_id`] = selectOpenedOrderResults[0].orders_requisitions_id;
                // formDyeingRequisitionWhereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
                // formDyeingRequisitionWhereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;
                // const selectFormDyeingRequisitionResults = await wdFormDyeingRequisitionDetailsService.selectBy(formDyeingRequisitionWhereCluse)
                // for (let i = 0; i < selectFormDyeingRequisitionResults.length; i++) {
                //     const selectFormDyeingRequisitionElement = selectFormDyeingRequisitionResults[i];

                //     const selectFormDyeingRequisitionDetailsOneResult = await wdFormDyeingRequisitionDetailsQueries.selectOne({
                //         "wd_form_dyeing_requisition_details.id": selectFormDyeingRequisitionElement.wd_form_dyeing_requisition_details_id
                //     })
                //     if (selectFormDyeingRequisitionDetailsOneResult[0] != null) {
                //         let formCurrentQuantity = selectFormDyeingRequisitionDetailsOneResult[0].current_quantity
                //         if (formCurrentQuantity > 0) {
                //             const settlingFormResult = await wdsettlingFormService.settlingForm({
                //                 wdFormDyeingRequisitionDetailsId: selectFormDyeingRequisitionElement.wd_form_dyeing_requisition_details_id
                //             })
                //             if (typeof (settlingFormResult) == "boolean") {
                //                 if (settlingFormResult) {
                //                     result = true
                //                 } else {
                //                     result = constants.updateError
                //                 }
                //             } else {
                //                 result = settlingFormResult
                //                 break;
                //             }
                //         } else {
                //             await weDyedFabricOrderRequisitionDetailsService.closeOrder(selectOpenedOrderResult.id)
                //         }
                //     }
                // }
                // ------------------------------------ End select form dyeing this order ------------------------------------

                result = await wcFabricOrderRequisitionService.closedOrderByOrdersRequisitionsId(selectOpenedOrderResults[0].orders_requisitions_id)
                result = await waYarnOrderRequisitionService.closedOrderByOrdersRequisitionsId(selectOpenedOrderResults[0].orders_requisitions_id)
                result = await this.closedOrderByOrdersRequisitionsId(selectOpenedOrderResults[0].orders_requisitions_id)
            }
        }

    } else {
        result = constants.invalidDataResponse
    }
    return result;
};

  exports.closedOrderByOrdersRequisitionsId = async (ordersRequisitionsId) => {

    let result = false
    let whereCluse = {};
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`] = ordersRequisitionsId;
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

    const selectOpenedOrderResults = await weDyedFabricOrderRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
    if(selectOpenedOrderResults[0] != null) {
        for (let i = 0; i < selectOpenedOrderResults.length; i++) {
            const selectOpenedOrderResult = selectOpenedOrderResults[i];

            // close requisition details order
            let weDyedFabricOrderRequisitionDetailsWhereCluse = {};
            weDyedFabricOrderRequisitionDetailsWhereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.id`] = selectOpenedOrderResult.id;
            await weDyedFabricOrderRequisitionDetailsQueries.update({
                is_order : 0
            }, 
            weDyedFabricOrderRequisitionDetailsWhereCluse)
        }
            result = constants.updateSuccess
    } else {
        result = constants.invalidDataResponse
    }
    return result
}

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