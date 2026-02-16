// Queries
const wdFormDyeingRequisitionDetailsWdQueries = require("../../db/queries/wd/wd-form-dyeing-requisition-details-wd");
const wdFormDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-form-dyeing-requisition-details");
const wdFormDyeingRequisitionQueries = require("../../db/queries/wd/wd-form-dyeing-requisition");
const wdDyeingOrderRequisitionDetailsQueries = require("../../db/queries/wd/wd-dyeing-order-requisition-details");
const wdFormOrderDetailsWdFormDetailsQueries = require("../../db/queries/wd/wd-form-order-details-wd-form-details");
const wdQueries = require("../../db/queries/wd/wd");

// Services
const wdService = require("./wd");
const wdFormDyeingRequisitionDetailsWdService = require("./wd-form-dyeing-requisition-details-wd");
const wdFormDyeingRequisitionDetailsDyeingServicesService = require("./wd-form-dyeing-requisition-details-dyeing-services");
const wcFabricOrderRequisitionDetailsService = require("../wc/wc-fabric-order-requisition-details");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { 
    wdFormDyeingRequisitionDetailsTableName, 
    wdFormDyeingRequisitionDetailsWdTableName, 
    wcFabricOrderRequisitionDetailsTableName
} = require("../../util/database-tables-name");

exports.create = async (wdFormDyeingRequisitionDetails) => {
    for (let i = 0; i < wdFormDyeingRequisitionDetails.items.length; i++) {
        wdFormDyeingRequisitionDetails.items[i].wdFormDyeingRequisitionDetailsId = trans.transform();

        // Get fabric order requisitions details id
        let fabricOrderRequisitionDetailsWhereCluse = {};
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.wc_fabric_order_requisition_id`] = wdFormDyeingRequisitionDetails.items[i].fabricOrderId;
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.fabric_id`] = wdFormDyeingRequisitionDetails.items[i].fabricId;
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        const selectFabricOrderRequisitionDetailsResult = await wcFabricOrderRequisitionDetailsService.selectOne(fabricOrderRequisitionDetailsWhereCluse)
        if (Array.isArray(selectFabricOrderRequisitionDetailsResult) && selectFabricOrderRequisitionDetailsResult.length > 0) {
            wdFormDyeingRequisitionDetails.items[i].wcFabricOrderRequisitionDetailsId = selectFabricOrderRequisitionDetailsResult[0].id

        const results = await wdFormDyeingRequisitionDetailsQueries.insert(wdFormDyeingRequisitionDetails, wdFormDyeingRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            let newQuantity = parseFloat(wdFormDyeingRequisitionDetails.items[i].quantity)

            // select Wd for decrement current quantity
            const fabricsStoredInWdResult = await wdService.selectRecordsByDyeingByFabricByConsigmentDyeing(
                wdFormDyeingRequisitionDetails.dyeingId,
                wdFormDyeingRequisitionDetails.items[i].fabricId,
                wdFormDyeingRequisitionDetails.items[i].consigmentDyeingId,
                wdFormDyeingRequisitionDetails.items[i].fabricOrderId
            )
            if (fabricsStoredInWdResult[0] != null) {

                for (let j = 0; j < fabricsStoredInWdResult.length; j++) {
                    const fabricStoredInWd = fabricsStoredInWdResult[j];
                    let currentQuantity = fabricStoredInWd.current_quantity
                    let updatedQuantity = 0

                    // decrement wd CurrentQuantity
                    let returnedQuantityObj = await wdService.decrementWdCurrentQuantity(newQuantity, currentQuantity, fabricStoredInWd, updatedQuantity);
                    newQuantity = returnedQuantityObj.newQuantity
                    updatedQuantity = returnedQuantityObj.updatedQuantity
                    wdFormDyeingRequisitionDetails.items[i].wdId = fabricStoredInWd.id
                    wdFormDyeingRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                    // Add wdFormDyeingRequisitionDetailsWd
                    await wdFormDyeingRequisitionDetailsWdService.create(wdFormDyeingRequisitionDetails, wdFormDyeingRequisitionDetails.items[i])

                    // Enter to if condition when stock runs out
                    if (newQuantity == 0) {
                        break;
                    }
                }

                // Add Dyeing Services
                for (let k = 0; k < wdFormDyeingRequisitionDetails.items[i].dyeingServices.length; k++) {
                    const dyeingService = wdFormDyeingRequisitionDetails.items[i].dyeingServices[k];

                    // Add wd_form_dyeing_requisition_details_dyeing_services
                    await wdFormDyeingRequisitionDetailsDyeingServicesService.create(wdFormDyeingRequisitionDetails, wdFormDyeingRequisitionDetails.items[i], dyeingService[0])

                }

            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: 0,
                    newQuantity: newQuantity
                }
            }

        }
    } else {

    }
    } 
    return { ...constants.insertSuccess, ...{ id: wdFormDyeingRequisitionDetails.id } };
};


exports.createForOrder = async (wdFormDyeingRequisitionDetails) => {
    for (let i = 0; i < wdFormDyeingRequisitionDetails.items.length; i++) {
        wdFormDyeingRequisitionDetails.items[i].wdFormDyeingRequisitionDetailsId = trans.transform();

        const results = await wdFormDyeingRequisitionDetailsQueries.insert(wdFormDyeingRequisitionDetails, wdFormDyeingRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            // add in wd_form_order_details_wd_form_details
            const wdFormOrderDetailsWdFormDetailsResult = await wdFormOrderDetailsWdFormDetailsQueries.insert(wdFormDyeingRequisitionDetails, wdFormDyeingRequisitionDetails.items[i]);

            if (wdFormOrderDetailsWdFormDetailsResult) {
                let newQuantity = parseFloat(wdFormDyeingRequisitionDetails.items[i].quantity)
                let newQuantityFixed = parseFloat(wdFormDyeingRequisitionDetails.items[i].quantity)

                // select Wd for decrement current quantity
                const fabricsStoredInWdResult = await wdService.selectRecordsByDyeingByFabricByConsigmentDyeing(
                    wdFormDyeingRequisitionDetails.dyeingId,
                    wdFormDyeingRequisitionDetails.items[i].fabricId,
                    wdFormDyeingRequisitionDetails.items[i].consigmentDyeingId)
                if (fabricsStoredInWdResult[0] != null) {

                    for (let j = 0; j < fabricsStoredInWdResult.length; j++) {
                        const fabricStoredInWd = fabricsStoredInWdResult[j];
                        let currentQuantity = fabricStoredInWd.current_quantity
                        let updatedQuantity = 0

                        // decrement wd CurrentQuantity
                        let returnedQuantityObj = await wdService.decrementWdCurrentQuantity(newQuantity, currentQuantity, fabricStoredInWd, updatedQuantity);
                        newQuantity = returnedQuantityObj.newQuantity
                        updatedQuantity = returnedQuantityObj.updatedQuantity
                        wdFormDyeingRequisitionDetails.items[i].wdId = fabricStoredInWd.id
                        wdFormDyeingRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                        // Add wdFormDyeingRequisitionDetailsWd
                        await wdFormDyeingRequisitionDetailsWdService.create(wdFormDyeingRequisitionDetails, wdFormDyeingRequisitionDetails.items[i])

                        // Enter to if condition when stock runs out
                        if (newQuantity == 0) {
                            break;
                        }
                    }

                    // Add Dyeing Services
                    for (let k = 0; k < wdFormDyeingRequisitionDetails.items[i].dyeingServices.length; k++) {
                        const dyeingService = wdFormDyeingRequisitionDetails.items[i].dyeingServices[k];

                        // Add wd_form_dyeing_requisition_details_dyeing_services
                        await wdFormDyeingRequisitionDetailsDyeingServicesService.create(wdFormDyeingRequisitionDetails, wdFormDyeingRequisitionDetails.items[i], dyeingService[0])

                    }

                    // decrement form_current_quantity
                    // Step (1) select record of order
                    const selectOneDyeingOrder = await wdDyeingOrderRequisitionDetailsQueries.selectOne({
                        id: wdFormDyeingRequisitionDetails.items[i].wdFormDyeingOrderRequisitionDetailsId
                    })
                    if (selectOneDyeingOrder[0] != null) {
                        let orderQuantity = selectOneDyeingOrder[0].quantity
                        let orderFormCurrentQuantity = selectOneDyeingOrder[0].form_current_quantity
                        let orderDyeingCurrentQuantity = selectOneDyeingOrder[0].dyeing_current_quantity
                        let deferenceQuantityOrderCurentQuantity = newQuantityFixed - orderFormCurrentQuantity

                        if (deferenceQuantityOrderCurentQuantity > orderFormCurrentQuantity) {
                            await wdDyeingOrderRequisitionDetailsQueries.update({
                                quantity: orderQuantity + deferenceQuantityOrderCurentQuantity,
                                form_current_quantity: (orderFormCurrentQuantity + deferenceQuantityOrderCurentQuantity) - newQuantityFixed,
                                dyeing_current_quantity: orderDyeingCurrentQuantity + deferenceQuantityOrderCurentQuantity
                            }, {
                                id: wdFormDyeingRequisitionDetails.items[i].wdFormDyeingOrderRequisitionDetailsId
                            })
                        } else {
                            await wdDyeingOrderRequisitionDetailsQueries.update({
                                form_current_quantity: orderFormCurrentQuantity - newQuantityFixed,
                            }, {
                                id: wdFormDyeingRequisitionDetails.items[i].wdFormDyeingOrderRequisitionDetailsId
                            })
                        }
                        // Step (2) decrement form_current_quantity
                        await wdDyeingOrderRequisitionDetailsQueries.update({
                            form_current_quantity: orderFormCurrentQuantity - newQuantityFixed
                        }, {
                            id: wdFormDyeingRequisitionDetails.items[i].wdFormDyeingOrderRequisitionDetailsId
                        })
                    }

                } else {
                    return {
                        ...constants.wrongQuantity,
                        spentQuantity: 0,
                        newQuantity: newQuantity
                    }
                }
            } else {
                return constants.insertError;
            }


        }
    }
    return { ...constants.insertSuccess, ...{ id: wdFormDyeingRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wdFormDyeingRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        const results = await wdFormDyeingRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                element.fabricOrderRequisitions = await wdService.selectRequisitionsForWcFabricOrderRequisition(
                    element.id
                )
            }
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByRequisitionIds = async (requisitionIds = []) => {
        const results = await wdFormDyeingRequisitionDetailsQueries.selectByRequisitionIds(requisitionIds);
        if (Array.isArray(results) && results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                element.fabricOrderRequisitions = await wdService.selectRequisitionsForWcFabricOrderRequisition(
                    element.id
                )
            }
        }

        const map = {};
  for (const d of results) {
    if (!map[d.requisition_id]) {
      map[d.requisition_id] = [];
    }
    map[d.requisition_id].push(d);
  }

  return map;
};

exports.selectBy = async (whereCluse) => {
        const results = await wdFormDyeingRequisitionDetailsQueries.selectBy(whereCluse);
        return results;
};

exports.selectByDyeing = async (dyeingId) => {

    const results = await wdFormDyeingRequisitionDetailsQueries.selectByDyeing(dyeingId);
    return results;
};

exports.selectOrderByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wdFormDyeingRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await wdFormDyeingRequisitionDetailsQueries.selectOrderByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (wdFormDyeingRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.id`] = wdFormDyeingRequisitionDetails.id;
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wdFormDyeingRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        wdFormDyeingRequisitionDetails.wdFormDyeingRequisitionId = isFound[0].wd_form_dyeing_requisition_id

        // Update wd_form_dyeing_requisition Without Quantity
        callArray.push(wdFormDyeingRequisitionQueries.update({
            dyeing_id: wdFormDyeingRequisitionDetails.dyeingId,
            date: wdFormDyeingRequisitionDetails.date,
            note: wdFormDyeingRequisitionDetails.note,
            work_order_number: wdFormDyeingRequisitionDetails.workOrderNumber
        },
            {
                id: wdFormDyeingRequisitionDetails.wdFormDyeingRequisitionId
            }))


        // Update wd_form_dyeing_requisition_details Without Quantity
        callArray.push(
            wdFormDyeingRequisitionDetailsQueries.update({
                dyeing_colors_prices_id: wdFormDyeingRequisitionDetails.dyeingColorsPricesId,
                price: wdFormDyeingRequisitionDetails.price,
                price_dollar: wdFormDyeingRequisitionDetails.priceDollar,
                fabric_width: wdFormDyeingRequisitionDetails.fabricWidth,
                fabric_quantity_m2: wdFormDyeingRequisitionDetails.fabricQuantityM2,
                document: wdFormDyeingRequisitionDetails.document,
                statement: wdFormDyeingRequisitionDetails.statement,
                is_prepare_dyeing: wdFormDyeingRequisitionDetails.isPrepareDyeing,
                work_order_number: wdFormDyeingRequisitionDetails.workOrderNumberDetails
            },
                {
                    id: wdFormDyeingRequisitionDetails.id
                })
        )
        await Promise.all(callArray)
        this.updatePreparedDyeing(wdFormDyeingRequisitionDetails)

        // let currentQuantity = wdResult[0].current_quantity
        let oldQuantity = isFound[0].quantity
        let formCurrentQuantity = isFound[0].current_quantity
        let newQuantity = parseFloat(wdFormDyeingRequisitionDetails.quantity)
        let defferenceQuantity = 0

        // Check Quantity
        if (newQuantity > oldQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

            // we will decrement current quantity from store (wa yarn) by following Steps :
            // Step 1 => Check If has current quantity in store (wa yarn)
            const sumCurrentQuantityWd = await wdService.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd(
                isFound[0].dyeing_id, 
                isFound[0].fabric_id, 
                isFound[0].consigment_dyeing_id,
                isFound[0].wc_fabric_order_requisition_id
            )
            if (sumCurrentQuantityWd[0] != null) {
                // console.log("sumCurrentQuantityWd ::: ", sumCurrentQuantityWd);
                const sumCurrentQuantity = sumCurrentQuantityWd[0].current_quantity
                if (sumCurrentQuantity >= defferenceQuantity) {

                    // Step 2 => Increment quantity in  wd_form_dyeing_requisition_details
                    await wdFormDyeingRequisitionDetailsQueries.update({
                        quantity: oldQuantity + defferenceQuantity,
                        current_quantity: formCurrentQuantity + defferenceQuantity
                    }, {
                        id: wdFormDyeingRequisitionDetails.id
                    })

                    // Step 3 => select from (WD) Records for decrement current quantity
                    const wdRecords = await wdService.selectRecordsByDyeingByFabricByConsigmentDyeing(
                        isFound[0].dyeing_id, 
                        isFound[0].fabric_id, 
                        isFound[0].consigment_dyeing_id,
                        isFound[0].wc_fabric_order_requisition_id
                    )
                    if (wdRecords[0] != null) {
                        // console.log("wdRecords ::: ", wdRecords);
                        for (let i = 0; i < wdRecords.length; i++) {
                            const wdRecord = wdRecords[i];
                            let currentQuantity = wdRecord.current_quantity
                            let updatedQuantity = 0

                            // decrement Wd CurrentQuantity
                            let returnedQuantityObj = await wdService.decrementWdCurrentQuantity(defferenceQuantity, currentQuantity, wdRecord, updatedQuantity);
                            defferenceQuantity = returnedQuantityObj.newQuantity
                            updatedQuantity = returnedQuantityObj.updatedQuantity

                            // Step 4 => Check if wd_id existed in wd_form_dyeing_requisition_details_wd
                            // that has same wd_form_dyeing_requisition_details_id
                            const isExisitId = await wdFormDyeingRequisitionDetailsWdService.select({
                                wd_form_dyeing_requisition_details_id: wdFormDyeingRequisitionDetails.id,
                                wd_id: wdRecord.id
                            })

                            if (isExisitId[0] != null) {
                                // Step 4.1 => Update Quantity in wd_form_dyeing_requisition_details_wd
                                updateResults = await wdFormDyeingRequisitionDetailsWdQueries.update({
                                    quantity: isExisitId[0].quantity + updatedQuantity
                                }, {
                                    wd_form_dyeing_requisition_details_id: wdFormDyeingRequisitionDetails.id,
                                    wd_id: isExisitId[0].wd_id
                                })
                            } else {
                                // Step 4.2 Add Record in wd_form_dyeing_requisition_details_wd
                                updateResults = await wdFormDyeingRequisitionDetailsWdService.create(wdFormDyeingRequisitionDetails, {
                                    wdFormDyeingRequisitionDetailsId: wdFormDyeingRequisitionDetails.id,
                                    wdId: wdRecord.id,
                                    updatedQuantity
                                })
                            }

                            // Enter to if condition when stock runs out
                            if (defferenceQuantity == 0) {
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
                        newQuantity: defferenceQuantity
                    }
                }
            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: 0,
                    newQuantity: defferenceQuantity
                }
            }


        } else if (newQuantity < oldQuantity) {
            defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

            if (formCurrentQuantity >= defferenceQuantity) {
                // Step 1 => Decrement quantity in  wd_form_dyeing_requisition_details
                await wdFormDyeingRequisitionDetailsQueries.update({
                    quantity: oldQuantity - defferenceQuantity,
                    current_quantity: formCurrentQuantity - defferenceQuantity
                }, {
                    id: wdFormDyeingRequisitionDetails.id
                })

                // Step 2 => Select From wd_form_dyeing_requisition_details_wd Records
                let whereCluseDetailsWd = {};
                whereCluseDetailsWd[`${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`] = wdFormDyeingRequisitionDetails.id;
                whereCluseDetailsWd[`${wdFormDyeingRequisitionDetailsWdTableName}.is_deleted`] = 0;
                whereCluseDetailsWd[`${wdFormDyeingRequisitionDetailsWdTableName}.is_active`] = 1;
                const wdFormDyeingRequisitionDetailsWdRecords = await wdFormDyeingRequisitionDetailsWdService.selectWithTwoCondition(whereCluseDetailsWd,
                    ["quantity", ">", "0"])
                if (wdFormDyeingRequisitionDetailsWdRecords[0] != null) {
                    for (let j = 0; j < wdFormDyeingRequisitionDetailsWdRecords.length; j++) {
                        const wdFormDyeingRequisitionDetailsWdRecord = wdFormDyeingRequisitionDetailsWdRecords[j];
                        let wdFormDyeingRequisitionDetailsWdQuantity = wdFormDyeingRequisitionDetailsWdRecord.quantity
                        let updatedQuantity = 0

                        if (wdFormDyeingRequisitionDetailsWdQuantity >= defferenceQuantity) {
                            // Decrement wd_form_dyeing_requisition_details_wd quantity
                            await wdFormDyeingRequisitionDetailsWdQueries.update({
                                quantity: wdFormDyeingRequisitionDetailsWdQuantity - defferenceQuantity
                            }, {
                                wd_form_dyeing_requisition_details_id: wdFormDyeingRequisitionDetails.id,
                                wd_id: wdFormDyeingRequisitionDetailsWdRecord.wd_id
                            })
                            updatedQuantity = defferenceQuantity
                            defferenceQuantity = 0
                        } else {
                            // Decrement wd_form_dyeing_requisition_details_wd quantity
                            await wdFormDyeingRequisitionDetailsWdQueries.update({
                                quantity: 0
                            }, {
                                wd_form_dyeing_requisition_details_id: wdFormDyeingRequisitionDetails.id,
                                wd_id: wdFormDyeingRequisitionDetailsWdRecord.wd_id
                            })
                            updatedQuantity = wdFormDyeingRequisitionDetailsWdQuantity
                            defferenceQuantity = parseFloat((defferenceQuantity - wdFormDyeingRequisitionDetailsWdQuantity).toFixed(3))
                        }

                        // select wd record
                        const wdRecord = await wdQueries.selectOne({
                            id: wdFormDyeingRequisitionDetailsWdRecord.wd_id
                        })
                        if (wdRecord[0] != null) {
                            const oldCurrentQuantity = wdRecord[0].current_quantity

                            // Increment wd current_quantity
                            await wdQueries.update({
                                current_quantity: oldCurrentQuantity + updatedQuantity
                            }, {
                                id: wdRecord[0].id
                            })
                        }

                        if (defferenceQuantity == 0) {
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
                    spentQuantity: formCurrentQuantity,
                    newQuantity: defferenceQuantity
                }
            }
        } else {
            updateResults = true
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

exports.updateByOrder = async (wdFormDyeingRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.id`] = wdFormDyeingRequisitionDetails.id;
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wdFormDyeingRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        const selectwdFormOrderDetailsWdFormDetailsOneResult = await wdFormOrderDetailsWdFormDetailsQueries.selectOne({
            wd_form_dyeing_requisition_details_id: wdFormDyeingRequisitionDetails.id
        })

        const selectWdDyeingOrderRequisitionDetailsOneResult = await wdDyeingOrderRequisitionDetailsQueries.selectOne({
            id: selectwdFormOrderDetailsWdFormDetailsOneResult[0].wd_form_dyeing_order_requisition_details_id
        })

        wdFormDyeingRequisitionDetails.wdFormDyeingRequisitionId = isFound[0].wd_form_dyeing_requisition_id

        // Update wd_form_dyeing_requisition Without Quantity
        callArray.push(wdFormDyeingRequisitionQueries.update({
            dyeing_id: wdFormDyeingRequisitionDetails.dyeingId,
            date: wdFormDyeingRequisitionDetails.date,
            note: wdFormDyeingRequisitionDetails.note,
            work_order_number: wdFormDyeingRequisitionDetails.workOrderNumber
        },
            {
                id: wdFormDyeingRequisitionDetails.wdFormDyeingRequisitionId
            }))


        // Update wd_form_dyeing_requisition_details Without Quantity
        callArray.push(
            wdFormDyeingRequisitionDetailsQueries.update({
                dyeing_colors_prices_id: wdFormDyeingRequisitionDetails.dyeingColorsPricesId,
                price: wdFormDyeingRequisitionDetails.price,
                price_dollar: wdFormDyeingRequisitionDetails.priceDollar,
                fabric_width: wdFormDyeingRequisitionDetails.fabricWidth,
                fabric_quantity_m2: wdFormDyeingRequisitionDetails.fabricQuantityM2,
                document: wdFormDyeingRequisitionDetails.document,
                statement: wdFormDyeingRequisitionDetails.statement,
                is_prepare_dyeing: wdFormDyeingRequisitionDetails.isPrepareDyeing
            },
                {
                    id: wdFormDyeingRequisitionDetails.id
                })
        )
        await Promise.all(callArray)
        this.updatePreparedDyeing(wdFormDyeingRequisitionDetails)

        // let currentQuantity = wdResult[0].current_quantity
        let oldQuantity = isFound[0].quantity
        let formCurrentQuantity = isFound[0].current_quantity
        let newQuantity = parseFloat(wdFormDyeingRequisitionDetails.quantity)
        let defferenceQuantity = 0

        // Check Quantity
        if (newQuantity > oldQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

            // we will decrement current quantity from store (wa yarn) by following Steps :
            // Step 1 => Check If has current quantity in store (wa yarn)
            const sumCurrentQuantityWd = await wdService.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd(
                isFound[0].dyeing_id, isFound[0].fabric_id, isFound[0].consigment_dyeing_id)
            if (sumCurrentQuantityWd[0] != null) {
                console.log("sumCurrentQuantityWd ::: ", sumCurrentQuantityWd);
                const sumCurrentQuantity = sumCurrentQuantityWd[0].current_quantity
                if (sumCurrentQuantity >= defferenceQuantity) {
                    callArray = []

                    // Step 2 => Increment quantity in  wd_form_dyeing_requisition_details
                    callArray.push(await wdFormDyeingRequisitionDetailsQueries.update({
                        quantity: oldQuantity + defferenceQuantity,
                        current_quantity: formCurrentQuantity + defferenceQuantity
                    }, {
                        id: wdFormDyeingRequisitionDetails.id
                    }))

                    // Increment quantity in wd_form_order_details_wd_form_details
                    callArray.push(await wdFormOrderDetailsWdFormDetailsQueries.update({
                        quantity: selectwdFormOrderDetailsWdFormDetailsOneResult[0].quantity + defferenceQuantity
                    }, {
                        wd_form_dyeing_requisition_details_id: wdFormDyeingRequisitionDetails.id,
                        wd_form_dyeing_order_requisition_details_id: selectwdFormOrderDetailsWdFormDetailsOneResult[0].wd_form_dyeing_order_requisition_details_id,
                    }))

                    // Decrement form_current_quantity in wd_form_dyeing_order_requisition_details
                    callArray.push(await wdDyeingOrderRequisitionDetailsQueries.update({
                        form_current_quantity: selectWdDyeingOrderRequisitionDetailsOneResult[0].form_current_quantity - defferenceQuantity
                    }, {
                        id: selectWdDyeingOrderRequisitionDetailsOneResult[0].id,
                    }))
                    await Promise.all(callArray)

                    // Step 3 => select from (WD) Records for decrement current quantity
                    const wdRecords = await wdService.selectRecordsByDyeingByFabricByConsigmentDyeing(isFound[0].dyeing_id, isFound[0].fabric_id, isFound[0].consigment_dyeing_id)
                    if (wdRecords[0] != null) {
                        console.log("wdRecords ::: ", wdRecords);
                        for (let i = 0; i < wdRecords.length; i++) {
                            const wdRecord = wdRecords[i];
                            let currentQuantity = wdRecord.current_quantity
                            let updatedQuantity = 0

                            // decrement Wd CurrentQuantity
                            let returnedQuantityObj = await wdService.decrementWdCurrentQuantity(defferenceQuantity, currentQuantity, wdRecord, updatedQuantity);
                            defferenceQuantity = returnedQuantityObj.newQuantity
                            updatedQuantity = returnedQuantityObj.updatedQuantity

                            // Step 4 => Check if wd_id existed in wd_form_dyeing_requisition_details_wd
                            // that has same wd_form_dyeing_requisition_details_id
                            const isExisitId = await wdFormDyeingRequisitionDetailsWdService.select({
                                wd_form_dyeing_requisition_details_id: wdFormDyeingRequisitionDetails.id,
                                wd_id: wdRecord.id
                            })

                            if (isExisitId[0] != null) {
                                // Step 4.1 => Update Quantity in wd_form_dyeing_requisition_details_wd
                                updateResults = await wdFormDyeingRequisitionDetailsWdQueries.update({
                                    quantity: isExisitId[0].quantity + updatedQuantity
                                }, {
                                    wd_form_dyeing_requisition_details_id: wdFormDyeingRequisitionDetails.id,
                                    wd_id: isExisitId[0].wd_id
                                })
                            } else {
                                // Step 4.2 Add Record in wd_form_dyeing_requisition_details_wd
                                updateResults = await wdFormDyeingRequisitionDetailsWdService.create(wdFormDyeingRequisitionDetails, {
                                    wdFormDyeingRequisitionDetailsId: wdFormDyeingRequisitionDetails.id,
                                    wdId: wdRecord.id,
                                    updatedQuantity
                                })
                            }

                            // Enter to if condition when stock runs out
                            if (defferenceQuantity == 0) {
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
                        newQuantity: defferenceQuantity
                    }
                }
            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: 0,
                    newQuantity: defferenceQuantity
                }
            }


        } else if (newQuantity < oldQuantity) {
            defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

            if (formCurrentQuantity >= defferenceQuantity) {
                callArray = []

                // Step 1 => Decrement quantity in  wd_form_dyeing_requisition_details
                callArray.push(await wdFormDyeingRequisitionDetailsQueries.update({
                    quantity: oldQuantity - defferenceQuantity,
                    current_quantity: formCurrentQuantity - defferenceQuantity
                }, {
                    id: wdFormDyeingRequisitionDetails.id
                }))

                // Decrement quantity in wd_form_order_details_wd_form_details
                callArray.push(await wdFormOrderDetailsWdFormDetailsQueries.update({
                    quantity: selectwdFormOrderDetailsWdFormDetailsOneResult[0].quantity - defferenceQuantity
                }, {
                    wd_form_dyeing_requisition_details_id: wdFormDyeingRequisitionDetails.id,
                    wd_form_dyeing_order_requisition_details_id: selectwdFormOrderDetailsWdFormDetailsOneResult[0].wd_form_dyeing_order_requisition_details_id,
                }))

                // Increment form_current_quantity in wd_form_dyeing_order_requisition_details
                callArray.push(await wdDyeingOrderRequisitionDetailsQueries.update({
                    form_current_quantity: selectWdDyeingOrderRequisitionDetailsOneResult[0].form_current_quantity + defferenceQuantity
                }, {
                    id: selectWdDyeingOrderRequisitionDetailsOneResult[0].id,
                }))
                await Promise.all(callArray)

                // Step 2 => Select From wd_form_dyeing_requisition_details_wd Records
                let whereCluseDetailsWd = {};
                whereCluseDetailsWd[`${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`] = wdFormDyeingRequisitionDetails.id;
                whereCluseDetailsWd[`${wdFormDyeingRequisitionDetailsWdTableName}.is_deleted`] = 0;
                whereCluseDetailsWd[`${wdFormDyeingRequisitionDetailsWdTableName}.is_active`] = 1;
                const wdFormDyeingRequisitionDetailsWdRecords = await wdFormDyeingRequisitionDetailsWdService.selectWithTwoCondition(whereCluseDetailsWd,
                    ["quantity", ">", "0"])
                if (wdFormDyeingRequisitionDetailsWdRecords[0] != null) {
                    for (let j = 0; j < wdFormDyeingRequisitionDetailsWdRecords.length; j++) {
                        const wdFormDyeingRequisitionDetailsWdRecord = wdFormDyeingRequisitionDetailsWdRecords[j];
                        let wdFormDyeingRequisitionDetailsWdQuantity = wdFormDyeingRequisitionDetailsWdRecord.quantity
                        let updatedQuantity = 0

                        if (wdFormDyeingRequisitionDetailsWdQuantity >= defferenceQuantity) {
                            // Decrement wd_form_dyeing_requisition_details_wd quantity
                            await wdFormDyeingRequisitionDetailsWdQueries.update({
                                quantity: wdFormDyeingRequisitionDetailsWdQuantity - defferenceQuantity
                            }, {
                                wd_form_dyeing_requisition_details_id: wdFormDyeingRequisitionDetails.id,
                                wd_id: wdFormDyeingRequisitionDetailsWdRecord.wd_id
                            })
                            updatedQuantity = defferenceQuantity
                            defferenceQuantity = 0
                        } else {
                            // Decrement wd_form_dyeing_requisition_details_wd quantity
                            await wdFormDyeingRequisitionDetailsWdQueries.update({
                                quantity: 0
                            }, {
                                wd_form_dyeing_requisition_details_id: wdFormDyeingRequisitionDetails.id,
                                wd_id: wdFormDyeingRequisitionDetailsWdRecord.wd_id
                            })
                            updatedQuantity = wdFormDyeingRequisitionDetailsWdQuantity
                            defferenceQuantity = parseFloat((defferenceQuantity - wdFormDyeingRequisitionDetailsWdQuantity).toFixed(3))
                        }

                        // select wd record
                        const wdRecord = await wdQueries.selectOne({
                            id: wdFormDyeingRequisitionDetailsWdRecord.wd_id
                        })
                        if (wdRecord[0] != null) {
                            const oldCurrentQuantity = wdRecord[0].current_quantity

                            // Increment wd current_quantity
                            await wdQueries.update({
                                current_quantity: oldCurrentQuantity + updatedQuantity
                            }, {
                                id: wdRecord[0].id
                            })
                        }

                        if (defferenceQuantity == 0) {
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
                    spentQuantity: formCurrentQuantity,
                    newQuantity: defferenceQuantity
                }
            }
        } else {
            updateResults = true
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

exports.updatePreparedDyeing = async (wdFormDyeingRequisitionDetails) => {
    await wdFormDyeingRequisitionQueries.update({
        is_prepare_dyeing: wdFormDyeingRequisitionDetails.isPrepareDyeing
    },
        {
            id: wdFormDyeingRequisitionDetails.wdFormDyeingRequisitionId
        })
    await wdFormDyeingRequisitionDetailsQueries.update({
        is_prepare_dyeing: wdFormDyeingRequisitionDetails.isPrepareDyeing
    },
        {
            wd_form_dyeing_requisition_id: wdFormDyeingRequisitionDetails.wdFormDyeingRequisitionId
        })
}