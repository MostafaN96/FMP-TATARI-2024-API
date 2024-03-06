// Queries
const wbTransitionBetweenIndustriesRequisitionDetailsWbQueries = require("../../db/queries/wb/wb-transition-between-industries-requisition-details-wb");
const wbTransitionBetweenIndustriesRequisitionDetailsQueries = require("../../db/queries/wb/wb-transition-between-industries-requisition-details");
const wbTransitionBetweenIndustriesRequisitionQueries = require("../../db/queries/wb/wb-transition-between-industries-requisition");
const wbQueries = require("../../db/queries/wb/wb");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");

// Services
const wbTransitionBetweenIndustriesRequisitionDetailsWbService = require("./wb-transition-between-industries-requisition-details-wb");
const wbService = require("./wb");
const { wbTransportWaWbTableName, wbTransitionBetweenIndustriesRequisitionDetailsTableName, wbTransitionBetweenIndustriesRequisitionDetailsWbTableName } = require("../../util/database-tables-name");

exports.create = async (wbTransitionBetweenIndustriesRequisitionDetails) => {

    for (let i = 0; i < wbTransitionBetweenIndustriesRequisitionDetails.items.length; i++) {
        wbTransitionBetweenIndustriesRequisitionDetails.wbId = trans.transform();

        wbTransitionBetweenIndustriesRequisitionDetails.items[i].wbTransitionBetweenIndustriesRequisitionDetailsId = trans.transform();

        const results = await wbTransitionBetweenIndustriesRequisitionDetailsQueries.insert(wbTransitionBetweenIndustriesRequisitionDetails, wbTransitionBetweenIndustriesRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            let newQuantity = parseFloat(wbTransitionBetweenIndustriesRequisitionDetails.items[i].quantity)

            // select wb for decrement current quantity
            const yarnsStoredInWbResult = await wbService.selectRecordsByIndustryByYarnByYarnLot(
                wbTransitionBetweenIndustriesRequisitionDetails.fromIndustryId,
                wbTransitionBetweenIndustriesRequisitionDetails.items[i].yarnId,
                wbTransitionBetweenIndustriesRequisitionDetails.items[i].yarnLotId,
                wbTransitionBetweenIndustriesRequisitionDetails.items[i].consigmentYarnId)
            if (yarnsStoredInWbResult[0] != null) {

                for (let j = 0; j < yarnsStoredInWbResult.length; j++) {
                    const yarnStoredInWb = yarnsStoredInWbResult[j];
                    let currentQuantity = yarnStoredInWb.current_quantity
                    let updatedQuantity = 0

                    // decrement Wa CurrentQuantity
                    let returnedQuantityObj = await wbService.decrementWbCurrentQuantity(newQuantity, currentQuantity, yarnStoredInWb, updatedQuantity);
                    newQuantity = returnedQuantityObj.newQuantity
                    updatedQuantity = returnedQuantityObj.updatedQuantity
                    wbTransitionBetweenIndustriesRequisitionDetails.items[i].wbId = yarnStoredInWb.id
                    wbTransitionBetweenIndustriesRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                    // Add wb Transition Between Industries Requisition Details wb
                    await wbTransitionBetweenIndustriesRequisitionDetailsWbService.create(wbTransitionBetweenIndustriesRequisitionDetails, wbTransitionBetweenIndustriesRequisitionDetails.items[i])

                    // Enter to if condition when stock runs out
                    if (newQuantity == 0) {
                        break;
                    }
                }
                // Insert WB
                await wbQueries.insertForTransitionBetween(wbTransitionBetweenIndustriesRequisitionDetails, wbTransitionBetweenIndustriesRequisitionDetails.items[i])
            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: 0,
                    newQuantity: newQuantity
                }
            }

        }
    }
    return { ...constants.insertSuccess, ...{ id: wbTransitionBetweenIndustriesRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wbTransitionBetweenIndustriesRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        const results = await wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (wbTransitionBetweenIndustriesRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`] = wbTransitionBetweenIndustriesRequisitionDetails.id;
    whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        wbTransitionBetweenIndustriesRequisitionDetails.wbTransitionBetweenIndustriesRequisitionId = isFound[0].wb_transition_between_industries_requisition_id

        // Update wb transition between industries requisition Without Quantity
        callArray.push(wbTransitionBetweenIndustriesRequisitionQueries.update({
            date: wbTransitionBetweenIndustriesRequisitionDetails.date,
            note: wbTransitionBetweenIndustriesRequisitionDetails.note
        },
            {
                id: wbTransitionBetweenIndustriesRequisitionDetails.wbTransitionBetweenIndustriesRequisitionId
            }))

        // Update wb transition between industries requisition details Without Quantity
        callArray.push(
            wbTransitionBetweenIndustriesRequisitionDetailsQueries.update({
                price: wbTransitionBetweenIndustriesRequisitionDetails.price,
                document: wbTransitionBetweenIndustriesRequisitionDetails.document,
                statement: wbTransitionBetweenIndustriesRequisitionDetails.statement
            },
                {
                    id: wbTransitionBetweenIndustriesRequisitionDetails.id
                })
        )
        await Promise.all(callArray)

        // let currentQuantity = waCottonResult[0].current_quantity
        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(wbTransitionBetweenIndustriesRequisitionDetails.quantity)
        let defferenceQuantity = 0

        const selectOneWbRecord = await wbQueries.selectOne({
            wb_transition_between_industries_requisition_details_id: wbTransitionBetweenIndustriesRequisitionDetails.id
        })

        if (selectOneWbRecord[0] != null) {

            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                // we will decrement current quantity from store (wa) by following Steps :
                // Step 1 => Check If has current quantity in store (wa)
                const sumCurrentQuantityWb = await wbService.selectSumCurrentQuantityByIndustryByYarnByYarnLotInWb(
                    isFound[0].industry_id,
                    isFound[0].yarn_id,
                    isFound[0].yarn_lot_id,
                    isFound[0].consigment_yarn_id
                )
                if (sumCurrentQuantityWb[0] != null) {
                    console.log("sumCurrentQuantityWb ::: ", sumCurrentQuantityWb);
                    const sumCurrentQuantity = sumCurrentQuantityWb[0].current_quantity
                    if (sumCurrentQuantity >= defferenceQuantity) {

                        // Step 2 => Increment quantity in  wb_transition_between_industries_requisition_details
                        await wbTransitionBetweenIndustriesRequisitionDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity
                        }, {
                            id: wbTransitionBetweenIndustriesRequisitionDetails.id
                        })

                        // Step 3 => select from (WB) Records for decrement current quantity
                        const wbRecords = await wbService.selectRecordsByIndustryByYarnByYarnLot(
                            isFound[0].industry_id,
                            isFound[0].yarn_id,
                            isFound[0].yarn_lot_id,
                            isFound[0].consigment_yarn_id
                        )
                        if (wbRecords[0] != null) {

                            // Increment Wb current_quantity
                            await wbQueries.update({
                                current_quantity: selectOneWbRecord[0].current_quantity + defferenceQuantity
                            }, {
                                id: selectOneWbRecord[0].id
                            })

                            for (let i = 0; i < wbRecords.length; i++) {
                                const wbRecord = wbRecords[i];
                                let currentQuantity = wbRecord.current_quantity
                                let updatedQuantity = 0

                                // decrement wb CurrentQuantity
                                let returnedQuantityObj = await wbService.decrementWbCurrentQuantity(defferenceQuantity, currentQuantity, wbRecord, updatedQuantity);
                                defferenceQuantity = returnedQuantityObj.newQuantity
                                updatedQuantity = returnedQuantityObj.updatedQuantity

                                // Step 4 => Check if wb_id existed in wa_cotton_sell_requisition_details_wa
                                // that has same wb_transition_between_industries_requisition_details_id
                                const isExisitId = await wbTransitionBetweenIndustriesRequisitionDetailsWbService.select({
                                    wb_transition_between_industries_requisition_details_id: wbTransitionBetweenIndustriesRequisitionDetails.id,
                                    wb_id: wbRecord.id
                                })

                                if (isExisitId[0] != null) {
                                    // Step 4.1 => Update Quantity in wb_transition_between_industries_requisition_details_wb
                                    updateResults = await wbTransitionBetweenIndustriesRequisitionDetailsWbQueries.update({
                                        quantity: isExisitId[0].quantity + updatedQuantity
                                    }, {
                                        wb_transition_between_industries_requisition_details_id: wbTransitionBetweenIndustriesRequisitionDetails.id,
                                        wb_id: isExisitId[0].wb_id
                                    })
                                } else {
                                    // Step 4.2 Add Record in wb_transition_between_industries_requisition_details_wb
                                    updateResults = await wbTransitionBetweenIndustriesRequisitionDetailsWbService.create(wbTransitionBetweenIndustriesRequisitionDetails, {
                                        wbTransitionBetweenIndustriesRequisitionDetailsId: wbTransitionBetweenIndustriesRequisitionDetails.id,
                                        wbId: wbRecord.id,
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

                if (selectOneWbRecord[0].current_quantity >= defferenceQuantity) {

                    // Step 1 => Decrement quantity in  wb_transition_between_industries_requisition_details
                    await wbTransitionBetweenIndustriesRequisitionDetailsQueries.update({
                        quantity: oldQuantity - defferenceQuantity
                    }, {
                        id: wbTransitionBetweenIndustriesRequisitionDetails.id
                    })

                    // Decrement wb current_quantity
                    await wbQueries.update({
                        current_quantity: selectOneWbRecord[0].current_quantity - defferenceQuantity
                    }, {
                        id: selectOneWbRecord[0].id
                    })

                    // Step 2 => Select From wb_transition_between_industries_requisition_details_wb Records
                    let whereCluseDetailsWb = {};
                    whereCluseDetailsWb[`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.wb_transition_between_industries_requisition_details_id`] = wbTransitionBetweenIndustriesRequisitionDetails.id;
                    whereCluseDetailsWb[`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.is_deleted`] = 0;
                    whereCluseDetailsWb[`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.is_active`] = 1;
                    const wbTransitionBetweenIndustriesRequisitionDetailsWbRecords = await wbTransitionBetweenIndustriesRequisitionDetailsWbService.selectWithTwoCondition(whereCluseDetailsWb,
                        ["quantity", ">", "0"])
                    if (wbTransitionBetweenIndustriesRequisitionDetailsWbRecords[0] != null) {
                        for (let j = 0; j < wbTransitionBetweenIndustriesRequisitionDetailsWbRecords.length; j++) {
                            const wbTransitionBetweenIndustriesRequisitionDetailsWbRecord = wbTransitionBetweenIndustriesRequisitionDetailsWbRecords[j];
                            let wbTransitionBetweenIndustriesRequisitionDetailsWbQuantity = wbTransitionBetweenIndustriesRequisitionDetailsWbRecord.quantity
                            let updatedQuantity = 0

                            if (wbTransitionBetweenIndustriesRequisitionDetailsWbQuantity >= defferenceQuantity) {
                                // Decrement wb_transition_between_industries_requisition_details_wb quantity
                                await wbTransitionBetweenIndustriesRequisitionDetailsWbQueries.update({
                                    quantity: wbTransitionBetweenIndustriesRequisitionDetailsWbQuantity - defferenceQuantity
                                }, {
                                    wb_transition_between_industries_requisition_details_id: wbTransitionBetweenIndustriesRequisitionDetails.id,
                                    wb_id: wbTransitionBetweenIndustriesRequisitionDetailsWbRecord.wb_id
                                })
                                updatedQuantity = defferenceQuantity
                                defferenceQuantity = 0
                            } else {
                                // Decrement wb_transition_between_industries_requisition_details_wb quantity
                                await wbTransitionBetweenIndustriesRequisitionDetailsWbQueries.update({
                                    quantity: 0
                                }, {
                                    wb_transition_between_industries_requisition_details_id: wbTransitionBetweenIndustriesRequisitionDetails.id,
                                    wb_id: wbTransitionBetweenIndustriesRequisitionDetailsWbRecord.wb_id
                                })
                                updatedQuantity = wbTransitionBetweenIndustriesRequisitionDetailsWbQuantity
                                defferenceQuantity = parseFloat((defferenceQuantity - wbTransitionBetweenIndustriesRequisitionDetailsWbQuantity).toFixed(3))
                            }

                            // select wb record
                            const wbRecord = await wbQueries.selectOne({
                                id: wbTransitionBetweenIndustriesRequisitionDetailsWbRecord.wb_id
                            })
                            if (wbRecord[0] != null) {
                                const oldCurrentQuantity = wbRecord[0].current_quantity

                                // Increment wb current_quantity
                                await wbQueries.update({
                                    current_quantity: oldCurrentQuantity + updatedQuantity
                                }, {
                                    id: wbRecord[0].id
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
                        spentQuantity: selectOneWbRecord[0].current_quantity,
                        newQuantity: defferenceQuantity
                    }
                }
            } else {
                updateResults = true
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


exports.updateDecrement = async (wbTransitionBetweenIndustriesRequisitionDetails) => {

    // Check is found
    let whereCluse = {};
    whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.id`] = wbTransitionBetweenIndustriesRequisitionDetails.requisition_details_id;
    whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wbTransitionBetweenIndustriesRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        wbTransitionBetweenIndustriesRequisitionDetails.fromIndustryId = isFound[0].industry_id

        // let currentQuantity = waCottonResult[0].current_quantity
        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(wbTransitionBetweenIndustriesRequisitionDetails.quantity)
        let defferenceQuantity = 0

        defferenceQuantity = newQuantity

        // Step 1 => Decrement quantity in  wb_transition_between_industries_requisition_details
        await wbTransitionBetweenIndustriesRequisitionDetailsQueries.update({
            quantity: oldQuantity - defferenceQuantity
        }, {
            id: wbTransitionBetweenIndustriesRequisitionDetails.requisition_details_id
        })

        // Decrement wb current_quantity
        await wbQueries.update({
            current_quantity: wbTransitionBetweenIndustriesRequisitionDetails.current_quantity - defferenceQuantity
        }, {
            id: wbTransitionBetweenIndustriesRequisitionDetails.wb_id
        })

        // Step 2 => Select From wb_transition_between_industries_requisition_details_wb Records
        let whereCluseDetailsWb = {};
        whereCluseDetailsWb[`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.wb_transition_between_industries_requisition_details_id`] = wbTransitionBetweenIndustriesRequisitionDetails.requisition_details_id;
        whereCluseDetailsWb[`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.is_deleted`] = 0;
        whereCluseDetailsWb[`${wbTransitionBetweenIndustriesRequisitionDetailsWbTableName}.is_active`] = 1;
        const wbTransitionBetweenIndustriesRequisitionDetailsWbRecords = await wbTransitionBetweenIndustriesRequisitionDetailsWbService.selectWithTwoCondition(whereCluseDetailsWb,
            ["quantity", ">", "0"])
        if (wbTransitionBetweenIndustriesRequisitionDetailsWbRecords[0] != null) {
            for (let j = 0; j < wbTransitionBetweenIndustriesRequisitionDetailsWbRecords.length; j++) {
                const wbTransitionBetweenIndustriesRequisitionDetailsWbRecord = wbTransitionBetweenIndustriesRequisitionDetailsWbRecords[j];
                let wbTransitionBetweenIndustriesRequisitionDetailsWbQuantity = wbTransitionBetweenIndustriesRequisitionDetailsWbRecord.quantity
                let updatedQuantity = 0

                if (wbTransitionBetweenIndustriesRequisitionDetailsWbQuantity >= defferenceQuantity) {
                    // Decrement wb_transition_between_industries_requisition_details_wb quantity
                    await wbTransitionBetweenIndustriesRequisitionDetailsWbQueries.update({
                        quantity: wbTransitionBetweenIndustriesRequisitionDetailsWbQuantity - defferenceQuantity
                    }, {
                        wb_transition_between_industries_requisition_details_id: wbTransitionBetweenIndustriesRequisitionDetails.requisition_details_id,
                        wb_id: wbTransitionBetweenIndustriesRequisitionDetailsWbRecord.wb_id
                    })
                    updatedQuantity = defferenceQuantity
                    defferenceQuantity = 0
                } else {
                    // Decrement wb_transition_between_industries_requisition_details_wb quantity
                    await wbTransitionBetweenIndustriesRequisitionDetailsWbQueries.update({
                        quantity: 0
                    }, {
                        wb_transition_between_industries_requisition_details_id: wbTransitionBetweenIndustriesRequisitionDetails.requisition_details_id,
                        wb_id: wbTransitionBetweenIndustriesRequisitionDetailsWbRecord.wb_id
                    })
                    updatedQuantity = wbTransitionBetweenIndustriesRequisitionDetailsWbQuantity
                    defferenceQuantity = parseFloat((defferenceQuantity - wbTransitionBetweenIndustriesRequisitionDetailsWbQuantity).toFixed(3))
                }

                // select wb record
                const wbRecord = await wbQueries.selectOne({
                    id: wbTransitionBetweenIndustriesRequisitionDetailsWbRecord.wb_id
                })
                if (wbRecord[0] != null) {
                    const oldCurrentQuantity = wbRecord[0].current_quantity

                    // Increment wb current_quantity
                    await wbQueries.update({
                        current_quantity: oldCurrentQuantity + updatedQuantity
                    }, {
                        id: wbRecord[0].id
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

        if (updateResults) {
            return updateResults;
        } else {
            return updateResults;
        }

    } else {
        return updateResults;
    }
};