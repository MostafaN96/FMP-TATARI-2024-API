// Queries
const wcAddRequisitionDetailsQueries = require("../../db/queries/wc/wc-add-requisition-details");
const wcAddRequisitionQueries = require("../../db/queries/wc/wc-add-requisition");
const wcQueries = require("../../db/queries/wc/wc");
const consigmentManufacturingQueries = require("../../db/queries/general/consigment-manufacturing");
const wcFabricOrderRequisitionDetailsQueries = require("../../db/queries/wc/wc-fabric-order-requisition-details");

// Services
const wcService = require("./wc");
const wcAddRequisitionDetailsFabricOrderService = require("./wc-add-requisition-details-fabric-order");
const wcFabricOrderRequisitionDetailsService = require("./wc-fabric-order-requisition-details");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { 
    wcFabricOrderRequisitionDetailsTableName 
} = require("../../util/database-tables-name");

exports.create = async (wcAddRequisitionDetails, isOrder) => {
    for (let i = 0; i < wcAddRequisitionDetails.items.length; i++) {
        console.log("wcAddRequisitionDetails.items.length ::: ", wcAddRequisitionDetails.items.length);
        
        wcAddRequisitionDetails.wcRequisitionDetailsId = trans.transform();
                
        // Add Consigment
        console.log("wcAddRequisitionDetails.items[i].isNewConsigment ::: ", wcAddRequisitionDetails.items[i].isNewConsigment);
        if (wcAddRequisitionDetails.items[i].isNewConsigment) {
            console.log("wcAddRequisitionDetails.items[i].isNewConsigment ---- inside");
            
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
        console.log("results ::::, i ::::", results + " ::: i ::: " + i);
        
        if (!results) {
            return constants.insertError;
        } else {
            await wcService.create(wcAddRequisitionDetails, wcAddRequisitionDetails.items[i])
            if (isOrder) {
            console.log("if (isOrder) ::: ", isOrder);

        for (let j = 0; j < wcAddRequisitionDetails.ordersRequisitionsItems.length; j++) {
            const orderElement = wcAddRequisitionDetails.ordersRequisitionsItems[j];            
  
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
            }  else {
                orderElement.wcFabricOrderRequisitionDetailsId = trans.transform();
                let wcFabricOrderRequisitionDetailsOneWhereCluse = {};
                wcFabricOrderRequisitionDetailsOneWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
                wcFabricOrderRequisitionDetailsOneWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
                wcFabricOrderRequisitionDetailsOneWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;
                wcFabricOrderRequisitionDetailsOneWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`] = orderElement.ordersRequisitionsId;
              
                const selectOneFabricOrderRequisitionDetailsResult = await wcFabricOrderRequisitionDetailsQueries.selectOneForUpdate(wcFabricOrderRequisitionDetailsOneWhereCluse)
                if (Array.isArray(selectOneFabricOrderRequisitionDetailsResult) && selectOneFabricOrderRequisitionDetailsResult.length > 0) {
                  orderElement.wcFabricOrderRequisitionId = selectOneFabricOrderRequisitionDetailsResult[0].wc_fabric_order_requisition_id
    
                  const addWcFabricOrderRequisitionDetailsResult = await wcFabricOrderRequisitionDetailsQueries.insertForPurchaseOrder(wcAddRequisitionDetails, orderElement, wcAddRequisitionDetails.items[i])
                  if(addWcFabricOrderRequisitionDetailsResult) {
                    let wcFabricOrderRequisitionDetailsWhereCluse = {};
                    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
                    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
                    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;
                    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`] = orderElement.ordersRequisitionsId;
                    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.fabric_id`] = wcAddRequisitionDetails.items[i].fabricId;
      
                    const selecFabricOrderRequisitionDetailsResult = await wcFabricOrderRequisitionDetailsQueries.selectByRequisitionId(wcFabricOrderRequisitionDetailsWhereCluse)
                    if (Array.isArray(selecFabricOrderRequisitionDetailsResult) && selecFabricOrderRequisitionDetailsResult.length > 0) {
                      for (let k = 0; k < selecFabricOrderRequisitionDetailsResult.length; k++) {
                        const fabricOrderRequisitionDetailsElement = selecFabricOrderRequisitionDetailsResult[k];
      
                        await wcAddRequisitionDetailsFabricOrderService.create({ ...fabricOrderRequisitionDetailsElement, ...wcAddRequisitionDetails }, orderElement)
      
                      }
                    }
                  }
                }
    
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
        if (Array.isArray(results) && results.length > 0) {
            let orders = []
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                const ordersResult = await wcFabricOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrderForWcAddRequisition(element.id)
                orders.push(ordersResult)
            }                        
            results[0].orders = orders[0]
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectByRequisitionIdForOrder = async (requisitionId) => {
    // check is found
    const isFound = await wcAddRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await wcAddRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        if (Array.isArray(results) && results.length > 0) {
            let orders = []
            for (let i = 0; i < results.length; i++) {
                const element = results[i];
                const ordersResult = await wcFabricOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrderForWcAddRequisition(element.id)
                orders.push(ordersResult)
            }                        
            results[0].orders = orders[0]
        }
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