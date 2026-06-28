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
const wbService = require("./wb");
const wbManufacturingOutputAllocationService = require("./wb-manufacturing-output-allocation");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const knex = require("../../db/config/connection").getConnection();
const constantsPayloads = require("../../util/constants-payloads");
const { wbManufacturingRequisitionTableName,
  wbManufacturingOutputTableName,
  wcTableName,
  wbManufacturingOrderRequisitionDetailsTableName,
  wbManufacturingInputOutputTableName,
  wbManufacturingInputTableName
} = require("../../util/database-tables-name");

const toSafeNumber = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

exports.create = async (wbManufacturingOutput, trx = null) => {

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
  const selectCircularKnittingMachineOneResult = await circularKnittingMachineBussinessmanQueries.selectOne({
    id: wbManufacturingOutput.circularKnittingMachineId,
    // manufacturer_id: wbManufacturingOutput.industryId,
    // fabric_id: wbManufacturingOutput.fabricId,
  })
  if (selectCircularKnittingMachineOneResult[0] != null) {
    wbManufacturingOutput.circularKnittingMachineId = selectCircularKnittingMachineOneResult[0].id;
  } else {
    wbManufacturingOutput.circularKnittingMachineId = trans.transform();

    const createCircularKnittingMachine = await circularKnittingMachineQueries.insertForManufacturingWb(wbManufacturingOutput);
    if (createCircularKnittingMachine) {
      wbManufacturingOutput.circularKnittingMachineBussinessmanId = trans.transform();
      await circularKnittingMachineBussinessmanQueries.insertForManufacturingWb(wbManufacturingOutput)

      wbManufacturingOutput.circularKnittingMachineId = wbManufacturingOutput.circularKnittingMachineBussinessmanId
    }
  }

  const results = await wbManufacturingOutputQueries.insert(wbManufacturingOutput, null, trx);
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
    if (Array.isArray(results) && results.length > 0) {

      for (let i = 0; i < results.length; i++) {
        const element = results[i];

        element.fabricOrderRequisitions = await wbService.selectRequisitionsForWdFabricOrderRequisitionForWbOutputManufacturingRequisition(
          element.orders_requisitions_id,
          element.wc_fabric_order_requisition_details_id,
          element.fabric_id
        )
      }

    }

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

exports.selectWcConsigmentsManufacturing = async (whereCluse, consigmentsYarn) => {

  const results = await wbManufacturingOutputQueries.selectWcConsigmentsManufacturing(whereCluse, consigmentsYarn);
  return results;
};


exports.confirm = async (wbManufacturingOutput) => {
  // check is found
  const isFound = await wbManufacturingOutputQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: wbManufacturingOutput.id,
  });
  if (isFound[0] != null) {
    let whereCluse = {};
    whereCluse[`${wbManufacturingOutputTableName}.id`] = wbManufacturingOutput.id;
    whereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;

    // updated
    const updateResults = await wbManufacturingOutputQueries.update(
      {
        is_approved: wbManufacturingOutput.isApproved
      }, whereCluse);
    if (updateResults) {
      return constants.updateSuccess;
    } else {
      return constants.updateError;
    }
  } else {
    return constants.itemNotFound;
  }
};

exports.update = async (wbManufacturingOutput) => {
  console.log('[update] START - id:', wbManufacturingOutput.id, '| quantity:', wbManufacturingOutput.quantity);

  // Check is found
  let whereCluse = {};
  whereCluse[`${wbManufacturingOutputTableName}.id`] = wbManufacturingOutput.id;
  whereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;
  const isFound = await wbManufacturingOutputQueries.selectOne(whereCluse);
  if (isFound[0] == null) {
    console.log('[update] itemNotFound - id:', wbManufacturingOutput.id);
    return constants.itemNotFound;
  }
  console.log('[update] isFound - oldQuantity:', isFound[0].quantity);

  // Check Circular Knitting Machine
  const selectCircularKnittingMachineOneResult = await circularKnittingMachineBussinessmanQueries.selectOne({
    id: wbManufacturingOutput.circularKnittingMachineId,
  });
  console.log('[update] circularKnittingMachine found:', selectCircularKnittingMachineOneResult[0] != null);

  // Get wc record
  let wcWhereCluse = {};
  wcWhereCluse[`${wcTableName}.wb_manufacturing_output_id`] = wbManufacturingOutput.id;
  wcWhereCluse[`${wcTableName}.is_deleted`] = 0;
  wcWhereCluse[`${wcTableName}.is_active`] = 1;
  const selectWcOneResult = await wcQueries.selectOne(wcWhereCluse);
  if (selectWcOneResult[0] == null) {
    console.log('[update] wc record not found for output id:', wbManufacturingOutput.id);
    return { ...constants.wrongQuantity, spentQuantity: 0, newQuantity: 0 };
  }
  console.log('[update] wc found - id:', selectWcOneResult[0].id, '| currentQuantity:', selectWcOneResult[0].current_quantity);

  const currentQuantity = selectWcOneResult[0].current_quantity;
  const oldQuantity = isFound[0].quantity;
  const newQuantity = parseFloat(wbManufacturingOutput.quantity);
  let defferenceQuantity = 0;

  console.log('[update] quantities - old:', oldQuantity, '| new:', newQuantity, '| wcCurrent:', currentQuantity);

  // Pre-validate quantity before entering transaction
  if (newQuantity < oldQuantity) {
    defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3));
    if (currentQuantity < defferenceQuantity) {
      console.log('[update] wrongQuantity (decrease) - spentQuantity:', currentQuantity, '| needed:', defferenceQuantity);
      return { ...constants.wrongQuantity, spentQuantity: currentQuantity, newQuantity: defferenceQuantity };
    }
  } else if (newQuantity > oldQuantity) {
    defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3));
  }
  console.log('[update] defferenceQuantity:', defferenceQuantity);

  try {
    return await knex.transaction(async (trx) => {
      console.log('[update][trx] transaction started');

      // Handle Circular Knitting Machine
      if (selectCircularKnittingMachineOneResult[0] != null) {
        wbManufacturingOutput.circularKnittingMachineId = selectCircularKnittingMachineOneResult[0].id;
        console.log('[update][trx] circularKnittingMachine - using existing id:', wbManufacturingOutput.circularKnittingMachineId);
      } else {
        console.log('[update][trx] circularKnittingMachine - creating new');
        wbManufacturingOutput.circularKnittingMachineId = trans.transform();
        const createCircularKnittingMachine = await circularKnittingMachineQueries.insertForManufacturingWb(wbManufacturingOutput, trx);
        console.log('[update][trx] circularKnittingMachine insert result:', createCircularKnittingMachine);
        if (createCircularKnittingMachine) {
          wbManufacturingOutput.circularKnittingMachineBussinessmanId = trans.transform();
          await circularKnittingMachineBussinessmanQueries.insertForManufacturingWb(wbManufacturingOutput, trx);
          wbManufacturingOutput.circularKnittingMachineId = wbManufacturingOutput.circularKnittingMachineBussinessmanId;
          console.log('[update][trx] circularKnittingMachineBussinessman inserted - id:', wbManufacturingOutput.circularKnittingMachineId);
        }
      }

      // Update wb Manufacturing Output Without Quantity
      console.log('[update][trx] updating wb_manufacturing_output (no quantity) - id:', wbManufacturingOutput.id);
      const updateOutputResult = await wbManufacturingOutputQueries.update({
        circular_knitting_machine_bussiness_man_id: wbManufacturingOutput.circularKnittingMachineId,
        price: toSafeNumber(wbManufacturingOutput.price),
        price_dollar: toSafeNumber(wbManufacturingOutput.priceDollar),
        fabric_piece: wbManufacturingOutput.numberFabricPieces,
        manufacturing_fee: toSafeNumber(wbManufacturingOutput.manufacturingFee),
        manufacturing_fee_dollar: toSafeNumber(wbManufacturingOutput.manufacturingFeeDollar),
        document: wbManufacturingOutput.document,
        statement: wbManufacturingOutput.statement
      }, { id: wbManufacturingOutput.id }, trx);
      console.log('[update][trx] wb_manufacturing_output update result:', updateOutputResult);

      // Update wc storage_place
      console.log('[update][trx] updating wc storage_place - wc id:', selectWcOneResult[0].id);
      const updateWcStorageResult = await wcQueries.update({
        storage_place: wbManufacturingOutput.storagePlace
      }, { id: selectWcOneResult[0].id }, trx);
      console.log('[update][trx] wc storage_place update result:', updateWcStorageResult);

      // Handle quantity changes
      if (newQuantity > oldQuantity) {
        console.log('[update][trx] INCREASE - calling adjustAllocationsForOutput with delta:', defferenceQuantity);
        const adjustResult = await wbManufacturingOutputAllocationService.adjustAllocationsForOutput(
          wbManufacturingOutput.id,
          defferenceQuantity,
          trx
        );
        console.log('[update][trx] adjustAllocations result:', JSON.stringify(adjustResult));
        if (adjustResult.status !== 200 && adjustResult.status !== 206 && adjustResult.status !== 404) {
          const err = new Error('adjustAllocations failed');
          err.adjustResult = adjustResult;
          throw err;
        }

        // Step 1 => Increment quantity in wc
        console.log('[update][trx] STEP 1 - increment wc.current_quantity to:', currentQuantity + defferenceQuantity);
        await wcQueries.update({
          current_quantity: currentQuantity + defferenceQuantity
        }, { id: selectWcOneResult[0].id }, trx);

        // Step 2 => Increment quantity in wb Manufacturing Output
        console.log('[update][trx] STEP 2 - increment wb_manufacturing_output.quantity to:', oldQuantity + defferenceQuantity);
        await wbManufacturingOutputQueries.update({
          quantity: oldQuantity + defferenceQuantity
        }, { id: wbManufacturingOutput.id }, trx);

      } else if (newQuantity < oldQuantity) {
        console.log('[update][trx] DECREASE - calling adjustAllocationsForOutput with delta:', -defferenceQuantity);
        const adjustResult = await wbManufacturingOutputAllocationService.adjustAllocationsForOutput(
          wbManufacturingOutput.id,
          -defferenceQuantity,
          trx
        );
        console.log('[update][trx] adjustAllocations result:', JSON.stringify(adjustResult));
        if (adjustResult.status !== 200 && adjustResult.status !== 206 && adjustResult.status !== 404) {
          const err = new Error('adjustAllocations failed');
          err.adjustResult = adjustResult;
          throw err;
        }

        // Step 1 => Decrement quantity in wb_manufacturing_output
        console.log('[update][trx] STEP 1 - decrement wb_manufacturing_output.quantity to:', oldQuantity - defferenceQuantity);
        await wbManufacturingOutputQueries.update({
          quantity: oldQuantity - defferenceQuantity
        }, { id: wbManufacturingOutput.id }, trx);

        // Step 2 => Decrement quantity in wc
        console.log('[update][trx] STEP 2 - decrement wc.current_quantity to:', currentQuantity - defferenceQuantity);
        await wcQueries.update({
          current_quantity: currentQuantity - defferenceQuantity
        }, { id: selectWcOneResult[0].id }, trx);
      } else {
        console.log('[update][trx] no quantity change');
      }

      // Calc fabric price
      console.log('[update][trx] calculating fabric price for output id:', wbManufacturingOutput.id);
      let inputOutputManufacturingWhereCluse = {};
      inputOutputManufacturingWhereCluse[`${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`] = wbManufacturingOutput.id;
      inputOutputManufacturingWhereCluse[`${wbManufacturingInputOutputTableName}.is_deleted`] = 0;
      inputOutputManufacturingWhereCluse[`${wbManufacturingInputOutputTableName}.is_active`] = 1;
      const selectInputOutputManufacturingOneResult = await wbManufacturingInputOutputQueries.selectOne(inputOutputManufacturingWhereCluse);
      if (selectInputOutputManufacturingOneResult[0] != null) {
        const selectInputManufacturingResult = await wbManufacturingInputService.selectByRequisitionId(selectInputOutputManufacturingOneResult[0].wb_manufacturing_requisition_id);
        if (selectInputManufacturingResult[0] != null) {
          const selectOutputManufacturingOneResult = await exports.selectByRequisitionId(selectInputOutputManufacturingOneResult[0].wb_manufacturing_requisition_id);
          if (selectOutputManufacturingOneResult[0] != null) {
            const fabricPrice = await exports.calcAvgFabricPrice(selectInputManufacturingResult, selectOutputManufacturingOneResult);
            const fabricPriceDollar = await exports.calcAvgFabricPriceDollar(selectInputManufacturingResult, selectOutputManufacturingOneResult);
            console.log('[update][trx] fabric price calculated - price:', fabricPrice, '| priceDollar:', fabricPriceDollar);
            await wbManufacturingOutputQueries.update({
              price: fabricPrice,
              price_dollar: fabricPriceDollar
            }, {
              id: selectOutputManufacturingOneResult[0].id,
              fabric_id: selectOutputManufacturingOneResult[0].fabric_id,
              consigment_manufacturing_id: selectOutputManufacturingOneResult[0].consigment_manufacturing_id
            }, trx);
          } else {
            console.log('[update][trx] selectOutputManufacturingOneResult is empty - skipping fabric price update');
          }
        } else {
          console.log('[update][trx] selectInputManufacturingResult is empty - skipping fabric price update');
        }
      } else {
        console.log('[update][trx] no input-output link found - skipping fabric price update');
      }

      console.log('[update][trx] transaction committing - SUCCESS');
      return constants.updateSuccess;
    });
  } catch (err) {
    if (err.adjustResult) {
      console.log('[update] adjustAllocations business error - rolling back:', JSON.stringify(err.adjustResult));
      return err.adjustResult;
    }
    console.error('[update] UNEXPECTED ERROR - rolling back:', err);
    return constants.updateError;
  }
};

exports.updateForOrder = async (wbManufacturingOutput) => {

  // Check is found
  let whereCluse = {};
  whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.id`] = wbManufacturingOutput.id;
  whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.is_active`] = 1;
  const isFound = await wbManufacturingOrderRequisitionDetailsQueries.selectOne(whereCluse);
  if (isFound[0] == null) return constants.itemNotFound;

  // Get wc record
  let wcWhereCluse = {};
  wcWhereCluse[`${wcTableName}.wb_manufacturing_output_id`] = isFound[0].wb_manufacturing_output_id;
  wcWhereCluse[`${wcTableName}.is_deleted`] = 0;
  wcWhereCluse[`${wcTableName}.is_active`] = 1;
  const selectWcOneResult = await wcQueries.selectOne(wcWhereCluse);
  if (selectWcOneResult[0] == null) {
    return { ...constants.wrongQuantity, spentQuantity: 0, newQuantity: 0 };
  }

  // Get wb Manufacturing Output record
  let wbManufacturingOutputWhereCluse = {};
  wbManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.id`] = isFound[0].wb_manufacturing_output_id;
  wbManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
  wbManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;
  const selectWbManufacturingOutputOneResult = await wbManufacturingOutputQueries.selectOne(wbManufacturingOutputWhereCluse);
  if (selectWbManufacturingOutputOneResult[0] == null) return constants.itemNotFound;

  const currentQuantity = selectWcOneResult[0].current_quantity;
  const oldQuantity = isFound[0].quantity;
  const newQuantity = parseFloat(wbManufacturingOutput.quantity);
  let defferenceQuantity = 0;

  // Pre-validate quantity before entering transaction
  if (newQuantity < oldQuantity) {
    defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3));
    if (currentQuantity < defferenceQuantity) {
      return { ...constants.wrongQuantity, spentQuantity: currentQuantity, newQuantity: defferenceQuantity };
    }
  } else if (newQuantity > oldQuantity) {
    defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3));
  }

  try {
    return await knex.transaction(async (trx) => {

      // Update wb Manufacturing Output Without Quantity
      await wbManufacturingOutputQueries.update({
        price: wbManufacturingOutput.price,
        fabric_piece: wbManufacturingOutput.numberFabricPieces,
        manufacturing_fee: wbManufacturingOutput.manufacturingFee,
        manufacturing_fee_dollar: wbManufacturingOutput.manufacturingFeeDollar,
        document: wbManufacturingOutput.document,
        statement: wbManufacturingOutput.statement
      }, { id: isFound[0].wb_manufacturing_output_id }, trx);

      // Update wc storage_place
      await wcQueries.update({
        storage_place: wbManufacturingOutput.storagePlace
      }, { id: selectWcOneResult[0].id }, trx);

      // Handle quantity changes
      if (newQuantity > oldQuantity) {
        // Step 1 => Increment quantity in wc
        await wcQueries.update({
          current_quantity: currentQuantity + defferenceQuantity
        }, { id: selectWcOneResult[0].id }, trx);

        // Step 2 => Increment quantity in wb Manufacturing Output
        await wbManufacturingOutputQueries.update({
          quantity: selectWbManufacturingOutputOneResult[0].quantity + defferenceQuantity
        }, { id: isFound[0].wb_manufacturing_output_id }, trx);

        // Step 3 => Increment quantity in wb_manufacturing_output_order
        await wbManufacturingOutputOrderQueries.update({
          quantity: isFound[0].quantity + defferenceQuantity
        }, {
          wb_manufacturing_order_requisition_details_id: isFound[0].id,
          wb_manufacturing_output_id: isFound[0].wb_manufacturing_output_id
        }, trx);

        // Step 4 => Update current_quantity in wb_manufacturing_order_requisition_details
        if (isFound[0].current_quantity >= defferenceQuantity) {
          await wbManufacturingOrderRequisitionDetailsQueries.update({
            current_quantity: isFound[0].current_quantity - defferenceQuantity
          }, { id: wbManufacturingOutput.id }, trx);
        } else {
          await wbManufacturingOrderRequisitionDetailsQueries.update({
            initial_quantity: isFound[0].initial_quantity + defferenceQuantity,
            current_quantity: isFound[0].current_quantity - defferenceQuantity
          }, { id: wbManufacturingOutput.id }, trx);
        }

      } else if (newQuantity < oldQuantity) {
        // Step 1 => Decrement quantity in wb_manufacturing_output
        await wbManufacturingOutputQueries.update({
          quantity: oldQuantity - defferenceQuantity
        }, { id: isFound[0].wb_manufacturing_output_id }, trx);

        // Step 2 => Decrement quantity in wc
        await wcQueries.update({
          current_quantity: currentQuantity - defferenceQuantity
        }, { id: selectWcOneResult[0].id }, trx);

        // Step 3 => Decrement quantity in wb_manufacturing_output_order
        await wbManufacturingOutputOrderQueries.update({
          quantity: isFound[0].quantity - defferenceQuantity
        }, {
          wb_manufacturing_order_requisition_details_id: isFound[0].id,
          wb_manufacturing_output_id: isFound[0].wb_manufacturing_output_id
        }, trx);

        // Step 4 => Increment current_quantity in wb_manufacturing_order_requisition_details
        await wbManufacturingOrderRequisitionDetailsQueries.update({
          current_quantity: isFound[0].current_quantity + defferenceQuantity
        }, { id: wbManufacturingOutput.id }, trx);
      }

      return constants.updateSuccess;
    });
  } catch (err) {
    console.error(err);
    return constants.updateError;
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
  let totalInputOutput = await this.getTotalOutputQuantityOfConsigment(wboutputManufacturingResult, "price", "manufacturing_fee")
  inputCostWithWaste = parseFloat((totalInputOutput[0]).toFixed(3))
  outputCostManufacturingFee = parseFloat((totalInputOutput[1]).toFixed(3))
  totalOutputQuantity = parseFloat((totalInputOutput[2]).toFixed(3))
  // console.log("inputCostWithWaste ::::::::::: ", inputCostWithWaste);
  // console.log("outputCostManufacturingFee ::::::::::: ", outputCostManufacturingFee);
  // console.log("totalInputOutput ::::::::::: ", totalInputOutput);

  if (totalOutputQuantity == 0) {
    avgFabricPrice = 0
  } else {
    avgFabricPrice = (inputCostWithWaste + outputCostManufacturingFee) / totalOutputQuantity
  }

  return avgFabricPrice
}

exports.calcFabricPrice = async (wbManufacturingOutputId) => {
  // calc fabric price
  let fabricPrice = 0
  let inputOutputManufacturingWhereCluse = {}
  inputOutputManufacturingWhereCluse[`${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`] = wbManufacturingOutputId;
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
          id: selectOutputManufacturingOneResult[0].id,
          fabric_id: selectOutputManufacturingOneResult[0].fabric_id,
          consigment_manufacturing_id: selectOutputManufacturingOneResult[0].consigment_manufacturing_id
        })
      }
    }
  }
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
  let totalInputOutput = await this.getTotalOutputQuantityOfConsigment(wboutputManufacturingResult, "price_dollar", "manufacturing_fee_dollar")
  console.log("totalInputOutput ::::::::::: ", totalInputOutput);
  inputCostWithWaste = parseFloat((totalInputOutput[0]).toFixed(3))
  outputCostManufacturingFee = parseFloat((totalInputOutput[1]).toFixed(3))
  totalOutputQuantity = parseFloat((totalInputOutput[2]).toFixed(3))
  if (totalOutputQuantity == 0) {
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
  // console.log("selectInputsManufaturingResults ::: ", selectInputsManufaturingResults);
  if (Array.isArray(selectInputsManufaturingResults) && selectInputsManufaturingResults.length > 0) {
    for (let j = 0; j < selectInputsManufaturingResults.length; j++) {
      const selectInputsManufaturing = selectInputsManufaturingResults[j];

      let wbInputManufacturingWhereCluse = {};
      wbInputManufacturingWhereCluse[`${wbManufacturingInputTableName}.id`] = selectInputsManufaturing.wb_manufacturing_input_id;
      wbInputManufacturingWhereCluse[`${wbManufacturingInputTableName}.is_deleted`] = 0;
      wbInputManufacturingWhereCluse[`${wbManufacturingInputTableName}.is_active`] = 1;
      const selectWbInputManufacturingResult = await wbManufacturingInputQueries.selectOne(wbInputManufacturingWhereCluse)
      if (Array.isArray(selectWbInputManufacturingResult) && selectWbInputManufacturingResult.length > 0) {
        const quantityWithWaste = toSafeNumber(selectWbInputManufacturingResult[0].quantity_with_waste)
        const inputPrice = toSafeNumber(selectWbInputManufacturingResult[0][priceType])
        totalInputCostWithWaste = totalInputCostWithWaste + (quantityWithWaste * inputPrice)
      }
    }
  } else {
    return 0
  }
  return totalInputCostWithWaste
}

exports.getTotalOutputQuantityOfConsigment = async (wbOutputManufacturingResult, priceType, manufacturingFeeType) => {
  let totalInputCostWithWaste = 0
  let totalOutputCostManufacturingFee = 0
  let totalOutputQuantity = 0

  let whereCluse = {};
  whereCluse[`${wbManufacturingOutputTableName}.id`] = wbOutputManufacturingResult[0].id;
  whereCluse[`${wbManufacturingOutputTableName}.consigment_manufacturing_id`] = wbOutputManufacturingResult[0].consigment_manufacturing_id;
  whereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = wbOutputManufacturingResult[0].fabric_id;
  whereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
  whereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;

  const selectOutputManufaturingResults = await wbManufacturingOutputQueries.select(whereCluse)
  if (Array.isArray(selectOutputManufaturingResults) && selectOutputManufaturingResults.length > 0) {
    for (let i = 0; i < selectOutputManufaturingResults.length; i++) {
      const selectOutputManufaturingElement = selectOutputManufaturingResults[i];
      totalOutputCostManufacturingFee = totalOutputCostManufacturingFee + (toSafeNumber(selectOutputManufaturingElement.quantity) * toSafeNumber(selectOutputManufaturingElement[manufacturingFeeType]));
      totalOutputQuantity = totalOutputQuantity + toSafeNumber(selectOutputManufaturingElement.quantity)

      // input
      const selectInputManufaturingResults = await this.getTotalInputQuantityOfConsigment(selectOutputManufaturingElement, totalInputCostWithWaste, priceType)
      totalInputCostWithWaste = totalInputCostWithWaste + selectInputManufaturingResults

    }
  } else {
    return [0, 0, 0]
  }
  if (totalInputCostWithWaste == 0) {
    return [0, 0, 0]
  } else {
    return [totalInputCostWithWaste, totalOutputCostManufacturingFee, totalOutputQuantity]
  }
}