// Queries
const waAddRequisitionDetailsQueries = require("../../db/queries/wa/wa-add-requisition-details");
const waAddRequisitionQueries = require("../../db/queries/wa/wa-add-requisition");
const consigmentYarnQueries = require("../../db/queries/general/consigment-yarn");
const waQueries = require("../../db/queries/wa/wa");
const waYarnOrderRequisitionDetailsQueries = require("../../db/queries/wa/wa-yarn-order-requisition-details");
const waAddRequisitionDetailsYarnOrderQueries = require("../../db/queries/wa/wa-add-requisition-details-yarn-order");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");

// Services
const waService = require("./wa");
const waAddRequisitionDetailsYarnOrderService = require("./wa-add-requisition-details-yarn-order");

const { waYarnOrderRequisitionDetailsTableName, waTableName, waAddRequisitionDetailsTableName } = require("../../util/database-tables-name");

exports.create = async (waAddRequisitionDetails, isOrder) => {
    for (let i = 0; i < waAddRequisitionDetails.items.length; i++) {
        waAddRequisitionDetails.waRequisitionDetailsId = trans.transform();

        waAddRequisitionDetails.items[i].consigmentYarnId = trans.transform();
        // Check Consigment Yarn Dupplication
        const selectConsigmentYarnOneResult = await consigmentYarnQueries.selectOne({ number: waAddRequisitionDetails.items[i].consigmentYarnNumber })
        if (selectConsigmentYarnOneResult[0] != null) {
            waAddRequisitionDetails.items[i].consigmentYarnId = selectConsigmentYarnOneResult[0].id;
        } else {
            await consigmentYarnQueries.insertForWdTransportRequisitionWdWc(waAddRequisitionDetails, waAddRequisitionDetails.items[i]);
        }

        const results = await waAddRequisitionDetailsQueries.insert(waAddRequisitionDetails, waAddRequisitionDetails.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            await waService.create(waAddRequisitionDetails, waAddRequisitionDetails.items[i])
            if (isOrder) {
                await this.createOrder(waAddRequisitionDetails)
            }
        }
    }
    return { ...constants.insertSuccess, ...{ id: waAddRequisitionDetails.id } };
};

// Order Function
exports.createOrder = async (waAddRequisitionDetails) => {
    for (let i = 0; i < waAddRequisitionDetails.itemsOrder.length; i++) {
        const orderElement = waAddRequisitionDetails.itemsOrder[i];
        await waAddRequisitionDetailsYarnOrderService.create(waAddRequisitionDetails, orderElement)

        let whereCluse = {};
        whereCluse[`${waYarnOrderRequisitionDetailsTableName}.id`] = orderElement.yarnOrderRequisitionDetailsId;
        let selectYarnOrderRequisitionDetailsOneResult = await waYarnOrderRequisitionDetailsQueries.selectOne(whereCluse)

        if (selectYarnOrderRequisitionDetailsOneResult[0].current_quantity >= parseFloat(orderElement.quantity)) {
            await waYarnOrderRequisitionDetailsQueries.update({
                current_quantity: selectYarnOrderRequisitionDetailsOneResult[0].current_quantity - parseFloat(orderElement.quantity)
            }, {
                id: orderElement.yarnOrderRequisitionDetailsId
            })
        } else {
            let excessQuantity = parseFloat((orderElement.quantity - selectYarnOrderRequisitionDetailsOneResult[0].current_quantity).toFixed(3))
            await waYarnOrderRequisitionDetailsQueries.update({
                initial_quantity: selectYarnOrderRequisitionDetailsOneResult[0].initial_quantity + excessQuantity,
                current_quantity: 0,
                is_order: "0"
            }, {
                id: orderElement.yarnOrderRequisitionDetailsId
            })
        }
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
    const isFound = await waAddRequisitionDetailsQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: requisitionId,
    });
    if (isFound[0] != null) {
  
      const results = await waAddRequisitionDetailsQueries.selectByRequisitionIdForOrder(requisitionId);
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


exports.updateForOrder = async (waYarnOutput) => {

    // Check is found
    let whereCluse = {};
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.id`] = waYarnOutput.id;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${waYarnOrderRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await waYarnOrderRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
      let updateResults = false
  
      // Update wa Add Requisition Details Without Quantity
      await waAddRequisitionDetailsQueries.update({
        price: waYarnOutput.price,
        document: waYarnOutput.document,
        statement: waYarnOutput.statement
      },
        {
          id: isFound[0].wa_add_requisition_details_id
        })
  
      // we will select current quantity from store (wa) by following Steps :
      let wcWhereCluse = {};
      wcWhereCluse[`${waTableName}.wa_add_requisition_details_id`] = isFound[0].wa_add_requisition_details_id;
      wcWhereCluse[`${waTableName}.is_deleted`] = 0;
      wcWhereCluse[`${waTableName}.is_active`] = 1;
      const selectWaOneResult = await waQueries.selectOne(wcWhereCluse)
      if (selectWaOneResult[0] != null) {
        let waAddRequisitionDetailsWhereCluse = {};
        waAddRequisitionDetailsWhereCluse[`${waAddRequisitionDetailsTableName}.id`] = isFound[0].wa_add_requisition_details_id;
        waAddRequisitionDetailsWhereCluse[`${waAddRequisitionDetailsTableName}.is_deleted`] = 0;
        waAddRequisitionDetailsWhereCluse[`${waAddRequisitionDetailsTableName}.is_active`] = 1;
        const selectWaAddRequisitionDetailsOneResult = await waAddRequisitionDetailsQueries.selectOne(waAddRequisitionDetailsWhereCluse)
        if (selectWaAddRequisitionDetailsOneResult[0] != null) {
  
          const currentQuantity = selectWaOneResult[0].current_quantity
  
          let oldQuantity = isFound[0].quantity
          let newQuantity = parseFloat(waYarnOutput.quantity)
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
              quantity: selectWaAddRequisitionDetailsOneResult[0].quantity + defferenceQuantity
            }, {
              id: isFound[0].wa_add_requisition_details_id
            })
  
            // Step 3 => Increment quantity in wa_add_requisition_details_yarn_order
            await waAddRequisitionDetailsYarnOrderQueries.update({
              quantity: isFound[0].quantity + defferenceQuantity
            }, {
              wa_yarn_order_requisition_details_id: isFound[0].id,
              wa_add_requisition_details_id: isFound[0].wa_add_requisition_details_id
            })
  
            // Check Valid Current Quantity
            if (isFound[0].current_quantity >= defferenceQuantity) {
              // Step 4 => Decrement current_quantity in wa_yarn_order_requisition_details
              await waYarnOrderRequisitionDetailsQueries.update({
                current_quantity: isFound[0].current_quantity - defferenceQuantity
              }, {
                id: waYarnOutput.id
              })
            } else {
              // Step 4 => Increment initial_quantity and Decrement current_quantity in wa_yarn_order_requisition_details
              await waYarnOrderRequisitionDetailsQueries.update({
                initial_quantity: isFound[0].initial_quantity + defferenceQuantity,
                current_quantity: isFound[0].current_quantity - defferenceQuantity
              }, {
                id: waYarnOutput.id
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
                id: isFound[0].wa_add_requisition_details_id
              })
  
              // Step 2 => Decrement quantity in  wa
              await waQueries.update({
                current_quantity: currentQuantity - defferenceQuantity
              }, {
                id: selectWaOneResult[0].id
              })
  
              // Step 3 => Increment quantity in wa_add_requisition_details_yarn_order
              await waAddRequisitionDetailsYarnOrderQueries.update({
                quantity: isFound[0].quantity - defferenceQuantity
              }, {
                wa_yarn_order_requisition_details_id: isFound[0].id,
                wa_add_requisition_details_id: isFound[0].wa_add_requisition_details_id
              })
              // Step 4 => Increment current_quantity in  wa_yarn_order_requisition_details
              await waYarnOrderRequisitionDetailsQueries.update({
                current_quantity: isFound[0].current_quantity + defferenceQuantity
              }, {
                id: waYarnOutput.id
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