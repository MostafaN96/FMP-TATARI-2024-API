// Queries
const waTransitionBetweenWHRequisitionDetailsWaQueries = require("../../db/queries/wa/wa-transition-between-wh-requisition-details-wa");
const waTransitionBetweenWHRequisitionDetailsQueries = require("../../db/queries/wa/wa-transition-between-wh-requisition-details");
const waTransitionBetweenWHRequisitionQueries = require("../../db/queries/wa/wa-transition-between-wh-requisition");
const waQueries = require("../../db/queries/wa/wa");
const consigmentYarnQueries = require("../../db/queries/general/consigment-yarn");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");

// Services
const waTransitionBetweenWHRequisitionDetailsWaService = require("./wa-transition-between-wh-requisition-details-wa");
const waService = require("./wa");
const { waTransitionBetweenWHRequisitionDetailsTableName,
    waTransitionBetweenWHRequisitionDetailsWaTableName
} = require("../../util/database-tables-name");

exports.create = async (waTransitionBetweenWHRequisitionDetails) => {

    for (let i = 0; i < waTransitionBetweenWHRequisitionDetails.items.length; i++) {
        waTransitionBetweenWHRequisitionDetails.items[i].waTransitionBetweenWHRequisitionDetailsId = trans.transform();
        waTransitionBetweenWHRequisitionDetails.waId = trans.transform();

        // Check Consigment Yarn Dupplication
        const selectConsigmentYarnOneResult = await consigmentYarnQueries.selectOne({ number: waTransitionBetweenWHRequisitionDetails.items[i].newConsigmentYarnNumber })
        if (Array.isArray(selectConsigmentYarnOneResult) && selectConsigmentYarnOneResult.length > 0) {
            waTransitionBetweenWHRequisitionDetails.items[i].consigmentYarnId = selectConsigmentYarnOneResult[0].id;
        } else {
            waTransitionBetweenWHRequisitionDetails.items[i].consigmentYarnId = trans.transform();
            await consigmentYarnQueries.insertForWaExecuteOrder(waTransitionBetweenWHRequisitionDetails, waTransitionBetweenWHRequisitionDetails.items[i]);
        }

        const results = await waTransitionBetweenWHRequisitionDetailsQueries.insert(waTransitionBetweenWHRequisitionDetails, waTransitionBetweenWHRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            let newQuantity = parseFloat(waTransitionBetweenWHRequisitionDetails.items[i].quantity)

            // select Wa yarn for decrement current quantity
            const yarnsStoredInWaResult = await waService.selectByYarnForSell(
                waTransitionBetweenWHRequisitionDetails.items[i].fromWarehouseId, 
                waTransitionBetweenWHRequisitionDetails.items[i].yarnId, 
                waTransitionBetweenWHRequisitionDetails.items[i].yarnLotId,
                waTransitionBetweenWHRequisitionDetails.items[i].fromConsigmentYarnId)
            if (yarnsStoredInWaResult[0] != null) {

                for (let j = 0; j < yarnsStoredInWaResult.length; j++) {
                    const yarnStoredInWa = yarnsStoredInWaResult[j];
                    let currentQuantity = yarnStoredInWa.current_quantity
                    let updatedQuantity = 0

                    // decrement Wa yarn CurrentQuantity
                    let returnedQuantityObj = await waService.decrementWaCurrentQuantity(newQuantity, currentQuantity, yarnStoredInWa, updatedQuantity);
                    newQuantity = returnedQuantityObj.newQuantity
                    updatedQuantity = returnedQuantityObj.updatedQuantity
                    waTransitionBetweenWHRequisitionDetails.items[i].waId = yarnStoredInWa.id
                    waTransitionBetweenWHRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                    // Add wa yarn transition between wh Requisition Details Wa
                    await waTransitionBetweenWHRequisitionDetailsWaService.create(waTransitionBetweenWHRequisitionDetails, waTransitionBetweenWHRequisitionDetails.items[i])

                    // Enter to if condition when stock runs out
                    if (newQuantity == 0) {
                        break;
                    }
                }
                // Insert WB
                await waQueries.insertForTransitionBetweenWhRequisition(waTransitionBetweenWHRequisitionDetails, waTransitionBetweenWHRequisitionDetails.items[i])
            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: 0,
                    newQuantity: newQuantity
                }
            }

        }
    }
    return { ...constants.insertSuccess, ...{ id: waTransitionBetweenWHRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await waTransitionBetweenWHRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.wa_transition_between_wh_requisitions_id`] = requisitionId;
        whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;
        const results = await waTransitionBetweenWHRequisitionDetailsQueries.selectByRequisitionId(whereCluse);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (waTransitionBetweenWHRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.id`] = waTransitionBetweenWHRequisitionDetails.id;
    whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await waTransitionBetweenWHRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

            waTransitionBetweenWHRequisitionDetails.waTransitionBetweenWhRequisitionsId = isFound[0].wa_transition_between_wh_requisitions_id

            let waTransitionBetweenWHRequisitionDetailsWaWhereCluse = {}
        waTransitionBetweenWHRequisitionDetailsWaWhereCluse[`${waTransitionBetweenWHRequisitionDetailsWaTableName}.wa_transition_between_wh_requisitions_details_id`] = waTransitionBetweenWHRequisitionDetails.id
        const waTransitionBetweenWHRequisitionDetailsWaSelectOneResult = await waTransitionBetweenWHRequisitionDetailsWaQueries.selectOne(waTransitionBetweenWHRequisitionDetailsWaWhereCluse)
        if (waTransitionBetweenWHRequisitionDetailsWaSelectOneResult[0] != null) {

            // Update wa yarn sell requisition Without Quantity
            callArray.push(waTransitionBetweenWHRequisitionQueries.update({
                date: waTransitionBetweenWHRequisitionDetails.date,
                note: waTransitionBetweenWHRequisitionDetails.note
            },
                {
                    id: waTransitionBetweenWHRequisitionDetails.waTransitionBetweenWhRequisitionsId
                }))


            // Update wa yarn sell requisition details Without Quantity
            callArray.push(
                waTransitionBetweenWHRequisitionDetailsQueries.update({
                    price: waTransitionBetweenWHRequisitionDetails.price,
                    document: waTransitionBetweenWHRequisitionDetails.document,
                    statement: waTransitionBetweenWHRequisitionDetails.statement
                },
                    {
                        id: waTransitionBetweenWHRequisitionDetails.id
                    })
            )
            await Promise.all(callArray)

            // let currentQuantity = waResult[0].current_quantity
            let oldQuantity = isFound[0].quantity
            let newQuantity = parseFloat(waTransitionBetweenWHRequisitionDetails.quantity)
            let defferenceQuantity = 0

            const selectOneWaRecord = await waQueries.selectOne({
                wa_transition_between_wh_requisitions_details_id: waTransitionBetweenWHRequisitionDetails.id
            })

            if (selectOneWaRecord[0] != null) {

                const selectOldOneWaRecord = await waQueries.selectOne({
                    id: waTransitionBetweenWHRequisitionDetailsWaSelectOneResult[0].wa_id
                })
                if (selectOldOneWaRecord[0] != null) {

            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                const sumCurrentQuantity = selectOldOneWaRecord[0].current_quantity
                        if (sumCurrentQuantity >= defferenceQuantity) {

                // we will decrement current quantity from store (wa yarn) by following Steps :
                // Step 1 => Check If has current quantity in store (wa yarn)
                const sumCurrentQuantityWa = await waService.selectSumCurrentQuantityByWarehouseByYarnByYarnLotByConsigmentYarnWa(
                    isFound[0].from_warehouse_id, 
                    isFound[0].yarn_id, 
                    isFound[0].yarn_lot_id,
                    isFound[0].from_consigment_yarn_id
                    )
                if(sumCurrentQuantityWa[0] != null) {
                    console.log("sumCurrentQuantityWa ::: ", sumCurrentQuantityWa);
                    const sumCurrentQuantity = sumCurrentQuantityWa[0].current_quantity
                    if(sumCurrentQuantity >= defferenceQuantity) {
    
                        // Step 2 => Increment quantity in  wa_sell_requisition_details
                        await waTransitionBetweenWHRequisitionDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity
                        }, {
                            id: waTransitionBetweenWHRequisitionDetails.id
                        })

                        // Increment wa current_quantity
                        await waQueries.update({
                            current_quantity: selectOneWaRecord[0].current_quantity + defferenceQuantity
                        }, {
                            id: selectOneWaRecord[0].id
                        })
    
                        // Step 3 => select from (WA yarn) Records for decrement current quantity
                        const waRecords = await waService.selectByYarnForSell(
                            isFound[0].from_warehouse_id, 
                            isFound[0].yarn_id, 
                            isFound[0].yarn_lot_id,
                            isFound[0].from_consigment_yarn_id
                            )
                        if(waRecords[0] != null) {
                            console.log("waRecords ::: ", waRecords);
                            for (let i = 0; i < waRecords.length; i++) {
                                const waRecord = waRecords[i];
                                let currentQuantity = waRecord.current_quantity
                                let updatedQuantity = 0
    
                                // decrement Wa yarn CurrentQuantity
                                let returnedQuantityObj =  await waService.decrementWaCurrentQuantity(defferenceQuantity, currentQuantity, waRecord, updatedQuantity);
                                defferenceQuantity = returnedQuantityObj.newQuantity
                                updatedQuantity = returnedQuantityObj.updatedQuantity
    
                                // Step 4 => Check if wa_id existed in wa_sell_requisition_details_wa
                                // that has same wa_transition_between_wh_requisitions_details_id
                                const isExisitId = await waTransitionBetweenWHRequisitionDetailsWaService.select({
                                    wa_transition_between_wh_requisitions_details_id: waTransitionBetweenWHRequisitionDetails.id,
                                    wa_id: waRecord.id
                                })
    
                                if(isExisitId[0] != null) {
                                    // Step 4.1 => Update Quantity in wa_sell_requisition_details_wa
                                    updateResults = await waTransitionBetweenWHRequisitionDetailsWaQueries.update({
                                        quantity: isExisitId[0].quantity + updatedQuantity
                                    }, {
                                        wa_transition_between_wh_requisitions_details_id: waTransitionBetweenWHRequisitionDetails.id,
                                        wa_id: isExisitId[0].wa_id
                                    })
                                } else {
                                    // Step 4.2 Add Record in wa_sell_requisition_details_wa
                                    updateResults = await waTransitionBetweenWHRequisitionDetailsWaService.create(waTransitionBetweenWHRequisitionDetails, {
                                        waTransitionBetweenWHRequisitionDetailsId: waTransitionBetweenWHRequisitionDetails.id,
                                        waId: waRecord.id,
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

            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: sumCurrentQuantity,
                    newQuantity: defferenceQuantity
                }
            }
                

            } else if (newQuantity < oldQuantity) {
                defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))
                
                if (selectOneWaRecord[0].current_quantity >= defferenceQuantity) {
                // Step 1 => Decrement quantity in  wa_sell_requisition_details
                await waTransitionBetweenWHRequisitionDetailsQueries.update({
                    quantity: oldQuantity - defferenceQuantity
                }, {
                    id: waTransitionBetweenWHRequisitionDetails.id
                })

                // Decrement wa current_quantity
                await waQueries.update({
                    current_quantity: selectOneWaRecord[0].current_quantity - defferenceQuantity
                }, {
                    id: selectOneWaRecord[0].id
                })
                
                // Step 2 => Select From wa_sell_requisition_details_wa Records
                let whereCluseDetailsWa = {};
                whereCluseDetailsWa[`${waTransitionBetweenWHRequisitionDetailsWaTableName}.wa_transition_between_wh_requisitions_details_id`] = waTransitionBetweenWHRequisitionDetails.id;
                whereCluseDetailsWa[`${waTransitionBetweenWHRequisitionDetailsWaTableName}.is_deleted`] = 0;
                whereCluseDetailsWa[`${waTransitionBetweenWHRequisitionDetailsWaTableName}.is_active`] = 1;
                const waTransitionBetweenWhRequisitionDetailsWaRecords = await waTransitionBetweenWHRequisitionDetailsWaService.selectWithTwoCondition(whereCluseDetailsWa,
                    ["quantity", ">", "0"])
                if (waTransitionBetweenWhRequisitionDetailsWaRecords[0] != null) {
                    for (let j = 0; j < waTransitionBetweenWhRequisitionDetailsWaRecords.length; j++) {
                        const waTransitionBetweenWhRequisitionDetailsWaRecord = waTransitionBetweenWhRequisitionDetailsWaRecords[j];
                        let waTransitionBetweenWhRequisitionDetailsWaQuantity = waTransitionBetweenWhRequisitionDetailsWaRecord.quantity
                        let updatedQuantity = 0

                        if(waTransitionBetweenWhRequisitionDetailsWaQuantity >= defferenceQuantity ) {
                            // Decrement wa_sell_requisition_details_wa quantity
                            await waTransitionBetweenWHRequisitionDetailsWaQueries.update({
                                quantity: waTransitionBetweenWhRequisitionDetailsWaQuantity - defferenceQuantity
                            }, {
                                wa_transition_between_wh_requisitions_details_id: waTransitionBetweenWHRequisitionDetails.id,
                                wa_id: waTransitionBetweenWhRequisitionDetailsWaRecord.wa_id
                            })
                            updatedQuantity = defferenceQuantity
                            defferenceQuantity = 0
                        } else {
                            // Decrement wa_sell_requisition_details_wa quantity
                            await waTransitionBetweenWHRequisitionDetailsWaQueries.update({
                                quantity: 0
                            }, {
                                wa_transition_between_wh_requisitions_details_id: waTransitionBetweenWHRequisitionDetails.id,
                                wa_id: waTransitionBetweenWhRequisitionDetailsWaRecord.wa_id
                            })
                            updatedQuantity = waTransitionBetweenWhRequisitionDetailsWaQuantity
                            defferenceQuantity = parseFloat((defferenceQuantity - waTransitionBetweenWhRequisitionDetailsWaQuantity).toFixed(3))
                        }

                        // select wa yarn record
                        const waRecord = await waQueries.selectOne({
                            id: waTransitionBetweenWhRequisitionDetailsWaRecord.wa_id
                        })
                        if(waRecord[0] != null) {
                            const oldCurrentQuantity = waRecord[0].current_quantity

                            // Increment wa current_quantity
                            await waQueries.update({
                                current_quantity: oldCurrentQuantity + updatedQuantity
                            }, {
                                id: waRecord[0].id
                            })
                        }

                        if(defferenceQuantity == 0) {
                            updateResults = true
                            break;
                        }
                    }

                } else {
                    updateResults = false
                }

                ///
            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: selectOneWaRecord[0].current_quantity,
                    newQuantity: defferenceQuantity
                }
            }
            } else {
                updateResults = true
            }
        } else {
            updateResults = false
        }
        
        } else {
            updateResults = false
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
        return constants.itemNotFound;
    }
};
