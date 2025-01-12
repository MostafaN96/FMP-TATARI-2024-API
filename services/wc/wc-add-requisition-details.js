// Queries
const wcAddRequisitionDetailsQueries = require("../../db/queries/wc/wc-add-requisition-details");
const wcAddRequisitionQueries = require("../../db/queries/wc/wc-add-requisition");
const wcQueries = require("../../db/queries/wc/wc");
const consigmentManufacturingQueries = require("../../db/queries/general/consigment-manufacturing");
const wcFabricOrderRequisitionDetailsQueries = require("../../db/queries/wc/wc-fabric-order-requisition-details");

// Services
const wcService = require("./wc");
const wcAddRequisitionDetailsFabricOrderService = require("./wc-add-requisition-details-fabric-order");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { 
    wcFabricOrderRequisitionDetailsTableName 
} = require("../../util/database-tables-name");

exports.create = async (wcAddRequisitionDetails) => {
    for (let i = 0; i < wcAddRequisitionDetails.items.length; i++) {
        wcAddRequisitionDetails.wcRequisitionDetailsId = trans.transform();

        // Add Consigment
        if (wcAddRequisitionDetails.items[i].isNewConsigment) {
            wcAddRequisitionDetails.items[i].consigmentManufacturingId = trans.transform();
            wcAddRequisitionDetails.items[i].personid = wcAddRequisitionDetails.personid
            wcAddRequisitionDetails.items[i].ipaddress = wcAddRequisitionDetails.ipaddress
            // Check Consigment Manufacturing Dupplication
            const selectConsigmentManufacturingOneResult = await consigmentManufacturingQueries.selectOne({ number: wcAddRequisitionDetails.items[i].consigmentNumber })
            if (selectConsigmentManufacturingOneResult[0] != null) {
                wcAddRequisitionDetails.items[i].consigmentManufacturingId = selectConsigmentManufacturingOneResult[0].id;
            }
            await consigmentManufacturingQueries.insertAddWc(wcAddRequisitionDetails, wcAddRequisitionDetails.items[i]);
        }

        // Add wcAddRequisitionDetails
        const results = await wcAddRequisitionDetailsQueries.insert(wcAddRequisitionDetails, wcAddRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            await wcService.create(wcAddRequisitionDetails, wcAddRequisitionDetails.items[i])

            
        for (let j = 0; j < wcAddRequisitionDetails.orderId.length; j++) {
            const orderElement = wcAddRequisitionDetails.orderId[j];
  
            let fabricOrderRequisitionDetailsWhereCluse = {};
            fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
            fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
            fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;
            fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`] = orderElement.ordersRequisitionsId;
            fabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.fabric_id`] = wcAddRequisitionDetails.items[i].fabricId;
  
            const selectFabricOrderRequisitionDetailsResult = await wcFabricOrderRequisitionDetailsQueries.selectByRequisitionId(fabricOrderRequisitionDetailsWhereCluse)
            if (Array.isArray(selectFabricOrderRequisitionDetailsResult) && selectFabricOrderRequisitionDetailsResult.length > 0) {
              for (let f = 0; f < selectFabricOrderRequisitionDetailsResult.length; f++) {
                const fabricOrderRequisitionDetailsElement = selectFabricOrderRequisitionDetailsResult[f];
  
                await wcAddRequisitionDetailsFabricOrderService.create({ ...fabricOrderRequisitionDetailsElement, ...wcAddRequisitionDetails }, orderElement)
  
              }
            }
          }
        }
    }
    return { ...constants.insertSuccess, ...{ id: wcAddRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wcAddRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await wcAddRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (wcAddRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    const isFound = await wcAddRequisitionDetailsQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: wcAddRequisitionDetails.id
    });
    if (isFound[0] != null) {
        let updateResults = false

        // Select Wa Yarn
        const wcResult = await wcQueries.selectOne({
            ...constantsPayloads.deletePayload,
            wc_add_requisition_details_id: wcAddRequisitionDetails.id
        });
        if (wcResult[0] != null) {
            wcAddRequisitionDetails.wcAddRequisitionId = isFound[0].wc_add_requisition_id

            // Update wa Yarn add requisition Without Quantity
            callArray.push(wcAddRequisitionQueries.update({
                date: wcAddRequisitionDetails.date,
                note: wcAddRequisitionDetails.note
            },
                {
                    id: wcAddRequisitionDetails.wcAddRequisitionId
                }))


            // Update wa Yarn add requisition details Without Quantity
            callArray.push(
                wcAddRequisitionDetailsQueries.update({
                    price: wcAddRequisitionDetails.price,
                    price_dollar: wcAddRequisitionDetails.priceDollar,
                    fabric_piece: wcAddRequisitionDetails.numberFabricPieces,
                    document: wcAddRequisitionDetails.document,
                    statement: wcAddRequisitionDetails.statement
                },
                    {
                        id: wcAddRequisitionDetails.id
                    })
            )
            await Promise.all(callArray)

            let currentQuantity = wcResult[0].current_quantity
            let oldQuantity = isFound[0].quantity
            let newQuantity = wcAddRequisitionDetails.quantity
            let defferenceQuantity = 0


            // Check Quantity
            if (newQuantity > oldQuantity) {
                defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                // Update wa yarn add requisition details Quantity
                updateResults = await wcAddRequisitionDetailsQueries.update({
                    quantity: oldQuantity + defferenceQuantity
                },
                    {
                        id: wcAddRequisitionDetails.id
                    })

                // Update wa yarn current quantity
                updateResults = await wcQueries.update({
                    current_quantity: currentQuantity + defferenceQuantity
                },
                    {
                        id: wcResult[0].id
                    })

            } else if (newQuantity < oldQuantity) {
                defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

                // Check Quantity in Wa yarn Store
                if (currentQuantity >= defferenceQuantity) {
                    // Update wa yarn add requisition details Quantity
                    updateResults = await wcAddRequisitionDetailsQueries.update({
                        quantity: oldQuantity - defferenceQuantity
                    },
                        {
                            id: wcAddRequisitionDetails.id
                        })

                    // Update wa yarn current quantity
                    updateResults = await wcQueries.update({
                        current_quantity: currentQuantity - defferenceQuantity
                    },
                        {
                            id: wcResult[0].id
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