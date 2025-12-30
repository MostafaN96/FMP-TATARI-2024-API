// Queries
const waAddRequisitionDetailsQueries = require("../../db/queries/wa/wa-add-requisition-details");
const waAddRequisitionQueries = require("../../db/queries/wa/wa-add-requisition");
const consigmentYarnQueries = require("../../db/queries/general/consigment-yarn");
const yarnLotQueries = require("../../db/queries/general/yarn-lot");
const waQueries = require("../../db/queries/wa/wa");
const waPurchaseOrderDetailsQueries = require("../../db/queries/wa/wa-purchase-order-details");
const waAddRequisitionDetailsPurchaseOrderQueries = require("../../db/queries/wa/wa-add-requisition-details-purchase-order");
const waYarnOrderRequisitionDetailsQueries = require("../../db/queries/wa/wa-yarn-order-requisition-details");
const waReconciliationRequisitionDetailsQueries = require("../../db/queries/wa/wa-reconciliation-requisition-details");
const waTransitionBetweenWHRequisitionDetailsQueries = require("../../db/queries/wa/wa-transition-between-wh-requisition-details");
const wbTransportWaWbDetailsQueries = require("../../db/queries/wb/wb-transport-wa-wb-details");
const waAddRequisitionDetailsYarnOrderQueries = require("../../db/queries/wa/wa-add-requisition-details-yarn-order");
const wbManufacturingInputOutputQueries = require("../../db/queries/wb/wb-manufacturing-input-output");
const wbManufacturingInputQueries = require("../../db/queries/wb/wb-manufacturing-input");
const waAddPurchaseOrderQueries = require("../../db/queries/wa/wa-purchase-order-details");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");

// Services
const waService = require("./wa");
const waPurchaseOrderDetailsService = require("./wa-purchase-order-details");
const waAddRequisitionDetailsPurchaseOrderService = require("./wa-add-requisition-details-purchase-order");
const waAddRequisitionDetailsYarnOrderService = require("./wa-add-requisition-details-yarn-order");
const wbManufacturingOutputService = require("../wb/wb-manufacturing-output");
const waYarnOrderRequisitionDetailsService = require("./wa-yarn-order-requisition-details");

const { waPurchaseOrderDetailsTableName, waTableName, waAddRequisitionDetailsTableName,
  waAddRequisitionDetailsPurchaseOrderTableName,
  waYarnOrderRequisitionTableName,
  waYarnOrderRequisitionDetailsTableName, 
  waAddRequisitionDetailsYarnOrderTableName,
  wbManufacturingInputOutputTableName,
  wbTransportWaWbDetailsTableName} = require("../../util/database-tables-name");

exports.create = async (waAddRequisitionDetails, isOrder) => {
  for (let i = 0; i < waAddRequisitionDetails.items.length; i++) {
    waAddRequisitionDetails.waRequisitionDetailsId = trans.transform();
    // waAddRequisitionDetails.items[i].consigmentYarnNumber = waAddRequisitionDetails.items[i].consigmentYarnNumber + "-" + waAddRequisitionDetails.supplierName
    waAddRequisitionDetails.items[i].consigmentYarnNumber = waAddRequisitionDetails.items[i].consigmentYarnNumber

    waAddRequisitionDetails.items[i].consigmentYarnId = trans.transform();
    // Check Consigment Yarn Dupplication
    const selectConsigmentYarnOneResult = await consigmentYarnQueries.selectOne({ number: waAddRequisitionDetails.items[i].consigmentYarnNumber })
    if (selectConsigmentYarnOneResult[0] != null) {
      waAddRequisitionDetails.items[i].consigmentYarnId = selectConsigmentYarnOneResult[0].id;
    } else {
      await consigmentYarnQueries.insertForAddByOrder(waAddRequisitionDetails, waAddRequisitionDetails.items[i]);
    }

    // Check Yarn Lot Dupplication
    waAddRequisitionDetails.items[i].yarnLotId = trans.transform();
    const selectYarnLotOneResult = await yarnLotQueries.selectOne({
      code: waAddRequisitionDetails.items[i].yarnLotCode,
      yarn_id: waAddRequisitionDetails.items[i].yarnId
    })
    if (selectYarnLotOneResult[0] != null) {
      waAddRequisitionDetails.items[i].yarnLotId = selectYarnLotOneResult[0].id;
    } else {
      await yarnLotQueries.insertForDynamic(waAddRequisitionDetails, waAddRequisitionDetails.items[i]);
    }

    const results = await waAddRequisitionDetailsQueries.insert(waAddRequisitionDetails, waAddRequisitionDetails.items[i]);
    if (!results) {
      return constants.insertError;
    } else {
      waAddRequisitionDetails.waAddRequisitionId = waAddRequisitionDetails.id
      await waService.create(waAddRequisitionDetails, waAddRequisitionDetails.items[i])
      if (isOrder) {
        await this.createOrder(waAddRequisitionDetails, waAddRequisitionDetails.items[i])

        // select yarn order requisitions by order requisitions
        // console.log("waAddRequisitionDetails.orderId ::: ", waAddRequisitionDetails.orderId);

        for (let j = 0; j < waAddRequisitionDetails.orderId.length; j++) {
          const orderElement = waAddRequisitionDetails.orderId[j];

          let waYarnOrderRequisitionDetailsWhereCluse = {};
          waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
          waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
          waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_order`] = 1;
          waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.orders_requisitions_id`] = orderElement.ordersRequisitionsId;
          waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.yarn_id`] = waAddRequisitionDetails.items[i].yarnId;

          const selectYarnOrderRequisitionDetailsResult = await waYarnOrderRequisitionDetailsQueries.selectByRequisitionId(waYarnOrderRequisitionDetailsWhereCluse)
          if (Array.isArray(selectYarnOrderRequisitionDetailsResult) && selectYarnOrderRequisitionDetailsResult.length > 0) {
            for (let f = 0; f < selectYarnOrderRequisitionDetailsResult.length; f++) {
              const yarnOrderRequisitionDetailsElement = selectYarnOrderRequisitionDetailsResult[f];

              await waAddRequisitionDetailsYarnOrderService.create({ ...yarnOrderRequisitionDetailsElement, ...waAddRequisitionDetails }, orderElement)
            }
          } else {
            orderElement.waYarnOrderRequisitionDetailsId = trans.transform();
            let waYarnOrderRequisitionDetailsOneWhereCluse = {};
            waYarnOrderRequisitionDetailsOneWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
            waYarnOrderRequisitionDetailsOneWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
            waYarnOrderRequisitionDetailsOneWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_order`] = 1;
            waYarnOrderRequisitionDetailsOneWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.orders_requisitions_id`] = orderElement.ordersRequisitionsId;
          
            const selectOneYarnOrderRequisitionDetailsResult = await waYarnOrderRequisitionDetailsQueries.selectOneForUpdate(waYarnOrderRequisitionDetailsOneWhereCluse)
            if (Array.isArray(selectOneYarnOrderRequisitionDetailsResult) && selectOneYarnOrderRequisitionDetailsResult.length > 0) {
              orderElement.waYarnOrderRequisitionId = selectOneYarnOrderRequisitionDetailsResult[0].wa_yarn_order_requisition_id

              const addWaYarnOrderRequisitionDetailsResult = await waYarnOrderRequisitionDetailsQueries.insertForPurchaseOrder(waAddRequisitionDetails, orderElement, waAddRequisitionDetails.items[i])
              if(addWaYarnOrderRequisitionDetailsResult) {
                let waYarnOrderRequisitionDetailsWhereCluse = {};
                waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
                waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
                waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_order`] = 1;
                waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.orders_requisitions_id`] = orderElement.ordersRequisitionsId;
                waYarnOrderRequisitionDetailsWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.yarn_id`] = waAddRequisitionDetails.items[i].yarnId;
  
                const selectYarnOrderRequisitionDetailsResult = await waYarnOrderRequisitionDetailsQueries.selectByRequisitionId(waYarnOrderRequisitionDetailsWhereCluse)
                if (Array.isArray(selectYarnOrderRequisitionDetailsResult) && selectYarnOrderRequisitionDetailsResult.length > 0) {
                  for (let k = 0; f < selectYarnOrderRequisitionDetailsResult.length; k++) {
                    const yarnOrderRequisitionDetailsElement = selectYarnOrderRequisitionDetailsResult[k];
  
                    await waAddRequisitionDetailsYarnOrderService.create({ ...yarnOrderRequisitionDetailsElement, ...waAddRequisitionDetails }, orderElement)
  
                  }
                }
              }
            }

          }
          
        }

      }
    }
  }
  return { ...constants.insertSuccess, ...{ id: waAddRequisitionDetails.id } };
};

// Order Function
exports.createOrder = async (waAddRequisitionDetails, item) => {
  await waAddRequisitionDetailsPurchaseOrderService.create(waAddRequisitionDetails, item)

  let whereCluse = {};
  whereCluse[`${waPurchaseOrderDetailsTableName}.id`] = item.orderDetailsId;
  let selectPurchaseOrderDetailsOneResult = await waPurchaseOrderDetailsQueries.selectOne(whereCluse)

  if (selectPurchaseOrderDetailsOneResult[0].current_quantity >= parseFloat(item.quantity)) {
    await waPurchaseOrderDetailsQueries.update({
      current_quantity: selectPurchaseOrderDetailsOneResult[0].current_quantity - parseFloat(item.quantity)
    }, {
      id: item.orderDetailsId
    })
  } else {
    let excessQuantity = parseFloat((item.quantity - selectPurchaseOrderDetailsOneResult[0].current_quantity).toFixed(3))
    await waPurchaseOrderDetailsQueries.update({
      // initial_quantity: selectPurchaseOrderDetailsOneResult[0].initial_quantity + excessQuantity,
      // current_quantity: 0,
      // is_order: "0"
      current_quantity: selectPurchaseOrderDetailsOneResult[0].current_quantity - parseFloat(item.quantity),
      is_order: "0"
    }, {
      id: item.orderDetailsId
    })
  }
  return
};

exports.selectByRequisitionId = async (requisitionId) => {
  // check is found
  const isFound = await waAddRequisitionQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: requisitionId,
  });
  if (isFound[0] != null) {

    const results = await waAddRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
    return results;
  } else {
    return constants.itemNotFound;
  }
};

exports.selectByRequisitionIdForOrder = async (requisitionId) => {
  // check is found
  const isFound = await waAddRequisitionQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: requisitionId,
  });
  if (isFound[0] != null) {

    const results = await waAddRequisitionDetailsQueries.selectByRequisitionIdForOrder(requisitionId);
    if (Array.isArray(results) && results.length > 0) {
                let orders = []
                for (let i = 0; i < 1; i++) {
                    const element = results[i];

                    const data = await waYarnOrderRequisitionDetailsService.selectByRequisitionIdOpenedOrderForWaAddRequisition(element.id)
                    orders.push(...data)
                }                
                results[0].orders = orders
            }
                            console.log(results);

    return results;
  } else {
    return constants.itemNotFound;
  }
};

exports.update = async (waAddRequisitionDetails) => {
  // Array for Promise
  let callArray = []

  // Check is found
  const isFound = await waAddRequisitionDetailsQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: waAddRequisitionDetails.id
  });
  if (isFound[0] != null) {
    let updateResults = false

    // Select Wa Yarn
    const waResult = await waQueries.selectOne({
      ...constantsPayloads.deletePayload,
      wa_add_requisition_details_id: waAddRequisitionDetails.id
    });
    if (waResult[0] != null) {
      waAddRequisitionDetails.waAddRequisitionId = isFound[0].wa_add_requisition_id

      // Update wa Yarn add requisition Without Quantity
      callArray.push(waAddRequisitionQueries.update({
        date: waAddRequisitionDetails.date,
        note: waAddRequisitionDetails.note
      },
        {
          id: waAddRequisitionDetails.waAddRequisitionId
        }))


      // Update wa Yarn add requisition details Without Quantity
      callArray.push(
        waAddRequisitionDetailsQueries.update({
          price: waAddRequisitionDetails.price,
          price_dollar: waAddRequisitionDetails.priceDollar,
          document: waAddRequisitionDetails.document,
          statement: waAddRequisitionDetails.statement
        },
          {
            id: waAddRequisitionDetails.id
          })
      )
      await Promise.all(callArray)

      let currentQuantity = waResult[0].current_quantity
      let oldQuantity = isFound[0].quantity
      let newQuantity = waAddRequisitionDetails.quantity
      let defferenceQuantity = 0


      // Check Quantity
      if (newQuantity > oldQuantity) {
        defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

        // Update wa yarn add requisition details Quantity
        updateResults = await waAddRequisitionDetailsQueries.update({
          quantity: oldQuantity + defferenceQuantity
        },
          {
            id: waAddRequisitionDetails.id
          })

        // Update wa yarn current quantity
        updateResults = await waQueries.update({
          current_quantity: currentQuantity + defferenceQuantity
        },
          {
            id: waResult[0].id
          })

      } else if (newQuantity < oldQuantity) {
        defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

        // Check Quantity in Wa yarn Store
        if (currentQuantity >= defferenceQuantity) {
          // Update wa yarn add requisition details Quantity
          updateResults = await waAddRequisitionDetailsQueries.update({
            quantity: oldQuantity - defferenceQuantity
          },
            {
              id: waAddRequisitionDetails.id
            })

          // Update wa yarn current quantity
          updateResults = await waQueries.update({
            current_quantity: currentQuantity - defferenceQuantity
          },
            {
              id: waResult[0].id
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


exports.updateForOrder = async (waAddRequisitionDetails) => {

  // Check is found
  let whereCluse = {};
  whereCluse[`${waAddRequisitionDetailsTableName}.id`] = waAddRequisitionDetails.id;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${waAddRequisitionDetailsTableName}.is_active`] = 1;
  const isFound = await waAddRequisitionDetailsQueries.selectOne(whereCluse);
  if (isFound[0] != null) {
    let updateResults = false

    waAddRequisitionDetails.waAddRequisitionId = isFound[0].wa_add_requisition_id

    // Update wa Yarn add requisition Without Quantity
    await waAddRequisitionQueries.update({
      date: waAddRequisitionDetails.date,
      note: waAddRequisitionDetails.note
    },
      {
        id: waAddRequisitionDetails.waAddRequisitionId
      })

    // Update wa Add Requisition Details Without Quantity
    await waAddRequisitionDetailsQueries.update({
      price: waAddRequisitionDetails.price,
      price_dollar: waAddRequisitionDetails.priceDollar,
      document: waAddRequisitionDetails.document,
      statement: waAddRequisitionDetails.statement
    },
      {
        id: waAddRequisitionDetails.id
      })      

    // we will select current quantity from store (wa) by following Steps :
    let wcWhereCluse = {};
    wcWhereCluse[`${waTableName}.wa_add_requisition_details_id`] = waAddRequisitionDetails.id;
    wcWhereCluse[`${waTableName}.is_deleted`] = 0;
    wcWhereCluse[`${waTableName}.is_active`] = 1;
    const selectWaOneResult = await waQueries.selectOne(wcWhereCluse)
    if (selectWaOneResult[0] != null) {
      let waAddRequisitionDetailsPurchaseOrderWhereCluse = {};
      waAddRequisitionDetailsPurchaseOrderWhereCluse[`${waAddRequisitionDetailsPurchaseOrderTableName}.wa_add_requisition_details_id`] = waAddRequisitionDetails.id;
      waAddRequisitionDetailsPurchaseOrderWhereCluse[`${waAddRequisitionDetailsPurchaseOrderTableName}.is_deleted`] = 0;
      waAddRequisitionDetailsPurchaseOrderWhereCluse[`${waAddRequisitionDetailsPurchaseOrderTableName}.is_active`] = 1;
      const selectWaAddRequisitionDetailsPurchaseOrderOneResult = await waAddRequisitionDetailsPurchaseOrderQueries.selectOne(waAddRequisitionDetailsPurchaseOrderWhereCluse)
      if (selectWaAddRequisitionDetailsPurchaseOrderOneResult[0] != null) {
        console.log("ssss ::::::: ", selectWaAddRequisitionDetailsPurchaseOrderOneResult);
        
        // update prices waAddRequisitionDetailsPurchaseOrderQueries
        await updatePrices(waAddRequisitionDetails, selectWaAddRequisitionDetailsPurchaseOrderOneResult, isFound);

        let waPurchaseOrderDetailsWhereCluse = {};
        waPurchaseOrderDetailsWhereCluse[`${waPurchaseOrderDetailsTableName}.id`] = selectWaAddRequisitionDetailsPurchaseOrderOneResult[0].wa_add_purchase_order_details_id;
        waPurchaseOrderDetailsWhereCluse[`${waPurchaseOrderDetailsTableName}.is_deleted`] = 0;
        waPurchaseOrderDetailsWhereCluse[`${waPurchaseOrderDetailsTableName}.is_active`] = 1;
        const selectWaPurchaseOrderDetailsOneResult = await waPurchaseOrderDetailsQueries.selectOne(waPurchaseOrderDetailsWhereCluse)
        if (selectWaPurchaseOrderDetailsOneResult[0] != null) {

          const currentQuantity = selectWaOneResult[0].current_quantity

          let oldQuantity = isFound[0].quantity
          let newQuantity = parseFloat(waAddRequisitionDetails.quantity)
          let defferenceQuantity = 0

          // Check Quantity
          if (newQuantity > oldQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

            // Step 1 => Increment quantity in  wa
            await waQueries.update({
              current_quantity: currentQuantity + defferenceQuantity
            }, {
              id: selectWaOneResult[0].id
            })

            // Step 2 => Increment quantity in  wa Add Requisition Details
            await waAddRequisitionDetailsQueries.update({
              quantity: isFound[0].quantity + defferenceQuantity
            }, {
              id: waAddRequisitionDetails.id
            })

            // Step 3 => Increment quantity in wa_add_requisition_details_yarn_order
            await waAddRequisitionDetailsPurchaseOrderQueries.update({
              quantity: selectWaAddRequisitionDetailsPurchaseOrderOneResult[0].quantity + defferenceQuantity
            }, {
              wa_add_purchase_order_details_id: selectWaAddRequisitionDetailsPurchaseOrderOneResult[0].wa_add_purchase_order_details_id,
              wa_add_requisition_details_id: waAddRequisitionDetails.id
            })

            // Check Valid Current Quantity
            if (selectWaPurchaseOrderDetailsOneResult[0].current_quantity >= defferenceQuantity) {
              // Step 4 => Decrement current_quantity in wa_yarn_order_requisition_details
              await waPurchaseOrderDetailsQueries.update({
                initial_quantity: selectWaPurchaseOrderDetailsOneResult[0].initial_quantity + defferenceQuantity,
                current_quantity: selectWaPurchaseOrderDetailsOneResult[0].current_quantity + defferenceQuantity
              }, {
                id: selectWaPurchaseOrderDetailsOneResult[0].id
              })
            } else {
              // Step 4 => Increment initial_quantity and Decrement current_quantity in wa_yarn_order_requisition_details
              await waPurchaseOrderDetailsQueries.update({
                initial_quantity: selectWaPurchaseOrderDetailsOneResult[0].initial_quantity + defferenceQuantity,
                current_quantity: selectWaPurchaseOrderDetailsOneResult[0].current_quantity - defferenceQuantity
              }, {
                id: selectWaPurchaseOrderDetailsOneResult[0].id
              })
            }

            updateResults = true
          } else if (newQuantity < oldQuantity) {
            defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

            // Check if has enough current quantity in wa
            if (currentQuantity >= defferenceQuantity) {

              // Step 1 => Decrement quantity in  waAddRequisitionDetails
              await waAddRequisitionDetailsQueries.update({
                quantity: oldQuantity - defferenceQuantity
              }, {
                id: waAddRequisitionDetails.id
              })

              // Step 2 => Decrement quantity in  wa
              await waQueries.update({
                current_quantity: currentQuantity - defferenceQuantity
              }, {
                id: selectWaOneResult[0].id
              })

              // Step 3 => Increment quantity in wa_add_requisition_details_yarn_order
              await waAddRequisitionDetailsPurchaseOrderQueries.update({
                quantity: selectWaAddRequisitionDetailsPurchaseOrderOneResult[0].quantity - defferenceQuantity
              }, {
                wa_add_purchase_order_details_id: selectWaAddRequisitionDetailsPurchaseOrderOneResult[0].wa_add_purchase_order_details_id,
                wa_add_requisition_details_id: waAddRequisitionDetails.id
              })
              // Step 4 => Increment current_quantity in  wa_yarn_order_requisition_details
              await waPurchaseOrderDetailsQueries.update({
                initial_quantity: selectWaPurchaseOrderDetailsOneResult[0].initial_quantity - defferenceQuantity,
                current_quantity: selectWaPurchaseOrderDetailsOneResult[0].current_quantity - defferenceQuantity
              }, {
                id: selectWaPurchaseOrderDetailsOneResult[0].id
              })

              updateResults = true
            } else {
              return {
                ...constants.wrongQuantity,
                spentQuantity: currentQuantity,
                newQuantity: defferenceQuantity
              }
            }
          } else {
            updateResults = true
          }
        } else {
          return constants.itemNotFound;
        }
      } else {
        return constants.itemNotFound;
      }
    } else {
      return {
        ...constants.wrongQuantity,
        spentQuantity: 0,
        newQuantity: defferenceQuantity
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

async function updatePrices(waAddRequisitionDetails, selectWaAddRequisitionDetailsPurchaseOrderOneResult, isFound) {
  await waAddPurchaseOrderQueries.update({
    price: waAddRequisitionDetails.price,
    price_dollar: waAddRequisitionDetails.priceDollar,
  },
    {
      id: selectWaAddRequisitionDetailsPurchaseOrderOneResult[0].wa_add_purchase_order_details_id
    });

  let waAddRequisitionDetailsYarnOrderWhereCluse = {};
  waAddRequisitionDetailsYarnOrderWhereCluse[`${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`] = waAddRequisitionDetails.id;
  waAddRequisitionDetailsYarnOrderWhereCluse[`${waYarnOrderRequisitionDetailsTableName}.yarn_id`] = isFound[0].yarn_id;
  const selectWaAddRequisitionDetailsYarnOrderOneResult = await waAddRequisitionDetailsYarnOrderQueries.selectDetails(waAddRequisitionDetailsYarnOrderWhereCluse);
  if (selectWaAddRequisitionDetailsYarnOrderOneResult[0] != null) {

    //
    await waReconciliationRequisitionDetailsQueries.update({
      price: waAddRequisitionDetails.price,
      price_dollar: waAddRequisitionDetails.priceDollar,
    }, {
      wa_yarn_order_requisition_details_id: selectWaAddRequisitionDetailsYarnOrderOneResult[0].wa_yarn_order_requisition_details_id,
      yarn_id: isFound[0].yarn_id
    });

    //
    await waTransitionBetweenWHRequisitionDetailsQueries.update({
      price: waAddRequisitionDetails.price,
      price_dollar: waAddRequisitionDetails.priceDollar,
    }, {
      wa_yarn_order_requisition_details_id: selectWaAddRequisitionDetailsYarnOrderOneResult[0].wa_yarn_order_requisition_details_id,
      yarn_id: isFound[0].yarn_id
    });

    //
    await wbTransportWaWbDetailsQueries.update({
      price: waAddRequisitionDetails.price,
      price_dollar: waAddRequisitionDetails.priceDollar,
    }, {
      from_wa_yarn_order_requisition_details_id: selectWaAddRequisitionDetailsYarnOrderOneResult[0].wa_yarn_order_requisition_details_id,
      yarn_id: isFound[0].yarn_id
    });

    let wbTransportWaWbDetailsWhereCluse = {};
    wbTransportWaWbDetailsWhereCluse[`${wbTransportWaWbDetailsTableName}.from_wa_yarn_order_requisition_details_id`] = selectWaAddRequisitionDetailsYarnOrderOneResult[0].wa_yarn_order_requisition_details_id;
    wbTransportWaWbDetailsWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = isFound[0].yarn_id;
    const selectWbTransportWaWbDetailsOneResult = await wbTransportWaWbDetailsQueries.selectByRequisitionId(wbTransportWaWbDetailsWhereCluse);
    if (selectWbTransportWaWbDetailsOneResult[0] != null) {
      for (let k = 0; k < selectWbTransportWaWbDetailsOneResult.length; k++) {
        const selectWbTransportWaWbDetailsRecord = selectWbTransportWaWbDetailsOneResult[k];

        //
        let wbManufacturingInputOutputWhereCluse = {};
        wbManufacturingInputOutputWhereCluse[`${wbManufacturingInputOutputTableName}.wa_yarn_order_requisition_details_id`] = selectWbTransportWaWbDetailsRecord.wa_yarn_order_requisition_details_id;
        const selectWbManufacturingInputOutputResult = await wbManufacturingInputOutputQueries.select(wbManufacturingInputOutputWhereCluse);

        if (selectWbManufacturingInputOutputResult[0] != null) {

          for (let i = 0; i < selectWbManufacturingInputOutputResult.length; i++) {
            const element = selectWbManufacturingInputOutputResult[i];

            await wbManufacturingInputQueries.update({
              price: waAddRequisitionDetails.price,
              price_dollar: waAddRequisitionDetails.priceDollar,
            }, {
              id: element.wb_manufacturing_input_id,
            });

            //
            await wbManufacturingOutputService.calcFabricPrice(element.wb_manufacturing_output_id);

          }

        }
      }

    }

  }
}
