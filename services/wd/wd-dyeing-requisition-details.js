// Queries
const wdFormDyeingRequisitionDetailsWdQueries = require("../../db/queries/wd/wd-form-dyeing-requisition-details-wd");
const wdDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-dyeing-requisition-details");
const wdDyeingRequisitionQueries = require("../../db/queries/wd/wd-dyeing-requisition");
const wdFormDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-form-dyeing-requisition-details");
const wdDyeingOrderRequisitionDetailsQueries = require("../../db/queries/wd/wd-dyeing-order-requisition-details");
const wdFormOrderDetailsWdFormDetailsQueries = require("../../db/queries/wd/wd-form-order-details-wd-form-details");
const wdQueries = require("../../db/queries/wd/wd");
const weQueries = require("../../db/queries/we/we");

// Helper
const trans = require("../../helpers/transform");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");

// Services
const weService = require("../we/we");
const wdFormDyeingRequisitionDetailsWdService = require("./wd-form-dyeing-requisition-details-wd");
const wdFormDyeingRequisitionDetailsDyeingServicesService = require("./wd-form-dyeing-requisition-details-dyeing-services");
const { wdDyeingRequisitionDetailsTableName, wdFormDyeingRequisitionDetailsWdTableName, wdFormDyeingRequisitionDetailsTableName } = require("../../util/database-tables-name");

exports.create = async (wdDyeingRequisitionDetails) => {
    for (let i = 0; i < wdDyeingRequisitionDetails.items.length; i++) {
        wdDyeingRequisitionDetails.items[i].wdDyeingRequisitionDetailsId = trans.transform();
        wdDyeingRequisitionDetails.items[i].weId = trans.transform();

        let newQuantity = parseFloat(wdDyeingRequisitionDetails.items[i].quantity)

        // Select from wd_form_dyeing_requisition_details record
        let whereCluse = {}
        whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.id`] = wdDyeingRequisitionDetails.items[i].wdFormRequisitionDetailsId
        const selectWdFormDyeingRequisitionDetailsOneResult = await wdFormDyeingRequisitionDetailsQueries.selectOne(whereCluse)
        if (selectWdFormDyeingRequisitionDetailsOneResult[0] != null) {
            // Decrement currrent_quantity from wd_form_dyeing_requisition_details
            await wdFormDyeingRequisitionDetailsQueries.update({
                current_quantity: selectWdFormDyeingRequisitionDetailsOneResult[0].current_quantity - newQuantity
            }, {
                id: wdDyeingRequisitionDetails.items[i].wdFormRequisitionDetailsId
            })

            let results = false
            if (selectWdFormDyeingRequisitionDetailsOneResult[0].is_order == "1") {
                results = await wdDyeingRequisitionDetailsQueries.insertForOrder(wdDyeingRequisitionDetails, wdDyeingRequisitionDetails.items[i]);

                // decrement dyeing_current_quantity
                // Step (1) select record of order
                const selectOneDyeingOrder = await wdDyeingOrderRequisitionDetailsQueries.selectOne({
                    id: wdDyeingRequisitionDetails.items[i].wdFormDyeingOrderRequisitionDetailsId
                })
                if (selectOneDyeingOrder[0] != null) {
                    // Step (2) decrement dyeing_current_quantity
                    await wdDyeingOrderRequisitionDetailsQueries.update({
                        dyeing_current_quantity: selectOneDyeingOrder[0].dyeing_current_quantity - wdDyeingRequisitionDetails.items[i].dyeingQuantity
                    }, {
                        id: wdDyeingRequisitionDetails.items[i].wdFormDyeingOrderRequisitionDetailsId
                    })
                }

            } else {
                results = await wdDyeingRequisitionDetailsQueries.insert(wdDyeingRequisitionDetails, wdDyeingRequisitionDetails.items[i]);
            }
            if (!results) {
                return constants.insertError;
            } else {
                // add record in we
                await weService.createForDyeing(wdDyeingRequisitionDetails, wdDyeingRequisitionDetails.items[i])
            }
        }


    }
    return { ...constants.insertSuccess, ...{ id: wdDyeingRequisitionDetails.id } };
};

exports.selectByRequisitionId = async (requisitionId) => {
    // check is found
    const isFound = await wdDyeingRequisitionQueries.selectOne({
        ...constantsPayloads.deletePayload,
        id: requisitionId,
    });
    if (isFound[0] != null) {

        const results = await wdDyeingRequisitionDetailsQueries.selectByRequisitionId(requisitionId);
        return results;
    } else {
        return constants.itemNotFound;
    }
};

exports.update = async (wdDyeingRequisitionDetails) => {
    // Array for Promise
    let callArray = []

    // Check is found
    let whereCluse = {};
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.id`] = wdDyeingRequisitionDetails.id;
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wdDyeingRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
        let updateResults = false

        wdDyeingRequisitionDetails.wdDyeingRequisitionId = isFound[0].wd_dyeing_requisition_id

        // Update wd_dyeing_requisition Without Quantity
        callArray.push(wdDyeingRequisitionQueries.update({
            date: wdDyeingRequisitionDetails.date,
            note: wdDyeingRequisitionDetails.note,
            release_process: wdDyeingRequisitionDetails.releaseProcess
        },
            {
                id: wdDyeingRequisitionDetails.wdDyeingRequisitionId
            }))


        // Update wd_dyeing_requisition_details Without Quantity
        callArray.push(
            wdDyeingRequisitionDetailsQueries.update({
                price: wdDyeingRequisitionDetails.price,
                cost_price: wdDyeingRequisitionDetails.costPrice,
                fabric_piece: wdDyeingRequisitionDetails.numberFabricPieces,
                dyeing_fee: wdDyeingRequisitionDetails.dyeingFee,
                added_cost: wdDyeingRequisitionDetails.addedCost,
                fabric_width: wdDyeingRequisitionDetails.fabricWidth,
                fabric_quantity_m2: wdDyeingRequisitionDetails.fabricQuantityM2,
                work_order_number: wdDyeingRequisitionDetails.workOrderNumber,
                statement: wdDyeingRequisitionDetails.statement
            },
                {
                    id: wdDyeingRequisitionDetails.id
                })
        )
        // Update wd_form_dyeing_requisition_details Without Quantity
        callArray.push(
            wdFormDyeingRequisitionDetailsQueries.update({
                dyeing_colors_prices_id: wdDyeingRequisitionDetails.dyeingColorsPricesId
            },
                {
                    id: isFound[0].wd_form_dyeing_requisition_details_id
                })
        )

        // Update we
        callArray.push(
            this.updateDyeingQuantity(wdDyeingRequisitionDetails)
        )


        const promiesResult = await Promise.all(callArray)
        if (promiesResult[3] && typeof (promiesResult[3]) != "object") {
            let oldQuantity = isFound[0].quantity
            let newQuantity = parseFloat(wdDyeingRequisitionDetails.quantity)
            let defferenceQuantity = 0

            let formDyeungRequisitionDetailsWhereCluse = {}
            formDyeungRequisitionDetailsWhereCluse[`${wdFormDyeingRequisitionDetailsTableName}.id`] = isFound[0].wd_form_dyeing_requisition_details_id;
            formDyeungRequisitionDetailsWhereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
            formDyeungRequisitionDetailsWhereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;
            const selectFormDyeungRequisitionDetailsOneResult = await wdFormDyeingRequisitionDetailsQueries.selectOne(
                formDyeungRequisitionDetailsWhereCluse
            )
            if (selectFormDyeungRequisitionDetailsOneResult[0] != null) {
                const formDyeungRequisitionDetailsCurrentQuantity = selectFormDyeungRequisitionDetailsOneResult[0].current_quantity

                // Update Dyeing Cost price
                await this.updateDyeingCostPrice(wdDyeingRequisitionDetails.id)

                // Check Quantity
                if (newQuantity > oldQuantity) {
                    defferenceQuantity = parseFloat((newQuantity - oldQuantity).toFixed(3))

                    // we will decrement current quantity from store (wd_form_dyeing_requisition_details) by following Steps :
                    // Step 1 => Check If has form_current quantity in store (wd_form_dyeing_requisition_details)


                    if (formDyeungRequisitionDetailsCurrentQuantity >= defferenceQuantity) {

                        // Step 2 => Increment quantity in  wd_dyeing_requisition_details
                        await wdDyeingRequisitionDetailsQueries.update({
                            quantity: oldQuantity + defferenceQuantity
                        }, {
                            id: wdDyeingRequisitionDetails.id
                        })

                        // Step 3 => Decrement quantity in  wd_form_dyeing_requisition_details
                        await wdFormDyeingRequisitionDetailsQueries.update({
                            current_quantity: formDyeungRequisitionDetailsCurrentQuantity - defferenceQuantity
                        }, {
                            id: selectFormDyeungRequisitionDetailsOneResult[0].id
                        })
                        updateResults = true

                    } else {
                        return {
                            ...constants.wrongQuantity,
                            spentQuantity: formDyeungRequisitionDetailsCurrentQuantity,
                            newQuantity: defferenceQuantity
                        }
                    }
                } else if (newQuantity < oldQuantity) {
                    defferenceQuantity = parseFloat((oldQuantity - newQuantity).toFixed(3))

                    // Step 2 => Decrement quantity in  wd_dyeing_requisition_details
                    await wdDyeingRequisitionDetailsQueries.update({
                        quantity: oldQuantity - defferenceQuantity
                    }, {
                        id: wdDyeingRequisitionDetails.id
                    })

                    // Step 3 => Increment quantity in  wd_form_dyeing_requisition_details
                    await wdFormDyeingRequisitionDetailsQueries.update({
                        current_quantity: formDyeungRequisitionDetailsCurrentQuantity + defferenceQuantity
                    }, {
                        id: selectFormDyeungRequisitionDetailsOneResult[0].id
                    })
                    updateResults = true

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
        } else {
            return promiesResult[3]
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

exports.updateDyeingQuantity = async (wdDyeingRequisitionDetails) => {
    // select dyeing_requisition_details
    let whereCluse = {};
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.id`] = wdDyeingRequisitionDetails.id;
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;
    const selectDyeingRequisitionDetailsOneResult = await wdDyeingRequisitionDetailsQueries.selectOne(whereCluse)
    let oldDyeingQuantity = selectDyeingRequisitionDetailsOneResult[0].dyeing_quantity
    let defferenceQuantity = 0

    // select we record
    const selectWeOneResult = await weQueries.selectOne({
        wd_dyeing_requisition_details_id: wdDyeingRequisitionDetails.id
    })
    if (selectWeOneResult[0] != null) {
        let oldWeCurrentQuantity = selectWeOneResult[0].current_quantity
        let newQuantity = parseFloat(wdDyeingRequisitionDetails.dyeingQuantity)

        // Check Quantity
        if (newQuantity > oldDyeingQuantity) {
            defferenceQuantity = parseFloat((newQuantity - oldDyeingQuantity).toFixed(3))

            // Update we
            await weQueries.update({
                current_quantity: oldWeCurrentQuantity + defferenceQuantity,
            },
                {
                    wd_dyeing_requisition_details_id: wdDyeingRequisitionDetails.id
                })

            // Update wd_dyeing_requisition_details
            await wdDyeingRequisitionDetailsQueries.update({
                dyeing_quantity: oldDyeingQuantity + defferenceQuantity,
            },
                {
                    id: wdDyeingRequisitionDetails.id
                })

            // update order dyeing current quantity
            if (wdDyeingRequisitionDetails.wdFormDyeingOrderRequisitionDetailsId != null) {
                // decrement dyeing_current_quantity
                // Step (1) select record of order
                const selectOneDyeingOrder = await wdDyeingOrderRequisitionDetailsQueries.selectOne({
                    id: wdDyeingRequisitionDetails.wdFormDyeingOrderRequisitionDetailsId
                })
                if (selectOneDyeingOrder[0] != null) {
                    // Step (2) decrement dyeing_current_quantity
                    await wdDyeingOrderRequisitionDetailsQueries.update({
                        dyeing_current_quantity: selectOneDyeingOrder[0].dyeing_current_quantity - defferenceQuantity
                    }, {
                        id: wdDyeingRequisitionDetails.wdFormDyeingOrderRequisitionDetailsId
                    })
                }
            }

        } else if (newQuantity < oldDyeingQuantity) {
            defferenceQuantity = parseFloat((oldDyeingQuantity - newQuantity).toFixed(3))
            console.log("newQuantity :::: ", newQuantity);
            console.log("oldDyeingQuantity :::: ", oldDyeingQuantity);
            console.log("oldWeCurrentQuantity :::: ", oldWeCurrentQuantity);
            console.log("defferenceQuantity :::: ", defferenceQuantity);
            console.log("oldWeCurrentQuantity >= defferenceQuantity :::: ", oldWeCurrentQuantity >= defferenceQuantity);
            if (oldWeCurrentQuantity >= defferenceQuantity) {
                console.log("11111111111111111");
                // Update wd_dyeing_requisition_details
                await wdDyeingRequisitionDetailsQueries.update({
                    dyeing_quantity: oldDyeingQuantity - defferenceQuantity,
                },
                    {
                        id: wdDyeingRequisitionDetails.id
                    })

                // Update we
                weQueries.update({
                    current_quantity: oldWeCurrentQuantity - defferenceQuantity,
                },
                    {
                        wd_dyeing_requisition_details_id: wdDyeingRequisitionDetails.id
                    })

                // update order dyeing current quantity
                if (wdDyeingRequisitionDetails.wdFormDyeingOrderRequisitionDetailsId != null) {
                    // increment dyeing_current_quantity
                    // Step (1) select record of order
                    const selectOneDyeingOrder = await wdDyeingOrderRequisitionDetailsQueries.selectOne({
                        id: wdDyeingRequisitionDetails.wdFormDyeingOrderRequisitionDetailsId
                    })
                    if (selectOneDyeingOrder[0] != null) {
                        // Step (2) increment dyeing_current_quantity
                        await wdDyeingOrderRequisitionDetailsQueries.update({
                            dyeing_current_quantity: selectOneDyeingOrder[0].dyeing_current_quantity + defferenceQuantity
                        }, {
                            id: wdDyeingRequisitionDetails.wdFormDyeingOrderRequisitionDetailsId
                        })
                    }
                }


            } else {
                console.log("else ::: 11111111111111111");
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: oldWeCurrentQuantity,
                    newQuantity: defferenceQuantity
                }
            }
        } else {
            return true
        }
    }
    return true
}

exports.updateDyeingCostPrice = async (dyeingRequisitionDetailsId) => {
    // Check is found
    let whereCluse = {};
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.id`] = dyeingRequisitionDetailsId;
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wdDyeingRequisitionDetailsQueries.selectOneWithDyeingServices(whereCluse);
    if (isFound[0] != null) {
        let costPrice = await this.getSumTotalCostOfDyeing(isFound[0])

        let updateResults = false
        updateResults = await wdDyeingRequisitionDetailsQueries.update({
            cost_price: costPrice,
        },
            {
                id: dyeingRequisitionDetailsId
            })

        if (updateResults) {
            return constants.updateSuccess;
        } else {
            return constants.updateError;
        }

    } else {
        return constants.itemNotFound;
    }
};

exports.getSumTotalCostOfDyeing = async (dataSourceSearchTabel) => {
    if (dataSourceSearchTabel == null) {
        dataSourceSearchTabel = []
    }
    let sum = 0
    const element = dataSourceSearchTabel;
    sum = await this.getTotalCost(parseFloat(element.price), element.quantity, element.dyeingServices,
        (parseFloat(element.dyeing_fee) + parseFloat(element.added_cost)), parseFloat(element.fabric_piece)) / element.dyeing_quantity
    return parseFloat((sum).toFixed(3))
}

exports.getTotalCost = async (price, quantity, services, dyeingFee, fabricPiece) => {

    let sum = 0

    for (let index = 0; index < services.length; index++) {
        const element = services[index];
        if (element.is_fabric_piece) {
            sum = sum + (element.price * fabricPiece)
        }
        else {
            sum = sum + (quantity * element.price)
        }
    }
    sum = sum + (dyeingFee * quantity)
    return sum + (price * quantity)
}