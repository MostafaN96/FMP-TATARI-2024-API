// Queries
const weReturnRequisitionDetailsQueries = require("../../db/queries/we/we-return-requisition-details");
const weReturnRequisitionQueries = require("../../db/queries/we/we-return-requisition");
const weReturnRequisitionDetailsWeQueries = require("../../db/queries/we/we-return-requisition-details-we");
const weQueries = require("../../db/queries/we/we");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const weReturnRequisitionDetailsWeTableName = require("../../util/database-tables-name").weReturnRequisitionDetailsWeTableName;
const weReturnRequisitionDetailsTableName = require("../../util/database-tables-name").weReturnRequisitionDetailsTableName;

// Services
const weService = require("./we");
const weReturnRequisitionDetailsWeService = require("./we-return-requisition-details-we");
const { weTableName } = require("../../util/database-tables-name");

exports.create = async (weReturnRequisitionDetails) => {
    // check is found
    const isFound = await weReturnRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: weReturnRequisitionDetails.id,
    });
    if (isFound[0] != null) {
        weReturnRequisitionDetails.supplierId = isFound[0].supplier_id

        for (let i = 0; i < weReturnRequisitionDetails.items.length; i++) {
            weReturnRequisitionDetails.items[i].weReturnRequisitionDetailsId = trans.transform();

            const results = await weReturnRequisitionDetailsQueries.insert(weReturnRequisitionDetails, weReturnRequisitionDetails.items[i]);
            if (!results) {
                return constants.insertError;
            } else {
                let newQuantity = parseFloat(weReturnRequisitionDetails.items[i].quantity)

                // select we for decrement current quantity
                let weWhereCluse = {}
                weWhereCluse[`${weTableName}.id`] = weReturnRequisitionDetails.items[i].weId
                const fabricsStoredInWeResult = await weQueries.selectOne(weWhereCluse)
                if (fabricsStoredInWeResult[0] != null) {

                    for (let j = 0; j < fabricsStoredInWeResult.length; j++) {
                        const fabricStoredInWe = fabricsStoredInWeResult[j];
                        let currentQuantity = fabricStoredInWe.current_quantity
                        let updatedQuantity = 0

                        // decrement we CurrentQuantity
                        let returnedQuantityObj = await weService.decrementWeCurrentQuantity(newQuantity, currentQuantity, fabricStoredInWe, updatedQuantity);
                        newQuantity = returnedQuantityObj.newQuantity
                        updatedQuantity = returnedQuantityObj.updatedQuantity
                        weReturnRequisitionDetails.items[i].weId = fabricStoredInWe.id
                        weReturnRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                        // Add we Return Requisition Details we
                        await weReturnRequisitionDetailsWeService.create(weReturnRequisitionDetails, weReturnRequisitionDetails.items[i])

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
        return { ...constants.insertSuccess, ...{ id: weReturnRequisitionDetails.id } };
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await weReturnRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await weReturnRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (weReturnRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${weReturnRequisitionDetailsTableName}.id`] = weReturnRequisitionDetails.id;
    whereCluse[`${weReturnRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${weReturnRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await weReturnRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        let weReturnRequisitionDetailsWeWhereCluse = {}
        weReturnRequisitionDetailsWeWhereCluse[`${weReturnRequisitionDetailsWeTableName}.we_return_requisition_details_id`] = weReturnRequisitionDetails.id
        const weReturnRequisitionDetailsWeSelectOneResult = await weReturnRequisitionDetailsWeQueries.selectOne(weReturnRequisitionDetailsWeWhereCluse)
        if (weReturnRequisitionDetailsWeSelectOneResult[0] != null) {
        weReturnRequisitionDetails.weReturnRequisitionId = isFound[0].we_return_requisition_id

        // Update wa Yarn return requisition Without Quantity
        callArray.push(weReturnRequisitionQueries.update({
            date: weReturnRequisitionDetails.date,
            note: weReturnRequisitionDetails.note
        },
            {
                id: weReturnRequisitionDetails.weReturnRequisitionId
            }))


        // Update wa Yarn return requisition details Without Quantity
        callArray.push(
            weReturnRequisitionDetailsQueries.update({
                price: weReturnRequisitionDetails.price,
                fabric_piece: weReturnRequisitionDetails.numberFabricPieces,
                is_defect: weReturnRequisitionDetails.isDefect,
                statement: weReturnRequisitionDetails.statement
            },
                {
                    id: weReturnRequisitionDetails.id
                })
        )
        await Promise.all(callArray)

        // let currentQuantity = waResult[0].current_quantity
        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(weReturnRequisitionDetails.quantity)
        let defferenceQuantity = 0

        // Check Quantity
        if (newQuantity > oldQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

            // we will decrement current quantity from store (we) by following Steps :
            // Step 1 => Check If has current quantity in store (we)
            let weWhereCluse = {}
            weWhereCluse[`${weTableName}.id`] = weReturnRequisitionDetailsWeSelectOneResult[0].we_id
            const selectCurrentQuantityWe = await weQueries.selectOne(weWhereCluse)            
            if (selectCurrentQuantityWe[0] != null) {
                const sumCurrentQuantity = selectCurrentQuantityWe[0].current_quantity
                if (sumCurrentQuantity >= defferenceQuantity) {

                    // Step 2 => Increment quantity in  we_return_requisition_details
                    await weReturnRequisitionDetailsQueries.update({
                        quantity: oldQuantity + defferenceQuantity
                    }, {
                        id: weReturnRequisitionDetails.id
                    })

                    // Step 3 => select from (we) Records for decrement current quantity
                    let weRecordWhereCluse = {}
                        weRecordWhereCluse[`${weTableName}.id`] = weReturnRequisitionDetailsWeSelectOneResult[0].we_id
                        const weRecords = await weQueries.selectOne(weRecordWhereCluse)
                    if (weRecords[0] != null) {
                        for (let i = 0; i < weRecords.length; i++) {
                            const weRecord = weRecords[i];
                            let currentQuantity = weRecord.current_quantity
                            let updatedQuantity = 0

                            // decrement we CurrentQuantity
                            let returnedQuantityObj = await weService.decrementWeCurrentQuantity(defferenceQuantity, currentQuantity, weRecord, updatedQuantity);
                            defferenceQuantity = returnedQuantityObj.newQuantity
                            updatedQuantity = returnedQuantityObj.updatedQuantity

                            // Step 4 => Check if we_id existed in we_return_requisition_details_we
                            // that has same we_return_requisition_details_id
                            const isExisitId = await weReturnRequisitionDetailsWeService.select({
                                we_return_requisition_details_id: weReturnRequisitionDetails.id,
                                we_id: weRecord.id
                            })

                            if (isExisitId[0] != null) {
                                // Step 4.1 => Update Quantity in we_return_requisition_details_we
                                updateResults = await weReturnRequisitionDetailsWeQueries.update({
                                    quantity: isExisitId[0].quantity + updatedQuantity
                                }, {
                                    we_return_requisition_details_id: weReturnRequisitionDetails.id,
                                    we_id: isExisitId[0].we_id
                                })
                            } else {
                                // Step 4.2 Add Record in we_return_requisition_details_we
                                updateResults = await weReturnRequisitionDetailsWeService.create(weReturnRequisitionDetails, {
                                    weReturnRequisitionDetailsId: weReturnRequisitionDetails.id,
                                    weId: weRecord.id,
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

            // Step 1 => Decrement quantity in  we_return_requisition_details
            await weReturnRequisitionDetailsQueries.update({
                quantity: oldQuantity - defferenceQuantity
            }, {
                id: weReturnRequisitionDetails.id
            })

            // Step 2 => Select From we_return_requisition_details_we Records
            let whereCluseDetailsWe = {};
            whereCluseDetailsWe[`${weReturnRequisitionDetailsWeTableName}.we_return_requisition_details_id`] = weReturnRequisitionDetails.id;
            whereCluseDetailsWe[`${weReturnRequisitionDetailsWeTableName}.is_deleted`] = 0;
            whereCluseDetailsWe[`${weReturnRequisitionDetailsWeTableName}.is_active`] = 1;
            const weReturnRequisitionDetailsWeRecords = await weReturnRequisitionDetailsWeService.selectWithTwoCondition(whereCluseDetailsWe,
                ["quantity", ">", "0"])
            if (weReturnRequisitionDetailsWeRecords[0] != null) {
                for (let j = 0; j < weReturnRequisitionDetailsWeRecords.length; j++) {
                    const weReturnRequisitionDetailsWeRecord = weReturnRequisitionDetailsWeRecords[j];
                    let weReturnRequisitionDetailsWeQuantity = weReturnRequisitionDetailsWeRecord.quantity
                    let updatedQuantity = 0

                    if (weReturnRequisitionDetailsWeQuantity >= defferenceQuantity) {
                        // Decrement we_return_requisition_details_we quantity
                        await weReturnRequisitionDetailsWeQueries.update({
                            quantity: weReturnRequisitionDetailsWeQuantity - defferenceQuantity
                        }, {
                            we_return_requisition_details_id: weReturnRequisitionDetails.id,
                            we_id: weReturnRequisitionDetailsWeRecord.we_id
                        })
                        updatedQuantity = defferenceQuantity
                        defferenceQuantity = 0
                    } else {
                        // Decrement we_return_requisition_details_we quantity
                        await weReturnRequisitionDetailsWeQueries.update({
                            quantity: 0
                        }, {
                            we_return_requisition_details_id: weReturnRequisitionDetails.id,
                            we_id: weReturnRequisitionDetailsWeRecord.we_id
                        })
                        updatedQuantity = weReturnRequisitionDetailsWeQuantity
                        defferenceQuantity = parseFloat((defferenceQuantity - weReturnRequisitionDetailsWeQuantity).toFixed(3))
                    }

                    // select we Fabric record
                    const weRecord = await weQueries.selectOne({
                        id: weReturnRequisitionDetailsWeRecord.we_id
                    })
                    if (weRecord[0] != null) {
                        const oldCurrentQuantity = weRecord[0].current_quantity

                        // Increment we current_quantity
                        await weQueries.update({
                            current_quantity: oldCurrentQuantity + updatedQuantity
                        }, {
                            id: weRecord[0].id
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
        updateResults = false
        }
    } else {
        return constants.itemNotFound;
    }
};
