// Queries
const weReturnSellRequisitionDetailsQueries = require("../../db/queries/we/we-return-sell-requisition-details");
const weReturnSellRequisitionQueries = require("../../db/queries/we/we-return-sell-requisition");
const weReturnSellRequisitionDetailsReturnDetailsQueries = require("../../db/queries/we/we-return-sell-requisition-details-return-details");
const weReturnSellRequisitionDetailsWeQueries = require("../../db/queries/we/we-return-sell-requisition-details-we");
const weSellRequisitionDetailsQueries = require("../../db/queries/we/we-sell-requisition-details");
const weQueries = require("../../db/queries/we/we");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const weReturnSellRequisitionDetailsReturnDetailsTableName = require("../../util/database-tables-name").weReturnSellRequisitionDetailsReturnDetailsTableName;
const weReturnSellRequisitionDetailsTableName = require("../../util/database-tables-name").weReturnSellRequisitionDetailsTableName;

// Services
const weService = require("./we");
const weSellRequisitionDetailsService = require("./we-sell-requisition-details");
const weReturnSellRequisitionDetailsReturnDetailsService = require("./we-return-sell-requisition-details-return-details");
const { weSellRequisitionDetailsTableName, weTableName, weReturnSellRequisitionDetailsWeTableName } = require("../../util/database-tables-name");

exports.create = async (weReturnSellRequisitionDetails) => {
    // check is found
    const isFound = await weReturnSellRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: weReturnSellRequisitionDetails.id,
    });
    if (isFound[0] != null) {
        weReturnSellRequisitionDetails.sellerId = isFound[0].seller_id

        for (let i = 0; i < weReturnSellRequisitionDetails.items.length; i++) {
            weReturnSellRequisitionDetails.items[i].weReturnSellRequisitionDetailsId = trans.transform();

            const results = await weReturnSellRequisitionDetailsQueries.insert(weReturnSellRequisitionDetails, weReturnSellRequisitionDetails.items[i]);
            if (!results) {
                return constants.insertError;
            } else {
                let newQuantity = parseFloat(weReturnSellRequisitionDetails.items[i].quantity)

                // select we sell requisition details for decrement current quantity
                let weWhereCluse = {}
                weWhereCluse[`${weSellRequisitionDetailsTableName}.id`] = weReturnSellRequisitionDetails.items[i].weSellRequisitionDetailsId
                const fabricsStoredInWeSellRequisitionDetailsResult = await weSellRequisitionDetailsQueries.selectOne(weWhereCluse)
                if (fabricsStoredInWeSellRequisitionDetailsResult[0] != null) {

                    for (let j = 0; j < fabricsStoredInWeSellRequisitionDetailsResult.length; j++) {
                        const fabricStoredInWeSellRequisitionDetails = fabricsStoredInWeSellRequisitionDetailsResult[j];
                        let currentQuantity = fabricStoredInWeSellRequisitionDetails.current_quantity
                        let updatedQuantity = 0

                        // decrement we sell requisition details CurrentQuantity
                        let returnedQuantityObj = await weSellRequisitionDetailsService.decrementWeSellRequisitionDetailsCurrentQuantity(newQuantity, currentQuantity, fabricStoredInWeSellRequisitionDetails, updatedQuantity);
                        newQuantity = returnedQuantityObj.newQuantity
                        updatedQuantity = returnedQuantityObj.updatedQuantity
                        weReturnSellRequisitionDetails.items[i].weSellRequisitionDetailsId = fabricStoredInWeSellRequisitionDetails.id
                        weReturnSellRequisitionDetails.items[i].updatedQuantity = updatedQuantity
                        weReturnSellRequisitionDetails.items[i].weId = fabricStoredInWeSellRequisitionDetails.we_id;

                        // Add we Return Requisition Details sell details
                        await weReturnSellRequisitionDetailsReturnDetailsService.create(weReturnSellRequisitionDetails, weReturnSellRequisitionDetails.items[i])

                        // Add we_return_sell_requisition_details_we
                        await weReturnSellRequisitionDetailsWeQueries.insert(weReturnSellRequisitionDetails, weReturnSellRequisitionDetails.items[i])

                        // select we Record
                        let weWhereCluse = {}
                        weWhereCluse[`${weTableName}.id`] = fabricStoredInWeSellRequisitionDetails.we_id
                        const selectWeRecord = await weQueries.selectOne(weWhereCluse)
                        if(selectWeRecord[0] != null) {
                            // Update we
                            await weQueries.update({
                                current_quantity: selectWeRecord[0].current_quantity + updatedQuantity
                            }, {
                                id: fabricStoredInWeSellRequisitionDetails.we_id
                            })
                        }
                        // Enter to if condition when stock runs out
                        if (newQuantity == 0) {
                            break;
                        }
                    }

                } else {
                    return {
                        ...constants.wrongQuantity,
                        spentQuantity: 0,
                        newQuantity: newQuantity
                    }
                }

            }
        }
        return { ...constants.insertSuccess, ...{ id: weReturnSellRequisitionDetails.id } };
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await weReturnSellRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await weReturnSellRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (weReturnSellRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${weReturnSellRequisitionDetailsTableName}.id`] = weReturnSellRequisitionDetails.id;
    whereCluse[`${weReturnSellRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${weReturnSellRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await weReturnSellRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        let weReturnRequisitionDetailsWeWhereCluse = {}
        weReturnRequisitionDetailsWeWhereCluse[`${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`] = weReturnSellRequisitionDetails.id
        const weReturnSellRequisitionDetailsReturnDetailsSelectOneResult = await weReturnSellRequisitionDetailsReturnDetailsQueries.selectOne(weReturnRequisitionDetailsWeWhereCluse)
        if (weReturnSellRequisitionDetailsReturnDetailsSelectOneResult[0] != null) {
            weReturnSellRequisitionDetails.weReturnSellRequisitionId = isFound[0].we_return_sell_requisition_id

            // select record from we return sell requisition details we
            let weReturnSellWeWhereCluse = {}
            weReturnSellWeWhereCluse[`${weReturnSellRequisitionDetailsWeTableName}.we_return_sell_requisition_details_id`] = weReturnSellRequisitionDetails.id
            const selectOneWeReturnSellWeRecord = await weReturnSellRequisitionDetailsWeQueries.selectOne(weReturnSellWeWhereCluse)
            if (selectOneWeReturnSellWeRecord[0] != null) {

                // select record from we
                let weWhereCluse = {}
                weWhereCluse[`${weTableName}.id`] = selectOneWeReturnSellWeRecord[0].we_id
                const selectOneWeRecord = await weQueries.selectOne(weWhereCluse)
                let weCurrentQuantity = selectOneWeRecord[0].current_quantity

                // Update we return sell requisition Without Quantity
                callArray.push(weReturnSellRequisitionQueries.update({
                    date: weReturnSellRequisitionDetails.date,
                    note: weReturnSellRequisitionDetails.note
                },
                    {
                        id: weReturnSellRequisitionDetails.weReturnSellRequisitionId
                    }))


                // Update we return sell requisition details Without Quantity
                callArray.push(
                    weReturnSellRequisitionDetailsQueries.update({
                        price: weReturnSellRequisitionDetails.price,
                        price_dollar: weReturnSellRequisitionDetails.priceDollar,
                        fabric_piece: weReturnSellRequisitionDetails.numberFabricPieces,
                        is_defect: weReturnSellRequisitionDetails.isDefect,
                        statement: weReturnSellRequisitionDetails.statement
                    },
                        {
                            id: weReturnSellRequisitionDetails.id
                        })
                )
                await Promise.all(callArray)

                // let currentQuantity = waResult[0].current_quantity
                let oldQuantity = isFound[0].quantity
                let newQuantity = parseFloat(weReturnSellRequisitionDetails.quantity)
                let defferenceQuantity = 0

                // Check Quantity
                if (newQuantity > oldQuantity) {
                    defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))


                    // we will decrement current quantity from store (we) by following Steps :
                    // Step 1 => Check If has current quantity in store (we)
                    let weSellRequisitionDetailsWhereCluse = {}
                    weSellRequisitionDetailsWhereCluse[`${weSellRequisitionDetailsTableName}.id`] = weReturnSellRequisitionDetailsReturnDetailsSelectOneResult[0].we_sell_requisition_details_id
                    const selectCurrentQuantityWeSellRequisitionDetails = await weSellRequisitionDetailsQueries.selectOne(weSellRequisitionDetailsWhereCluse)
                    if (selectCurrentQuantityWeSellRequisitionDetails[0] != null) {
                        const sumCurrentQuantity = selectCurrentQuantityWeSellRequisitionDetails[0].current_quantity
                        if (sumCurrentQuantity >= defferenceQuantity) {

                            // update quantity we return sell requisition details we
                            await weReturnSellRequisitionDetailsWeQueries.update({
                                quantity: newQuantity
                            }, {
                                we_return_sell_requisition_details_id: selectOneWeReturnSellWeRecord[0].we_return_sell_requisition_details_id
                            })

                            // update quantity we
                            await weQueries.update({
                                current_quantity: weCurrentQuantity + defferenceQuantity
                            }, {
                                id: selectOneWeRecord[0].id
                            })

                            // Step 2 => Increment quantity in  we_return_sell_requisition_details
                            await weReturnSellRequisitionDetailsQueries.update({
                                quantity: oldQuantity + defferenceQuantity
                            }, {
                                id: weReturnSellRequisitionDetails.id
                            })

                            // Step 3 => select from (we sell requisition details) Records for decrement current quantity
                            let weSellRequisitionDetailsRecordWhereCluse = {}
                            weSellRequisitionDetailsRecordWhereCluse[`${weSellRequisitionDetailsTableName}.id`] = weReturnSellRequisitionDetailsReturnDetailsSelectOneResult[0].we_sell_requisition_details_id
                            const weSellRequisitionDetailsRecords = await weSellRequisitionDetailsQueries.selectOne(weSellRequisitionDetailsRecordWhereCluse)
                            if (weSellRequisitionDetailsRecords[0] != null) {
                                for (let i = 0; i < weSellRequisitionDetailsRecords.length; i++) {
                                    const weSellRequisitionDetailsRecord = weSellRequisitionDetailsRecords[i];
                                    let currentQuantity = weSellRequisitionDetailsRecord.current_quantity
                                    let updatedQuantity = 0

                                    // decrement we sell requisition details CurrentQuantity
                                    let returnedQuantityObj = await weSellRequisitionDetailsService.decrementWeSellRequisitionDetailsCurrentQuantity(defferenceQuantity, currentQuantity, weSellRequisitionDetailsRecord, updatedQuantity);
                                    defferenceQuantity = returnedQuantityObj.newQuantity
                                    updatedQuantity = returnedQuantityObj.updatedQuantity

                                    // Step 4 => Check if sell_requisition_details_id existed in we_return_sell_requisition_details_return_details
                                    // that has same we_return_sell_requisition_details_id
                                    const isExisitId = await weReturnSellRequisitionDetailsReturnDetailsService.select({
                                        we_return_sell_requisition_details_id: weReturnSellRequisitionDetails.id,
                                        we_sell_requisition_details_id: weSellRequisitionDetailsRecord.id
                                    })

                                    if (isExisitId[0] != null) {
                                        // Step 4.1 => Update Quantity in we_return_sell_requisition_details_we
                                        updateResults = await weReturnSellRequisitionDetailsReturnDetailsQueries.update({
                                            quantity: isExisitId[0].quantity + updatedQuantity
                                        }, {
                                            we_return_sell_requisition_details_id: weReturnSellRequisitionDetails.id,
                                            we_sell_requisition_details_id: isExisitId[0].we_sell_requisition_details_id
                                        })
                                    } else {
                                        // Step 4.2 Add Record in we_return_sell_requisition_details_return_details
                                        updateResults = await weReturnSellRequisitionDetailsReturnDetailsService.create(weReturnSellRequisitionDetails, {
                                            weReturnSellRequisitionDetailsId: weReturnSellRequisitionDetails.id,
                                            weSellRequisitionDetailsId: weSellRequisitionDetailsRecord.id,
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

                    if (weCurrentQuantity >= defferenceQuantity) {

                        // update quantity we return sell requisition details we
                        await weReturnSellRequisitionDetailsWeQueries.update({
                            quantity: newQuantity
                        }, {
                            we_return_sell_requisition_details_id: selectOneWeReturnSellWeRecord[0].we_return_sell_requisition_details_id
                        })

                        // update quantity we
                        await weQueries.update({
                            current_quantity: weCurrentQuantity - defferenceQuantity
                        }, {
                            id: selectOneWeRecord[0].id
                        })

                        // Step 1 => Decrement quantity in  we_return_requisition_details
                        await weReturnSellRequisitionDetailsQueries.update({
                            quantity: oldQuantity - defferenceQuantity
                        }, {
                            id: weReturnSellRequisitionDetails.id
                        })

                        // Step 2 => Select From we_return_sell_requisition_details_return_details Records
                        let whereCluseDetailsWeSellRequisitionDetails = {};
                        whereCluseDetailsWeSellRequisitionDetails[`${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`] = weReturnSellRequisitionDetails.id;
                        whereCluseDetailsWeSellRequisitionDetails[`${weReturnSellRequisitionDetailsReturnDetailsTableName}.is_deleted`] = 0;
                        whereCluseDetailsWeSellRequisitionDetails[`${weReturnSellRequisitionDetailsReturnDetailsTableName}.is_active`] = 1;
                        const weReturnSellRequisitionDetailsReturnDetailsRecords = await weReturnSellRequisitionDetailsReturnDetailsService.selectWithTwoCondition(whereCluseDetailsWeSellRequisitionDetails,
                            ["quantity", ">", "0"])
                        if (weReturnSellRequisitionDetailsReturnDetailsRecords[0] != null) {
                            for (let j = 0; j < weReturnSellRequisitionDetailsReturnDetailsRecords.length; j++) {
                                const weReturnSellRequisitionDetailsReturnDetailsRecord = weReturnSellRequisitionDetailsReturnDetailsRecords[j];
                                let weReturnRequisitionDetailsReturnDetailsQuantity = weReturnSellRequisitionDetailsReturnDetailsRecord.quantity
                                let updatedQuantity = 0

                                if (weReturnRequisitionDetailsReturnDetailsQuantity >= defferenceQuantity) {
                                    // Decrement we_return_sell_requisition_details_return_details quantity
                                    await weReturnSellRequisitionDetailsReturnDetailsQueries.update({
                                        quantity: weReturnRequisitionDetailsReturnDetailsQuantity - defferenceQuantity
                                    }, {
                                        we_return_sell_requisition_details_id: weReturnSellRequisitionDetails.id,
                                        we_sell_requisition_details_id: weReturnSellRequisitionDetailsReturnDetailsRecord.we_sell_requisition_details_id
                                    })
                                    updatedQuantity = defferenceQuantity
                                    defferenceQuantity = 0
                                } else {
                                    // Decrement we_return_sell_requisition_details_return_details quantity
                                    await weReturnSellRequisitionDetailsReturnDetailsQueries.update({
                                        quantity: 0
                                    }, {
                                        we_return_sell_requisition_details_id: weReturnSellRequisitionDetails.id,
                                        we_sell_requisition_details_id: weReturnSellRequisitionDetailsReturnDetailsRecord.we_sell_requisition_details_id
                                    })
                                    updatedQuantity = weReturnRequisitionDetailsReturnDetailsQuantity
                                    defferenceQuantity = parseFloat((defferenceQuantity - weReturnRequisitionDetailsReturnDetailsQuantity).toFixed(3))
                                }

                                // select we sell requisition details record
                                const weSellRequisitionDetailsRecord = await weSellRequisitionDetailsQueries.selectOne({
                                    id: weReturnSellRequisitionDetailsReturnDetailsRecord.we_sell_requisition_details_id
                                })
                                if (weSellRequisitionDetailsRecord[0] != null) {
                                    const oldCurrentQuantity = weSellRequisitionDetailsRecord[0].current_quantity

                                    // Increment we sell requisition details current_quantity
                                    await weSellRequisitionDetailsQueries.update({
                                        current_quantity: oldCurrentQuantity + updatedQuantity
                                    }, {
                                        id: weSellRequisitionDetailsRecord[0].id
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
                            spentQuantity: weCurrentQuantity,
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
                updateResults = false
            }
        } else {
            updateResults = false
        }
    } else {
        return constants.itemNotFound;
    }
};
