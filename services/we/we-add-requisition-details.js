// Queries
const weAddRequisitionDetailsQueries = require("../../db/queries/we/we-add-requisition-details");
const weAddRequisitionQueries = require("../../db/queries/we/we-add-requisition");
const consigmentDyeingQueries = require("../../db/queries/general/consigment-dyeing");
const weQueries = require("../../db/queries/we/we");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");

// Services
const weService = require("./we");

exports.create = async (weAddRequisitionDetails) => {
    for (let i = 0; i < weAddRequisitionDetails.items.length; i++) {
        weAddRequisitionDetails.weRequisitionDetailsId = trans.transform();

        // Check Consigment Dyeing Dupplication
        const selectConsigmentDyeingOneResult = await consigmentDyeingQueries.selectOne({ number: weAddRequisitionDetails.items[i].consigmentDyeingNumber })
        if (Array.isArray(selectConsigmentDyeingOneResult) && selectConsigmentDyeingOneResult.length > 0) {
            weAddRequisitionDetails.items[i].consigmentDyeingId = selectConsigmentDyeingOneResult[0].id;
        } else {
            weAddRequisitionDetails.items[i].consigmentDyeingId = trans.transform();
            await consigmentDyeingQueries.insertForAdd(weAddRequisitionDetails, weAddRequisitionDetails.items[i]);
        }

        // Add weAddRequisitionDetails
        const results = await weAddRequisitionDetailsQueries.insert(weAddRequisitionDetails, weAddRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            await weService.create(weAddRequisitionDetails, weAddRequisitionDetails.items[i])
        }
    }
    return { ...constants.insertSuccess, ...{ id: weAddRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await weAddRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await weAddRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (weAddRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    const isFound = await weAddRequisitionDetailsQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: weAddRequisitionDetails.id
    });
    if (isFound[0] != null) {
        let updateResults = false

        // Select we
        const weResult = await weQueries.selectOne({
            ...constantsPayloads.deletePayload,
            we_add_requisition_details_id: weAddRequisitionDetails.id
        });
        if (weResult[0] != null) {
            weAddRequisitionDetails.weAddRequisitionId = isFound[0].we_add_requisition_id

            // Update we add requisition Without Quantity
            callArray.push(weAddRequisitionQueries.update({
                date: weAddRequisitionDetails.date,
                note: weAddRequisitionDetails.note
            },
                {
                    id: weAddRequisitionDetails.weAddRequisitionId
                }))


            // Update we add requisition details Without Quantity
            callArray.push(
                weAddRequisitionDetailsQueries.update({
                    color_id: weAddRequisitionDetails.colorId,
                    color_category_id: weAddRequisitionDetails.colorCategoryId,
                    color_code: weAddRequisitionDetails.colorCode,
                    dyeing_code: weAddRequisitionDetails.dyeingCode,
                    fabric_piece: weAddRequisitionDetails.numberFabricPieces,
                    price: weAddRequisitionDetails.price,
                    work_order_number: weAddRequisitionDetails.workOrderNumber,
                    document: weAddRequisitionDetails.document,
                    statement: weAddRequisitionDetails.statement
                },
                    {
                        id: weAddRequisitionDetails.id
                    })
            )

            // Update we Without Quantity
            callArray.push(
                weQueries.update({
                    storage_place: weAddRequisitionDetails.storagePlace,
                },
                    {
                        we_add_requisition_details_id: weAddRequisitionDetails.id
                    })
            )
            await Promise.all(callArray)

            let currentQuantity = weResult[0].current_quantity
            let oldQuantity = isFound[0].quantity
            let newQuantity = weAddRequisitionDetails.quantity
            let defferenceQuantity = 0

            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                // Update we add requisition details Quantity
                updateResults = await weAddRequisitionDetailsQueries.update({
                    quantity: oldQuantity + defferenceQuantity
                },
                    {
                        id: weAddRequisitionDetails.id
                    })

                // Update we current quantity
                updateResults = await weQueries.update({
                    current_quantity: currentQuantity + defferenceQuantity
                },
                    {
                        id: weResult[0].id
                    })

            } else if (newQuantity < oldQuantity) {
                defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

                // Check Quantity in we Store
                if (currentQuantity >= defferenceQuantity) {
                    // Update wa yarn add requisition details Quantity
                    updateResults = await weAddRequisitionDetailsQueries.update({
                        quantity: oldQuantity - defferenceQuantity
                    },
                        {
                            id: weAddRequisitionDetails.id
                        })

                    // Update wa yarn current quantity
                    updateResults = await weQueries.update({
                        current_quantity: currentQuantity - defferenceQuantity
                    },
                        {
                            id: weResult[0].id
                        })

                } else {
                    return {
                        ...constants.wrongQuantity,
                        spentQuantity: parseFloat((oldQuantity - currentQuantity).toFixed(3)),
                        newQuantity: newQuantity
                    }
                }

            } else {
                updateResults = true
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
        return constants.itemNotFound;
    }
};