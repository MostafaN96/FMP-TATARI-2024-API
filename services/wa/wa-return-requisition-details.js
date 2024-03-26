// Queries
const waReturnRequisitionDetailsQueries = require("../../db/queries/wa/wa-return-requisition-details");
const waReturnRequisitionQueries = require("../../db/queries/wa/wa-return-requisition");
const waReturnRequisitionDetailsWaQueries = require("../../db/queries/wa/wa-return-requisition-details-wa");
const waQueries = require("../../db/queries/wa/wa");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const waReturnRequisitionDetailsWaTableName = require("../../util/database-tables-name").waReturnRequisitionDetailsWaTableName;
const waReturnRequisitionDetailsTableName = require("../../util/database-tables-name").waReturnRequisitionDetailsTableName;

// Services
const waService = require("./wa");
const waReturnRequisitionDetailsWaService = require("./wa-return-requisition-details-wa");

exports.create = async (waReturnRequisitionDetails) => {
    // check is found
    const isFound = await waReturnRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: waReturnRequisitionDetails.id,
    });
    if (isFound[0] != null) {
        waReturnRequisitionDetails.supplierId = isFound[0].supplier_id

        for (let i = 0; i < waReturnRequisitionDetails.items.length; i++) {
            waReturnRequisitionDetails.items[i].waReturnRequisitionDetailsId = trans.transform();

            const results = await waReturnRequisitionDetailsQueries.insert(waReturnRequisitionDetails, waReturnRequisitionDetails.items[i]);
            if (!results) {
                return constants.insertError;
            } else {
                let newQuantity = parseFloat(waReturnRequisitionDetails.items[i].quantity)

                // select Wa Yarn for decrement current quantity
                const yarnsStoredInWaResult = await waService.selectByYarnForReturn(waReturnRequisitionDetails.warehouseId, 
                    waReturnRequisitionDetails.items[i].yarnId, 
                    waReturnRequisitionDetails.items[i].yarnLotId, 
                    waReturnRequisitionDetails.items[i].consigmentYarnId, 
                    waReturnRequisitionDetails.supplierId)
                if (yarnsStoredInWaResult[0] != null) {

                    for (let j = 0; j < yarnsStoredInWaResult.length; j++) {
                        const yarnStoredInWa = yarnsStoredInWaResult[j];
                        let currentQuantity = yarnStoredInWa.current_quantity
                        let updatedQuantity = 0

                        // decrement Wa Yarn CurrentQuantity
                        let returnedQuantityObj = ({ newQuantity, updatedQuantity } = await waService.decrementWaCurrentQuantity(newQuantity, currentQuantity, yarnStoredInWa, updatedQuantity));
                        newQuantity = returnedQuantityObj.newQuantity
                        updatedQuantity = returnedQuantityObj.updatedQuantity
                        waReturnRequisitionDetails.items[i].waId = yarnStoredInWa.id
                        waReturnRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                        // Add wa Yarn Return Requisition Details Wa
                        await waReturnRequisitionDetailsWaService.create(waReturnRequisitionDetails, waReturnRequisitionDetails.items[i])

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
        return { ...constants.insertSuccess, ...{ id: waReturnRequisitionDetails.id } };
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await waReturnRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await waReturnRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (waReturnRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${waReturnRequisitionDetailsTableName}.id`] = waReturnRequisitionDetails.id;
    whereCluse[`${waReturnRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waReturnRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await waReturnRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        waReturnRequisitionDetails.waReturnRequisitionId = isFound[0].wa_return_requisition_id

        // Update wa Yarn return requisition Without Quantity
        callArray.push(waReturnRequisitionQueries.update({
            date: waReturnRequisitionDetails.date,
            note: waReturnRequisitionDetails.note
        },
            {
                id: waReturnRequisitionDetails.waReturnRequisitionId
            }))


        // Update wa Yarn return requisition details Without Quantity
        callArray.push(
            waReturnRequisitionDetailsQueries.update({
                price: waReturnRequisitionDetails.price,
                price_dollar: waReturnRequisitionDetails.priceDollar,
                statement: waReturnRequisitionDetails.statement
            },
                {
                    id: waReturnRequisitionDetails.id
                })
        )
        await Promise.all(callArray)

        // let currentQuantity = waResult[0].current_quantity
        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(waReturnRequisitionDetails.quantity)
        let defferenceQuantity = 0

        // Check Quantity
        if (newQuantity > oldQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

            // we will decrement current quantity from store (wa Yarn) by following Steps :
            // Step 1 => Check If has current quantity in store (wa Yarn)
            const sumCurrentQuantityWa = await waService.selectSumCurrentQuantityByYarnAndSupplier(
                isFound[0].warehouse_id, 
                isFound[0].yarn_id, 
                isFound[0].yarn_lot_id, 
                isFound[0].consigment_yarn_id, 
                waReturnRequisitionDetails.supplierId)
            if (sumCurrentQuantityWa[0] != null) {
                const sumCurrentQuantity = sumCurrentQuantityWa[0].current_quantity
                if (sumCurrentQuantity >= defferenceQuantity) {

                    // Step 2 => Increment quantity in  wa_return_requisition_details
                    await waReturnRequisitionDetailsQueries.update({
                        quantity: oldQuantity + defferenceQuantity
                    }, {
                        id: waReturnRequisitionDetails.id
                    })

                    // Step 3 => select from (WA Yarn) Records for decrement current quantity
                    const waRecords = await waService.selectByYarnForReturn(
                        isFound[0].warehouse_id, 
                        isFound[0].yarn_id, 
                        isFound[0].yarn_lot_id, 
                        isFound[0].consigment_yarn_id, 
                        waReturnRequisitionDetails.supplierId)
                    if (waRecords[0] != null) {
                        for (let i = 0; i < waRecords.length; i++) {
                            const waRecord = waRecords[i];
                            let currentQuantity = waRecord.current_quantity
                            let updatedQuantity = 0

                            // decrement Wa Yarn CurrentQuantity
                            let returnedQuantityObj = await waService.decrementWaCurrentQuantity(defferenceQuantity, currentQuantity, waRecord, updatedQuantity);
                            defferenceQuantity = returnedQuantityObj.newQuantity
                            updatedQuantity = returnedQuantityObj.updatedQuantity

                            // Step 4 => Check if wa_id existed in wa_return_requisition_details_wa
                            // that has same wa_return_requisition_details_id
                            const isExisitId = await waReturnRequisitionDetailsWaService.select({
                                wa_return_requisition_details_id: waReturnRequisitionDetails.id,
                                wa_id: waRecord.id
                            })

                            if (isExisitId[0] != null) {
                                // Step 4.1 => Update Quantity in wa_return_requisition_details_wa
                                updateResults = await waReturnRequisitionDetailsWaQueries.update({
                                    quantity: isExisitId[0].quantity + updatedQuantity
                                }, {
                                    wa_return_requisition_details_id: waReturnRequisitionDetails.id,
                                    wa_id: isExisitId[0].wa_id
                                })
                            } else {
                                // Step 4.2 Add Record in wa_return_requisition_details_wa
                                updateResults = await waReturnRequisitionDetailsWaService.create(waReturnRequisitionDetails, {
                                    waReturnRequisitionDetailsId: waReturnRequisitionDetails.id,
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


        } else if (newQuantity < oldQuantity) {
            defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

            // Step 1 => Decrement quantity in  wa_return_requisition_details
            await waReturnRequisitionDetailsQueries.update({
                quantity: oldQuantity - defferenceQuantity
            }, {
                id: waReturnRequisitionDetails.id
            })

            // Step 2 => Select From wa_return_requisition_details_wa Records
            let whereCluseDetailsWa = {};
            whereCluseDetailsWa[`${waReturnRequisitionDetailsWaTableName}.wa_return_requisition_details_id`] = waReturnRequisitionDetails.id;
            whereCluseDetailsWa[`${waReturnRequisitionDetailsWaTableName}.is_deleted`] = 0;
            whereCluseDetailsWa[`${waReturnRequisitionDetailsWaTableName}.is_active`] = 1;
            const waReturnRequisitionDetailsWaRecords = await waReturnRequisitionDetailsWaService.selectWithTwoCondition(whereCluseDetailsWa,
                ["quantity", ">", "0"])
            if (waReturnRequisitionDetailsWaRecords[0] != null) {
                for (let j = 0; j < waReturnRequisitionDetailsWaRecords.length; j++) {
                    const waReturnRequisitionDetailsWaRecord = waReturnRequisitionDetailsWaRecords[j];
                    let waReturnRequisitionDetailsWaQuantity = waReturnRequisitionDetailsWaRecord.quantity
                    let updatedQuantity = 0

                    if (waReturnRequisitionDetailsWaQuantity >= defferenceQuantity) {
                        // Decrement wa_return_requisition_details_wa quantity
                        await waReturnRequisitionDetailsWaQueries.update({
                            quantity: waReturnRequisitionDetailsWaQuantity - defferenceQuantity
                        }, {
                            wa_return_requisition_details_id: waReturnRequisitionDetails.id,
                            wa_id: waReturnRequisitionDetailsWaRecord.wa_id
                        })
                        updatedQuantity = defferenceQuantity
                        defferenceQuantity = 0
                    } else {
                        // Decrement wa_return_requisition_details_wa quantity
                        await waReturnRequisitionDetailsWaQueries.update({
                            quantity: 0
                        }, {
                            wa_return_requisition_details_id: waReturnRequisitionDetails.id,
                            wa_id: waReturnRequisitionDetailsWaRecord.wa_id
                        })
                        updatedQuantity = waReturnRequisitionDetailsWaQuantity
                        defferenceQuantity = parseFloat((defferenceQuantity - waReturnRequisitionDetailsWaQuantity).toFixed(3))
                    }

                    // select wa Yarn record
                    const waRecord = await waQueries.selectOne({
                        id: waReturnRequisitionDetailsWaRecord.wa_id
                    })
                    if (waRecord[0] != null) {
                        const oldCurrentQuantity = waRecord[0].current_quantity

                        // Increment wa current_quantity
                        await waQueries.update({
                            current_quantity: oldCurrentQuantity + updatedQuantity
                        }, {
                            id: waRecord[0].id
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
