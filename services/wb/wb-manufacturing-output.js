// Queries
const wbManufacturingOutputQueries = require("../../db/queries/wb/wb-manufacturing-output");
const wbManufacturingInputOutputQueries = require("../../db/queries/wb/wb-manufacturing-input-output");
const consigmentManufacturingQueries = require("../../db/queries/general/consigment-manufacturing");
const wbManufacturingRequisitionQueries = require("../../db/queries/wb/wb-manufacturing-requisition");
const wcQueries = require("../../db/queries/wc/wc");
const wbManufacturingOrderRequisitionDetailsQueries = require("../../db/queries/wb/wb-manufacturing-order-requisition-details");
const wbManufacturingOutputOrderQueries = require("../../db/queries/wb/wb-manufacturing-output-order");
const circularKnittingMachineQueries = require("../../db/queries/general/circular-knitting-machine");
const circularKnittingMachineBussinessmanQueries = require("../../db/queries/general/circular-knitting-machine-bussinessman");
const wbManufacturingInputQueries = require("../../db/queries/wb/wb-manufacturing-input");

// Services
const wbManufacturingInputService = require("./wb-manufacturing-input");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wbManufacturingRequisitionTableName, wbManufacturingOutputTableName, wcTableName, wbManufacturingOrderRequisitionDetailsTableName, wbManufacturingInputOutputTableName, wbManufacturingInputTableName } = require("../../util/database-tables-name");

exports.create = async (wbManufacturingOutput) => {
  if (wbManufacturingOutput.isNewConsigment) {
    wbManufacturingOutput.consigmentManufacturingId = trans.transform();

    // Check Consigment Manufacturing Dupplication
    const selectConsigmentManufacturingOneResult = await consigmentManufacturingQueries.selectOne({ number: wbManufacturingOutput.consigmentNumber })
    if (selectConsigmentManufacturingOneResult[0] != null) {
      wbManufacturingOutput.consigmentManufacturingId = selectConsigmentManufacturingOneResult[0].id;
    } else {
      await consigmentManufacturingQueries.insertForManufacturing(wbManufacturingOutput);
    }
  }

  // Check Circular Knitting Machine
  wbManufacturingOutput.circularKnittingMachineId = trans.transform();
  const selectCircularKnittingMachineOneResult = await circularKnittingMachineBussinessmanQueries.selectOne({ 
    manufacturer_id: wbManufacturingOutput.industryId,
    // fabric_id: wbManufacturingOutput.fabricId,
  })
    if (selectCircularKnittingMachineOneResult[0] != null) {
      wbManufacturingOutput.circularKnittingMachineId = selectCircularKnittingMachineOneResult[0].id;
    } else {
      const createCircularKnittingMachine =  await circularKnittingMachineQueries.insertForManufacturingWb(wbManufacturingOutput);
      if(createCircularKnittingMachine) {
        wbManufacturingOutput.circularKnittingMachineBussinessmanId = trans.transform();
        await circularKnittingMachineBussinessmanQueries.insertForManufacturingWb(wbManufacturingOutput)
        
        wbManufacturingOutput.circularKnittingMachineId = wbManufacturingOutput.circularKnittingMachineBussinessmanId
      }
    }

  const results = await wbManufacturingOutputQueries.insert(wbManufacturingOutput);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};


exports.selectLatestManufacturingFeeByIndustryAndFabric = async (industryId, fabricId) => {
  let whereCluse = {};
  whereCluse[`${wbManufacturingRequisitionTableName}.industry_id`] = industryId;
  whereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;

  const results = await wbManufacturingOutputQueries.selectLatestManufacturingFeeByIndustryAndFabric(whereCluse);
  return results;

};

exports.selectByRequisitionId = async (requisitionId) => {
  // check is found
  const isFound = await wbManufacturingRequisitionQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: requisitionId,
  });
  if (isFound[0] != null) {

    const results = await wbManufacturingOutputQueries.selectByRequisitionId(requisitionId);
    return results;
  } else {
    return constants.itemNotFound;
  }
};

exports.selectByRequisitionIdForOrder = async (requisitionId) => {
  // check is found
  const isFound = await wbManufacturingRequisitionQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: requisitionId,
  });
  if (isFound[0] != null) {

    const results = await wbManufacturingOutputQueries.selectByRequisitionIdForOrder(requisitionId);
    return results;
  } else {
    return constants.itemNotFound;
  }
};


exports.selectConsigmentManufacturingByFabric = async (fabricId) => {
  const results = await wbManufacturingOutputQueries.selectConsigmentManufacturingByFabric(fabricId);
  return results;
};

exports.update = async (wbManufacturingOutput) => {

  // Check is found
  let whereCluse = {};
  whereCluse[`${wbManufacturingOutputTableName}.id`] = wbManufacturingOutput.id;
  whereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;
  const isFound = await wbManufacturingOutputQueries.selectOne(whereCluse);
  if (isFound[0] != null) {
    let updateResults = false

    // Update wb Manufacturing Output Without Quantity
    await wbManufacturingOutputQueries.update({
      price: wbManufacturingOutput.price,
      price_dollar: wbManufacturingOutput.priceDollar,
      fabric_piece: wbManufacturingOutput.numberFabricPieces,
      manufacturing_fee: wbManufacturingOutput.manufacturingFee,
      document: wbManufacturingOutput.document,
      statement: wbManufacturingOutput.statement
    },
      {
        id: wbManufacturingOutput.id
      })

    // we will select current quantity from store (wc) by following Steps :
    let wcWhereCluse = {};
    wcWhereCluse[`${wcTableName}.wb_manufacturing_output_id`] = wbManufacturingOutput.id;
    wcWhereCluse[`${wcTableName}.is_deleted`] = 0;
    wcWhereCluse[`${wcTableName}.is_active`] = 1;
    const selectWcOneResult = await wcQueries.selectOne(wcWhereCluse)
    if (selectWcOneResult[0] != null) {
      const currentQuantity = selectWcOneResult[0].current_quantity

      let oldQuantity = isFound[0].quantity
      let newQuantity = parseFloat(wbManufacturingOutput.quantity)
      let defferenceQuantity = 0

      // Check Quantity
      if (newQuantity > oldQuantity) {
        defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

        // Step 1 => Increment quantity in  wc
        await wcQueries.update({
          current_quantity: currentQuantity + defferenceQuantity
        }, {
          id: selectWcOneResult[0].id
        })

        // Step 2 => Increment quantity in  wb Manufacturing Output
        await wbManufacturingOutputQueries.update({
          quantity: oldQuantity + defferenceQuantity
        }, {
          id: wbManufacturingOutput.id
        })

        updateResults = true
      } else if (newQuantity < oldQuantity) {
        defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

        // Check if has enough current quantity in wc
        if (currentQuantity >= defferenceQuantity) {

          // Step 1 => Decrement quantity in  wb_manufacturing_output
          await wbManufacturingOutputQueries.update({
            quantity: oldQuantity - defferenceQuantity
          }, {
            id: wbManufacturingOutput.id
          })

          // Step 2 => Decrement quantity in  wc
          await wcQueries.update({
            current_quantity: currentQuantity - defferenceQuantity
          }, {
            id: selectWcOneResult[0].id
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
      return {
        ...constants.wrongQuantity,
        spentQuantity: 0,
        newQuantity: defferenceQuantity
      }
    }
    if (updateResults) {

      // calc fabric price
      let fabricPrice = 0
      let inputOutputManufacturingWhereCluse = {}
      inputOutputManufacturingWhereCluse[`${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`] = wbManufacturingOutput.id;
      inputOutputManufacturingWhereCluse[`${wbManufacturingInputOutputTableName}.is_deleted`] = 0;
      inputOutputManufacturingWhereCluse[`${wbManufacturingInputOutputTableName}.is_active`] = 1;
      const selectInputOutputManufacturingOneResult = await wbManufacturingInputOutputQueries.selectOne(inputOutputManufacturingWhereCluse)
      if (selectInputOutputManufacturingOneResult[0] != null) {
        const selectInputManufacturingResult = await wbManufacturingInputService.selectByRequisitionId(selectInputOutputManufacturingOneResult[0].wb_manufacturing_requisition_id)
        if (selectInputManufacturingResult[0] != null) {
          const selectOutputManufacturingOneResult = await this.selectByRequisitionId(selectInputOutputManufacturingOneResult[0].wb_manufacturing_requisition_id)
          if (selectOutputManufacturingOneResult[0] != null) {
            fabricPrice = await this.calcAvgFabricPrice(selectInputManufacturingResult, selectOutputManufacturingOneResult)
            fabricPriceDollar = await this.calcAvgFabricPriceDollar(selectInputManufacturingResult, selectOutputManufacturingOneResult)
            await wbManufacturingOutputQueries.update({
              price: fabricPrice,
              price_dollar: fabricPriceDollar
            }, {
              // id: selectOutputManufacturingOneResult[0].id,
              fabric_id: selectOutputManufacturingOneResult[0].fabric_id,
              consigment_manufacturing_id: selectOutputManufacturingOneResult[0].consigment_manufacturing_id
            })
          }
        }
      }

      return constants.updateSuccess;
    } else {
      return constants.updateError;
    }

  } else {
    return constants.itemNotFound;
  }
};

exports.updateForOrder = async (wbManufacturingOutput) => {

  // Check is found
  let whereCluse = {};
  whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.id`] = wbManufacturingOutput.id;
  whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_active`] = 1;
  const isFound = await wbManufacturingOrderRequisitionDetailsQueries.selectOne(whereCluse);
  if (isFound[0] != null) {
    let updateResults = false

    // Update wb Manufacturing Output Without Quantity
    await wbManufacturingOutputQueries.update({
      price: wbManufacturingOutput.price,
      fabric_piece: wbManufacturingOutput.numberFabricPieces,
      manufacturing_fee: wbManufacturingOutput.manufacturingFee,
      document: wbManufacturingOutput.document,
      statement: wbManufacturingOutput.statement
    },
      {
        id: isFound[0].wb_manufacturing_output_id
      })

    // we will select current quantity from store (wc) by following Steps :
    let wcWhereCluse = {};
    wcWhereCluse[`${wcTableName}.wb_manufacturing_output_id`] = isFound[0].wb_manufacturing_output_id;
    wcWhereCluse[`${wcTableName}.is_deleted`] = 0;
    wcWhereCluse[`${wcTableName}.is_active`] = 1;
    const selectWcOneResult = await wcQueries.selectOne(wcWhereCluse)
    if (selectWcOneResult[0] != null) {
      let wbManufacturingOutputWhereCluse = {};
      wbManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.id`] = isFound[0].wb_manufacturing_output_id;
      wbManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
      wbManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;
      const selectWbManufacturingOutputOneResult = await wbManufacturingOutputQueries.selectOne(wbManufacturingOutputWhereCluse)
      if (selectWbManufacturingOutputOneResult[0] != null) {

        const currentQuantity = selectWcOneResult[0].current_quantity

        let oldQuantity = isFound[0].quantity
        let newQuantity = parseFloat(wbManufacturingOutput.quantity)
        let defferenceQuantity = 0

        // Check Quantity
        if (newQuantity > oldQuantity) {
          defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

          // Step 1 => Increment quantity in  wc
          await wcQueries.update({
            current_quantity: currentQuantity + defferenceQuantity
          }, {
            id: selectWcOneResult[0].id
          })

          // Step 2 => Increment quantity in  wb Manufacturing Output
          await wbManufacturingOutputQueries.update({
            quantity: selectWbManufacturingOutputOneResult[0].quantity + defferenceQuantity
          }, {
            id: isFound[0].wb_manufacturing_output_id
          })

          // Step 3 => Increment quantity in wb_manufacturing_output_order
          await wbManufacturingOutputOrderQueries.update({
            quantity: isFound[0].quantity + defferenceQuantity
          }, {
            wb_manufacturing_order_requisition_details_id: isFound[0].id,
            wb_manufacturing_output_id: isFound[0].wb_manufacturing_output_id
          })

          // Check Valid Current Quantity
          if (isFound[0].current_quantity >= defferenceQuantity) {
            // Step 4 => Decrement current_quantity in wb_manufacturing_order_requisition_details
            await wbManufacturingOrderRequisitionDetailsQueries.update({
              current_quantity: isFound[0].current_quantity - defferenceQuantity
            }, {
              id: wbManufacturingOutput.id
            })
          } else {
            // Step 4 => Increment initial_quantity and Decrement current_quantity in wb_manufacturing_order_requisition_details
            await wbManufacturingOrderRequisitionDetailsQueries.update({
              initial_quantity: isFound[0].initial_quantity + defferenceQuantity,
              current_quantity: isFound[0].current_quantity - defferenceQuantity
            }, {
              id: wbManufacturingOutput.id
            })
          }

          updateResults = true
        } else if (newQuantity < oldQuantity) {
          defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

          // Check if has enough current quantity in wc
          if (currentQuantity >= defferenceQuantity) {

            // Step 1 => Decrement quantity in  wb_manufacturing_output
            await wbManufacturingOutputQueries.update({
              quantity: oldQuantity - defferenceQuantity
            }, {
              id: isFound[0].wb_manufacturing_output_id
            })

            // Step 2 => Decrement quantity in  wc
            await wcQueries.update({
              current_quantity: currentQuantity - defferenceQuantity
            }, {
              id: selectWcOneResult[0].id
            })

            // Step 3 => Increment quantity in wb_manufacturing_output_order
            await wbManufacturingOutputOrderQueries.update({
              quantity: isFound[0].quantity - defferenceQuantity
            }, {
              wb_manufacturing_order_requisition_details_id: isFound[0].id,
              wb_manufacturing_output_id: isFound[0].wb_manufacturing_output_id
            })
            // Step 4 => Increment current_quantity in  wb_manufacturing_order_requisition_details
            await wbManufacturingOrderRequisitionDetailsQueries.update({
              current_quantity: isFound[0].current_quantity + defferenceQuantity
            }, {
              id: wbManufacturingOutput.id
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


exports.selectByFabricByConsigmentManufacturing = async (fabricId, consigmentManufacturingId) => {
  const results = await wbManufacturingOutputQueries.selectByFabricByConsigmentManufacturing(fabricId, consigmentManufacturingId);
  return results;
};

exports.calcAvgFabricPrice = async (wbInputManufacturingResult, wboutputManufacturingResult) => {
  // let inputCostWithWaste = 0
  // let outputCostManufacturingFee = 0
  // let avgFabricPrice = 0
  // inputCostWithWaste = wbInputManufacturingResult.map(function (a) { return parseFloat(a['quantity_with_waste']) * parseFloat(a['price']) }).reduce((acc, value) => acc + value, 0);
  // outputCostManufacturingFee = wboutputManufacturingResult[0].quantity * parseFloat(wboutputManufacturingResult[0].manufacturing_fee)
  // avgFabricPrice = (inputCostWithWaste + outputCostManufacturingFee) / wboutputManufacturingResult[0].quantity
  
  let inputCostWithWaste = 0
  let outputCostManufacturingFee = 0
  let avgFabricPrice = 0
  let totalOutputQuantity = 0
  let totalInputOutput = await this.getTotalOutputQuantityOfConsigment(wboutputManufacturingResult, "price")
  console.log("totalInputOutput ::::::::::: ", totalInputOutput);
  inputCostWithWaste = totalInputOutput[0]
  outputCostManufacturingFee = totalInputOutput[1]
  totalOutputQuantity = totalInputOutput[2]
  if(totalOutputQuantity == 0) {
    avgFabricPrice = 0
  } else {
    avgFabricPrice = (inputCostWithWaste + outputCostManufacturingFee) / totalOutputQuantity
  }

  return avgFabricPrice
}

exports.calcAvgFabricPriceDollar = async (wbInputManufacturingResult, wboutputManufacturingResult) => {
  // let inputCostWithWaste = 0
  // let outputCostManufacturingFee = 0
  // let avgFabricPrice = 0
  // inputCostWithWaste = wbInputManufacturingResult.map(function (a) { return parseFloat(a['quantity_with_waste']) * parseFloat(a['price_dollar']) }).reduce((acc, value) => acc + value, 0);
  // outputCostManufacturingFee = wboutputManufacturingResult[0].quantity * parseFloat(wboutputManufacturingResult[0].manufacturing_fee)
  // avgFabricPrice = (inputCostWithWaste + outputCostManufacturingFee) / wboutputManufacturingResult[0].quantity
  
  let inputCostWithWaste = 0
  let outputCostManufacturingFee = 0
  let avgFabricPrice = 0
  let totalOutputQuantity = 0
  let totalInputOutput = await this.getTotalOutputQuantityOfConsigment(wboutputManufacturingResult, "price_dollar")
  console.log("totalInputOutput ::::::::::: ", totalInputOutput);
  inputCostWithWaste = totalInputOutput[0]
  outputCostManufacturingFee = totalInputOutput[1]
  totalOutputQuantity = totalInputOutput[2]
  if(totalOutputQuantity == 0) {
    avgFabricPrice = 0
  } else {
    avgFabricPrice = (inputCostWithWaste + outputCostManufacturingFee) / totalOutputQuantity
  }

  return avgFabricPrice
}

exports.getTotalInputQuantityOfConsigment = async (wbOutputManufacturingResult, totalInputCostWithWaste, priceType) => {
  let whereCluse = {};
  whereCluse[`${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`] = wbOutputManufacturingResult.id;
  whereCluse[`${wbManufacturingInputOutputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingInputOutputTableName}.is_active`] = 1;

  const selectInputsManufaturingResults = await wbManufacturingInputOutputQueries.select(whereCluse)
  console.log("selectInputsManufaturingResults ::: ", selectInputsManufaturingResults);
  if (Array.isArray(selectInputsManufaturingResults) && selectInputsManufaturingResults.length > 0) {
    for (let j = 0; j < selectInputsManufaturingResults.length; j++) {
      const selectInputsManufaturing = selectInputsManufaturingResults[j];
      
      let wbInputManufacturingWhereCluse = {};
      wbInputManufacturingWhereCluse[`${wbManufacturingInputTableName}.id`] = selectInputsManufaturing.wb_manufacturing_input_id;
      wbInputManufacturingWhereCluse[`${wbManufacturingInputTableName}.is_deleted`] = 0;
      wbInputManufacturingWhereCluse[`${wbManufacturingInputTableName}.is_active`] = 1;
      const selectWbInputManufacturingResult = await wbManufacturingInputQueries.selectOne(wbInputManufacturingWhereCluse)
      if (Array.isArray(selectWbInputManufacturingResult) && selectWbInputManufacturingResult.length > 0) {
        totalInputCostWithWaste = totalInputCostWithWaste + ( parseFloat(selectWbInputManufacturingResult[0].quantity_with_waste) * parseFloat(selectWbInputManufacturingResult[0][priceType]) )
      }
    }
  } else {
    return 0
  }
  return totalInputCostWithWaste
}

exports.getTotalOutputQuantityOfConsigment = async (wbOutputManufacturingResult, priceType) => {
  let totalInputCostWithWaste = 0
  let totalOutputCostManufacturingFee = 0
  let totalOutputQuantity = 0

  let whereCluse = {};
  whereCluse[`${wbManufacturingOutputTableName}.consigment_manufacturing_id`] = wbOutputManufacturingResult[0].consigment_manufacturing_id;
  whereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = wbOutputManufacturingResult[0].fabric_id;
  whereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;

  const selectOutputManufaturingResults = await wbManufacturingOutputQueries.select(whereCluse)
  if (Array.isArray(selectOutputManufaturingResults) && selectOutputManufaturingResults.length > 0) {
    for (let i = 0; i < selectOutputManufaturingResults.length; i++) {
      const selectOutputManufaturingElement = selectOutputManufaturingResults[i];
      totalOutputCostManufacturingFee = totalOutputCostManufacturingFee + (selectOutputManufaturingElement.quantity * parseFloat(selectOutputManufaturingElement.manufacturing_fee))
      totalOutputQuantity = totalOutputQuantity + selectOutputManufaturingElement.quantity
      
      // input
      const selectInputManufaturingResults = await this.getTotalInputQuantityOfConsigment(selectOutputManufaturingElement, totalInputCostWithWaste, priceType)
      totalInputCostWithWaste = totalInputCostWithWaste + selectInputManufaturingResults

    }
  } else {
    return [0, 0, 0]
  }
  if(totalInputCostWithWaste == 0) {
    return [0, 0, 0] 
  } else {
    return [totalInputCostWithWaste, totalOutputCostManufacturingFee, totalOutputQuantity]
  }
  }