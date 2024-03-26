// Queries
const wcReturnRequisitionDetailsQueries = require("../../db/queries/wc/wc-return-requisition-details");
const wcReturnRequisitionQueries = require("../../db/queries/wc/wc-return-requisition");
const wcReturnRequisitionDetailsWcQueries = require("../../db/queries/wc/wc-return-requisition-details-wc");
const wcQueries = require("../../db/queries/wc/wc");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const wcReturnRequisitionDetailsWcTableName = require("../../util/database-tables-name").wcReturnRequisitionDetailsWcTableName;
const wcReturnRequisitionDetailsTableName = require("../../util/database-tables-name").wcReturnRequisitionDetailsTableName;

// Services
const wcService = require("./wc");
const wcReturnRequisitionDetailsWcService = require("./wc-return-requisition-details-wc");

exports.create = async (wcReturnRequisitionDetails) => {
    // check is found
    const isFound = await wcReturnRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: wcReturnRequisitionDetails.id,
    });
    if (isFound[0] != null) {
        wcReturnRequisitionDetails.supplierId = isFound[0].supplier_id

        for (let i = 0; i < wcReturnRequisitionDetails.items.length; i++) {
            wcReturnRequisitionDetails.items[i].wcReturnRequisitionDetailsId = trans.transform();

            const results = await wcReturnRequisitionDetailsQueries.insert(wcReturnRequisitionDetails, wcReturnRequisitionDetails.items[i]);
            if (!results) {
                return constants.insertError;
            } else {
                let newQuantity = parseFloat(wcReturnRequisitionDetails.items[i].quantity)

                // select Wa Yarn for decrement current quantity
                const fabricsStoredInWcResult = await wcService.selectByFabricForReturn(wcReturnRequisitionDetails.warehouseId, 
                    wcReturnRequisitionDetails.items[i].fabricId, wcReturnRequisitionDetails.items[i].consigmentManufacturingId, wcReturnRequisitionDetails.supplierId)
                if (fabricsStoredInWcResult[0] != null) {

                    for (let j = 0; j < fabricsStoredInWcResult.length; j++) {
                        const fabricStoredInWc = fabricsStoredInWcResult[j];
                        let currentQuantity = fabricStoredInWc.current_quantity
                        let updatedQuantity = 0

                        // decrement Wa Yarn CurrentQuantity
                        let returnedQuantityObj = ({ newQuantity, updatedQuantity } = await wcService.decrementWcCurrentQuantity(newQuantity, currentQuantity, fabricStoredInWc, updatedQuantity));
                        newQuantity = returnedQuantityObj.newQuantity
                        updatedQuantity = returnedQuantityObj.updatedQuantity
                        wcReturnRequisitionDetails.items[i].wcId = fabricStoredInWc.id
                        wcReturnRequisitionDetails.items[i].updatedQuantity = updatedQuantity

                        // Add wa Yarn Return Requisition Details Wa
                        await wcReturnRequisitionDetailsWcService.create(wcReturnRequisitionDetails, wcReturnRequisitionDetails.items[i])

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
        return { ...constants.insertSuccess, ...{ id: wcReturnRequisitionDetails.id } };
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wcReturnRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await wcReturnRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (wcReturnRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wcReturnRequisitionDetailsTableName}.id`] = wcReturnRequisitionDetails.id;
    whereCluse[`${wcReturnRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wcReturnRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wcReturnRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        wcReturnRequisitionDetails.wcReturnRequisitionId = isFound[0].wc_return_requisition_id

        // Update wa Yarn return requisition Without Quantity
        callArray.push(wcReturnRequisitionQueries.update({
            date: wcReturnRequisitionDetails.date,
            note: wcReturnRequisitionDetails.note
        },
            {
                id: wcReturnRequisitionDetails.wcReturnRequisitionId
            }))


        // Update wa Yarn return requisition details Without Quantity
        callArray.push(
            wcReturnRequisitionDetailsQueries.update({
                price: wcReturnRequisitionDetails.price,
                price_dollar: wcReturnRequisitionDetails.priceDollar,
                statement: wcReturnRequisitionDetails.statement
            },
                {
                    id: wcReturnRequisitionDetails.id
                })
        )
        await Promise.all(callArray)

        // let currentQuantity = waResult[0].current_quantity
        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(wcReturnRequisitionDetails.quantity)
        let defferenceQuantity = 0

        // Check Quantity
        if (newQuantity > oldQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

            // we will decrement current quantity from store (wa Yarn) by following Steps :
            // Step 1 => Check If has current quantity in store (wa Yarn)
            const sumCurrentQuantityWa = await wcService.selectSumCurrentQuantityByFabricAndSupplier(isFound[0].warehouse_id, isFound[0].fabric_id, isFound[0].consigment_manufacturing_id, wcReturnRequisitionDetails.supplierId)
            if (sumCurrentQuantityWa[0] != null) {
                const sumCurrentQuantity = sumCurrentQuantityWa[0].current_quantity
                if (sumCurrentQuantity >= defferenceQuantity) {

                    // Step 2 => Increment quantity in  wc_return_requisition_details
                    await wcReturnRequisitionDetailsQueries.update({
                        quantity: oldQuantity + defferenceQuantity
                    }, {
                        id: wcReturnRequisitionDetails.id
                    })

                    // Step 3 => select from (WA Yarn) Records for decrement current quantity
                    const wcRecords = await wcService.selectByFabricForReturn(isFound[0].warehouse_id, isFound[0].fabric_id, isFound[0].consigment_manufacturing_id, wcReturnRequisitionDetails.supplierId)
                    if (wcRecords[0] != null) {
                        for (let i = 0; i < wcRecords.length; i++) {
                            const wcRecord = wcRecords[i];
                            let currentQuantity = wcRecord.current_quantity
                            let updatedQuantity = 0

                            // decrement Wa Yarn CurrentQuantity
                            let returnedQuantityObj = await wcService.decrementWcCurrentQuantity(defferenceQuantity, currentQuantity, wcRecord, updatedQuantity);
                            defferenceQuantity = returnedQuantityObj.newQuantity
                            updatedQuantity = returnedQuantityObj.updatedQuantity

                            // Step 4 => Check if wc_id existed in wc_return_requisition_details_wc
                            // that has same wc_return_requisition_details_id
                            const isExisitId = await wcReturnRequisitionDetailsWcService.select({
                                wc_return_requisition_details_id: wcReturnRequisitionDetails.id,
                                wc_id: wcRecord.id
                            })

                            if (isExisitId[0] != null) {
                                // Step 4.1 => Update Quantity in wc_return_requisition_details_wc
                                updateResults = await wcReturnRequisitionDetailsWcQueries.update({
                                    quantity: isExisitId[0].quantity + updatedQuantity
                                }, {
                                    wc_return_requisition_details_id: wcReturnRequisitionDetails.id,
                                    wc_id: isExisitId[0].wc_id
                                })
                            } else {
                                // Step 4.2 Add Record in wc_return_requisition_details_wc
                                updateResults = await wcReturnRequisitionDetailsWcService.create(wcReturnRequisitionDetails, {
                                    wcReturnRequisitionDetailsId: wcReturnRequisitionDetails.id,
                                    wcId: wcRecord.id,
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

            // Step 1 => Decrement quantity in  wc_return_requisition_details
            await wcReturnRequisitionDetailsQueries.update({
                quantity: oldQuantity - defferenceQuantity
            }, {
                id: wcReturnRequisitionDetails.id
            })

            // Step 2 => Select From wc_return_requisition_details_wc Records
            let whereCluseDetailsWc = {};
            whereCluseDetailsWc[`${wcReturnRequisitionDetailsWcTableName}.wc_return_requisition_details_id`] = wcReturnRequisitionDetails.id;
            whereCluseDetailsWc[`${wcReturnRequisitionDetailsWcTableName}.is_deleted`] = 0;
            whereCluseDetailsWc[`${wcReturnRequisitionDetailsWcTableName}.is_active`] = 1;
            const wcReturnRequisitionDetailsWcRecords = await wcReturnRequisitionDetailsWcService.selectWithTwoCondition(whereCluseDetailsWc,
                ["quantity", ">", "0"])
            if (wcReturnRequisitionDetailsWcRecords[0] != null) {
                for (let j = 0; j < wcReturnRequisitionDetailsWcRecords.length; j++) {
                    const wcReturnRequisitionDetailsWcRecord = wcReturnRequisitionDetailsWcRecords[j];
                    let wcReturnRequisitionDetailsWcQuantity = wcReturnRequisitionDetailsWcRecord.quantity
                    let updatedQuantity = 0

                    if (wcReturnRequisitionDetailsWcQuantity >= defferenceQuantity) {
                        // Decrement wc_return_requisition_details_wc quantity
                        await wcReturnRequisitionDetailsWcQueries.update({
                            quantity: wcReturnRequisitionDetailsWcQuantity - defferenceQuantity
                        }, {
                            wc_return_requisition_details_id: wcReturnRequisitionDetails.id,
                            wc_id: wcReturnRequisitionDetailsWcRecord.wc_id
                        })
                        updatedQuantity = defferenceQuantity
                        defferenceQuantity = 0
                    } else {
                        // Decrement wc_return_requisition_details_wc quantity
                        await wcReturnRequisitionDetailsWcQueries.update({
                            quantity: 0
                        }, {
                            wc_return_requisition_details_id: wcReturnRequisitionDetails.id,
                            wc_id: wcReturnRequisitionDetailsWcRecord.wc_id
                        })
                        updatedQuantity = wcReturnRequisitionDetailsWcQuantity
                        defferenceQuantity = parseFloat((defferenceQuantity - wcReturnRequisitionDetailsWcQuantity).toFixed(3))
                    }

                    // select wc Fabric record
                    const wcRecord = await wcQueries.selectOne({
                        id: wcReturnRequisitionDetailsWcRecord.wc_id
                    })
                    if (wcRecord[0] != null) {
                        const oldCurrentQuantity = wcRecord[0].current_quantity

                        // Increment wc current_quantity
                        await wcQueries.update({
                            current_quantity: oldCurrentQuantity + updatedQuantity
                        }, {
                            id: wcRecord[0].id
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
