// Queries
const wbManufacturingInputQueries = require("../../db/queries/wb/wb-manufacturing-input");
const wbManufacturingOutputQueries = require("../../db/queries/wb/wb-manufacturing-output");
const wbManufacturingInputOutputQueries = require("../../db/queries/wb/wb-manufacturing-input-output");
const wbManufacturingInputWbQueries = require("../../db/queries/wb/wb-manufacturing-input-wb");
const wbManufacturingRequisitionQueries = require("../../db/queries/wb/wb-manufacturing-requisition");
const wbManufacturingOrderRequisitionDetailsQueries = require("../../db/queries/wb/wb-manufacturing-order-requisition-details");
const wbQueries = require("../../db/queries/wb/wb");
const wcFabricOrderRequisitionDetailsQueries = require("../../db/queries/wc/wc-fabric-order-requisition-details");

// Services
const wbService = require("./wb");
const wbManufacturingInputWbService = require("./wb-manufacturing-input-wb");
const wbManufacturingOutputService = require("./wb-manufacturing-output");
const wbManufacturingInputOutputService = require("./wb-manufacturing-input-output");
const wbManufacturingOutputOrderService = require("./wb-manufacturing-output-order");
const wcService = require("../wc/wc");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const {
    wbManufacturingOrderRequisitionDetailsTableName,
    wbManufacturingInputTableName,
    wbManufacturingInputWbTableName,
    wbManufacturingInputOutputTableName,
    wcFabricOrderRequisitionDetailsTableName
} = require("../../util/database-tables-name");

exports.create = async (wbManufacturingInput, isOrder) => {

    // Get wc fabric order by order requisition id
    let wcFabricOrderRequisitionDetailsWhereCluse = {};
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
    // wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.is_order`] = 1;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`] = wbManufacturingInput.ordersRequisitionsId;
    wcFabricOrderRequisitionDetailsWhereCluse[`${wcFabricOrderRequisitionDetailsTableName}.fabric_id`] = wbManufacturingInput.fabricId;

    const selectWcFabricOrderRequisitionDetailsResult = await wcFabricOrderRequisitionDetailsQueries.selectByRequisitionId(wcFabricOrderRequisitionDetailsWhereCluse)
    if (Array.isArray(selectWcFabricOrderRequisitionDetailsResult) && selectWcFabricOrderRequisitionDetailsResult.length > 0) {
        wbManufacturingInput.wcFabricOrderRequisitionDetailsId = selectWcFabricOrderRequisitionDetailsResult[0].id
        wbManufacturingInput.fabricOrderId = selectWcFabricOrderRequisitionDetailsResult[0].requisition_id

        // wbManufacturingOutput
        wbManufacturingInput.wbManufacturingOutputId = trans.transform();
        const wbManufacturingOutputResult = await wbManufacturingOutputService.create(wbManufacturingInput)

        if (wbManufacturingOutputResult == constants.insertSuccess) {
            for (let i = 0; i < wbManufacturingInput.items.length; i++) {
                wbManufacturingInput.items[i].wbManufacturingInputId = trans.transform();

                // Add wbManufacturingInput
                const results = await wbManufacturingInputQueries.insert(wbManufacturingInput, wbManufacturingInput.items[i]);
                if (!results) {
                    return constants.insertError;
                } else {
                    let newQuantity = parseFloat(wbManufacturingInput.items[i].quantityWithWaste)
                    // select wb Yarn for decrement current quantity
                    const yarnsStoredInWaResult = await wbService.selectRecordsByIndustryByYarnByYarnLot(
                        wbManufacturingInput.industryId,
                        wbManufacturingInput.items[i].yarnId,
                        wbManufacturingInput.items[i].yarnLotId,
                        wbManufacturingInput.items[i].consigmentYarnId,
                        wbManufacturingInput.yarnOrderId
                    )
                    if (yarnsStoredInWaResult[0] != null) {

                        for (let j = 0; j < yarnsStoredInWaResult.length; j++) {
                            const yarnStoredInWb = yarnsStoredInWaResult[j];
                            let currentQuantity = yarnStoredInWb.current_quantity
                            let updatedQuantity = 0

                            // decrement wb Yarn CurrentQuantity
                            let returnedQuantityObj = await wbService.decrementWbCurrentQuantity(newQuantity, currentQuantity, yarnStoredInWb, updatedQuantity);
                            newQuantity = returnedQuantityObj.newQuantity
                            updatedQuantity = returnedQuantityObj.updatedQuantity
                            wbManufacturingInput.items[i].wbId = yarnStoredInWb.id
                            wbManufacturingInput.items[i].updatedQuantity = updatedQuantity

                            // Add wb Manufacturing Input wb
                            await wbManufacturingInputWbService.create(wbManufacturingInput, wbManufacturingInput.items[i])

                            // Enter to if condition when stock runs out
                            if (newQuantity == 0) {
                                break;
                            }
                        }

                        // Add wb Manufacturing Input Output
                        await wbManufacturingInputOutputService.create(wbManufacturingInput, wbManufacturingInput.items[i], isOrder)

                    } else {
                        return {
                            ...constants.wrongQuantity,
                            spentQuantity: 0,
                            newQuantity: newQuantity
                        }
                    }
                }
                if (i == wbManufacturingInput.items.length - 1) {
                    // Add Wc
                    await wcService.createForManufacturing(wbManufacturingInput)
                    // manufacturing order
                    if (isOrder) {
                        await this.createOrder(wbManufacturingInput)
                    }
                }
            }
        }


        return { ...constants.insertSuccess, ...{ id: wbManufacturingInput.id } };
    }
};


exports.createInputDetails = async (wbManufacturingInput, isOrder) => {
    for (let i = 0; i < wbManufacturingInput.items.length; i++) {
        wbManufacturingInput.items[i].wbManufacturingInputId = trans.transform();

        // Add wbManufacturing Input
        const results = await wbManufacturingInputQueries.insert(wbManufacturingInput, wbManufacturingInput.items[i]);
        if (!results) {
            return constants.insertError;
        } else {
            let newQuantity = parseFloat(wbManufacturingInput.items[i].quantityWithWaste)
            // select wb Yarn for decrement current quantity
            const yarnsStoredInWaResult = await wbService.selectRecordsByIndustryByYarnByYarnLot(
                wbManufacturingInput.industryId,
                wbManufacturingInput.items[i].yarnId,
                wbManufacturingInput.items[i].yarnLotId,
                wbManufacturingInput.items[i].consigmentYarnId)
            if (yarnsStoredInWaResult[0] != null) {

                for (let j = 0; j < yarnsStoredInWaResult.length; j++) {
                    const yarnStoredInWb = yarnsStoredInWaResult[j];
                    let currentQuantity = yarnStoredInWb.current_quantity
                    let updatedQuantity = 0

                    // decrement wb Yarn CurrentQuantity
                    let returnedQuantityObj = await wbService.decrementWbCurrentQuantity(newQuantity, currentQuantity, yarnStoredInWb, updatedQuantity);
                    newQuantity = returnedQuantityObj.newQuantity
                    updatedQuantity = returnedQuantityObj.updatedQuantity
                    wbManufacturingInput.items[i].wbId = yarnStoredInWb.id
                    wbManufacturingInput.items[i].updatedQuantity = updatedQuantity

                    // Add wb Manufacturing Input wb
                    await wbManufacturingInputWbService.create(wbManufacturingInput, wbManufacturingInput.items[i])

                    // Enter to if condition when stock runs out
                    if (newQuantity == 0) {
                        break;
                    }
                }

                // Add wb Manufacturing Input Output
                await wbManufacturingInputOutputService.create(wbManufacturingInput, wbManufacturingInput.items[i], isOrder)

            } else {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: 0,
                    newQuantity: newQuantity
                }
            }
        }

    }
    // Check all ratio of requisition
    await calculateInputsRatios([{
        wb_manufacturing_requisition_id: wbManufacturingInput.id
    }]);

    // calc fabric price
    let fabricPrice = 0
    let fabricPriceDollar = 0
    const selectInputManufacturingResult = await this.selectByRequisitionId(wbManufacturingInput.id)
    if (selectInputManufacturingResult[0] != null) {

        const selectOutputManufacturingOneResult = await wbManufacturingOutputQueries.selectByRequisitionId(wbManufacturingInput.id)
        if (selectOutputManufacturingOneResult[0] != null) {
            fabricPrice = await wbManufacturingOutputService.calcAvgFabricPrice(selectInputManufacturingResult, selectOutputManufacturingOneResult)
            fabricPriceDollar = await wbManufacturingOutputService.calcAvgFabricPriceDollar(selectInputManufacturingResult, selectOutputManufacturingOneResult)
            await wbManufacturingOutputQueries.update({
                price: fabricPrice,
                price_dollar: fabricPriceDollar
            }, {
                // id: selectOutputManufacturingOneResult[0].id
                fabric_id: selectOutputManufacturingOneResult[0].fabric_id,
                consigment_manufacturing_id: selectOutputManufacturingOneResult[0].consigment_manufacturing_id
            })
        }
    }

    return { ...constants.insertSuccess, ...{ id: wbManufacturingInput.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wbManufacturingRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        let results = await wbManufacturingInputQueries.selectByRequisitionId(requisitionId);
        if (results[0] == null) {
            results = await wbManufacturingInputQueries.selectOneByRequisitionId(requisitionId);
        }
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.selectInputQuantitiesByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wbManufacturingRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await wbManufacturingInputQueries.selectInputQuantitiesByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};


// Order Function
exports.createOrder = async (wbManufacturingInput) => {
    for (let i = 0; i < wbManufacturingInput.itemsOrder.length; i++) {
        const orderElement = wbManufacturingInput.itemsOrder[i];
        await wbManufacturingOutputOrderService.create(wbManufacturingInput, orderElement)

        let whereCluse = {};
        whereCluse[`${wbManufacturingOrderRequisitionDetailsTableName}.id`] = orderElement.manufacturingOrderRequisitionDetailsId;
        let selectManifacturingOrderRequisitionDetailsOneResult = await wbManufacturingOrderRequisitionDetailsQueries.selectOne(whereCluse)

        if (selectManifacturingOrderRequisitionDetailsOneResult[0].current_quantity >= parseFloat(orderElement.quantity)) {
            await wbManufacturingOrderRequisitionDetailsQueries.update({
                current_quantity: selectManifacturingOrderRequisitionDetailsOneResult[0].current_quantity - parseFloat(orderElement.quantity)
            }, {
                id: orderElement.manufacturingOrderRequisitionDetailsId
            })
        } else {
            let excessQuantity = parseFloat((orderElement.quantity - selectManifacturingOrderRequisitionDetailsOneResult[0].current_quantity).toFixed(3))
            await wbManufacturingOrderRequisitionDetailsQueries.update({
                initial_quantity: selectManifacturingOrderRequisitionDetailsOneResult[0].initial_quantity + excessQuantity,
                current_quantity: 0,
                is_order: "0"
            }, {
                id: orderElement.manufacturingOrderRequisitionDetailsId
            })
        }
    }
    return
};

exports.update = async (wbManufacturingInput) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wbManufacturingInputTableName}.id`] = wbManufacturingInput.id;
    whereCluse[`${wbManufacturingInputTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingInputTableName}.is_active`] = 1;
    const isFound = await wbManufacturingInputQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        wbManufacturingInput.wbManufacturingRequisitionId = isFound[0].wb_manufacturing_requisition_id

        // Update wb Manufacturing requisition Without Quantity
        callArray.push(wbManufacturingRequisitionQueries.update({
            date: wbManufacturingInput.date,
            note: wbManufacturingInput.note,
            status: wbManufacturingInput.status,
        },
            {
                id: wbManufacturingInput.wbManufacturingRequisitionId
            }))


        // Update wb Manufacturing Input Without Quantity
        callArray.push(
            wbManufacturingInputQueries.update({
                price: wbManufacturingInput.price,
                price_dollar: wbManufacturingInput.priceDollar,
                statement: wbManufacturingInput.statement
            },
                {
                    id: wbManufacturingInput.id
                })
        )
        await Promise.all(callArray)

        let oldQuantity = isFound[0].quantity_with_waste
        let newQuantity = parseFloat(wbManufacturingInput.quantityWithWaste)
        let defferenceQuantity = 0

        // Check Quantity
        if (newQuantity > oldQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

            // we will decrement current quantity from store (wb yarn) by following Steps :
            // Step 1 => Check If has current quantity in store (wb yarn)
            const sumCurrentQuantityWb = await wbService.selectSumCurrentQuantityByIndustryByYarnByYarnLotInWb(
                isFound[0].industry_id,
                isFound[0].yarn_id,
                isFound[0].yarn_lot_id,
                isFound[0].consigment_yarn_id,
            )
            if (sumCurrentQuantityWb[0] != null) {
                console.log("sumCurrentQuantityWb ::: ", sumCurrentQuantityWb);
                const sumCurrentQuantity = sumCurrentQuantityWb[0].current_quantity
                if (sumCurrentQuantity >= defferenceQuantity) {

                    // Step 2 => Increment quantity in  wb_manufacturing_input
                    await wbManufacturingInputQueries.update({
                        quantity: wbManufacturingInput.quantity,
                        quantity_with_waste: oldQuantity + defferenceQuantity,
                        wast_ratio: wbManufacturingInput.wastRatio
                    }, {
                        id: wbManufacturingInput.id
                    })

                    // Check all ratio of requisition
                    await calculateInputsRatios(isFound);

                    // Step 3 => select from (WB) Records for decrement current quantity
                    const wbRecords = await wbService.selectRecordsByIndustryByYarnByYarnLot(
                        isFound[0].industry_id,
                        isFound[0].yarn_id,
                        isFound[0].yarn_lot_id,
                        isFound[0].consigment_yarn_id,
                    )
                    if (wbRecords[0] != null) {
                        // console.log("wbRecords ::: ", wbRecords);
                        for (let i = 0; i < wbRecords.length; i++) {
                            const wbRecord = wbRecords[i];
                            let currentQuantity = wbRecord.current_quantity
                            let updatedQuantity = 0

                            // decrement Wb yarn CurrentQuantity
                            let returnedQuantityObj = await wbService.decrementWbCurrentQuantity(defferenceQuantity, currentQuantity, wbRecord, updatedQuantity);
                            defferenceQuantity = returnedQuantityObj.newQuantity
                            updatedQuantity = returnedQuantityObj.updatedQuantity

                            // Step 4 => Check if wb_id existed in wb_manufacture_input_wb
                            // that has same wb_manufacturing_input_id
                            const isExisitId = await wbManufacturingInputWbService.select({
                                wb_manufacturing_input_id: wbManufacturingInput.id,
                                wb_id: wbRecord.id
                            })

                            if (isExisitId[0] != null) {
                                // Step 4.1 => Update Quantity in wb_manufacture_input_wb
                                updateResults = await wbManufacturingInputWbQueries.update({
                                    quantity: isExisitId[0].quantity + updatedQuantity
                                }, {
                                    wb_manufacturing_input_id: wbManufacturingInput.id,
                                    wb_id: isExisitId[0].wb_id
                                })
                            } else {
                                // Step 4.2 Add Record in wb_manufacture_input_wb
                                updateResults = await wbManufacturingInputWbService.create(wbManufacturingInput, {
                                    wbManufacturingInputId: wbManufacturingInput.id,
                                    wbId: wbRecord.id,
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

            // Step 1 => Decrement quantity in  wb_manufacturing_input
            await wbManufacturingInputQueries.update({
                quantity: wbManufacturingInput.quantity,
                quantity_with_waste: oldQuantity - defferenceQuantity,
                wast_ratio: wbManufacturingInput.wastRatio
            }, {
                id: wbManufacturingInput.id
            })

            // Check all ratio of requisition
            await calculateInputsRatios(isFound);

            // Step 2 => Select From wb_manufacture_input_wb Records
            let whereClusewbManufacturingInputWb = {};
            whereClusewbManufacturingInputWb[`${wbManufacturingInputWbTableName}.wb_manufacturing_input_id`] = wbManufacturingInput.id;
            whereClusewbManufacturingInputWb[`${wbManufacturingInputWbTableName}.is_deleted`] = 0;
            whereClusewbManufacturingInputWb[`${wbManufacturingInputWbTableName}.is_active`] = 1;
            const wbManufacturingInputWbRecords = await wbManufacturingInputWbService.selectWithTwoCondition(whereClusewbManufacturingInputWb,
                ["quantity", ">", "0"])
            if (wbManufacturingInputWbRecords[0] != null) {
                for (let j = 0; j < wbManufacturingInputWbRecords.length; j++) {
                    const wbManufacturingInputWbRecord = wbManufacturingInputWbRecords[j];
                    let wbManufacturingInputWbQuantity = wbManufacturingInputWbRecord.quantity
                    let updatedQuantity = 0

                    if (wbManufacturingInputWbQuantity >= defferenceQuantity) {
                        // Decrement wb_manufacture_input_wb quantity
                        await wbManufacturingInputWbQueries.update({
                            quantity: wbManufacturingInputWbQuantity - defferenceQuantity
                        }, {
                            wb_manufacturing_input_id: wbManufacturingInput.id,
                            wb_id: wbManufacturingInputWbRecord.wb_id
                        })
                        updatedQuantity = defferenceQuantity
                        defferenceQuantity = 0
                    } else {
                        // Decrement wb_manufacture_input_wb quantity
                        await wbManufacturingInputWbQueries.update({
                            quantity: 0
                        }, {
                            wb_manufacturing_input_id: wbManufacturingInput.id,
                            wb_id: wbManufacturingInputWbRecord.wb_id
                        })
                        updatedQuantity = wbManufacturingInputWbQuantity
                        defferenceQuantity = parseFloat((defferenceQuantity - wbManufacturingInputWbQuantity).toFixed(3))
                    }

                    // select wb yarn record
                    const wbRecord = await wbQueries.selectOne({
                        id: wbManufacturingInputWbRecord.wb_id
                    })
                    if (wbRecord[0] != null) {
                        const oldCurrentQuantity = wbRecord[0].current_quantity

                        // Increment wb current_quantity
                        await wbQueries.update({
                            current_quantity: oldCurrentQuantity + updatedQuantity
                        }, {
                            id: wbRecord[0].id
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

            // calc fabric price
            let fabricPrice = 0
            let fabricPriceDollar = 0
            const selectInputManufacturingResult = await this.selectByRequisitionId(isFound[0].wb_manufacturing_requisition_id)
            if (selectInputManufacturingResult[0] != null) {

                const selectOutputManufacturingOneResult = await wbManufacturingOutputQueries.selectByRequisitionId(isFound[0].wb_manufacturing_requisition_id)
                if (selectOutputManufacturingOneResult[0] != null) {
                    fabricPrice = await wbManufacturingOutputService.calcAvgFabricPrice(selectInputManufacturingResult, selectOutputManufacturingOneResult)
                    fabricPriceDollar = await wbManufacturingOutputService.calcAvgFabricPriceDollar(selectInputManufacturingResult, selectOutputManufacturingOneResult)
                    await wbManufacturingOutputQueries.update({
                        price: fabricPrice,
                        price_dollar: fabricPriceDollar
                    }, {
                        // id: selectOutputManufacturingOneResult[0].id
                        fabric_id: selectOutputManufacturingOneResult[0].fabric_id,
                        consigment_manufacturing_id: selectOutputManufacturingOneResult[0].consigment_manufacturing_id
                    })
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
async function calculateInputsRatios(isFound) {
    // Firstly, select all records of requisition
    const inputRecords = await wbManufacturingInputQueries.selectInputQuantitiesByRequisitionId(isFound[0].wb_manufacturing_requisition_id);
    let sumInputQuantities = 0;
    for (let i = 0; i < inputRecords.length; i++) {
        const inputRecord = inputRecords[i];
        sumInputQuantities = sumInputQuantities + inputRecord.quantity;
    }
    for (let j = 0; j < inputRecords.length; j++) {
        const inputRecord = inputRecords[j];
        const ratio = (inputRecord.quantity / sumInputQuantities) * 100;
        // update
        await wbManufacturingInputQueries.update({
            ratio: ratio
        }, {
            id: inputRecord.id
        });
    }
}

exports.selectByFabricByConsigmentManufacturing = async (fabricId, consigmentManufacturingId) => {
    const results = await wbManufacturingInputQueries.selectByFabricByConsigmentManufacturing(fabricId, consigmentManufacturingId);
    return results;
};