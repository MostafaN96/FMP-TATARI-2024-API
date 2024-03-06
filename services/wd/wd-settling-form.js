// Services
const wdFormDyeingRequisitionDetailsService = require("./wd-form-dyeing-requisition-details");
const wdFormDyeingRequisitionDetailsWdService = require("./wd-form-dyeing-requisition-details-wd");

// Queries
const generalQueries = require("../../db/queries/general/general");
const wdQueries = require("../../db/queries/wd/wd");
const wdFormDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-form-dyeing-requisition-details");
const wdFormOrderDetailsWdFormDetailsQueries = require("../../db/queries/wd/wd-form-order-details-wd-form-details");
const wdDyeingOrderRequisitionDetailsQueries = require("../../db/queries/wd/wd-dyeing-order-requisition-details");
const wdFormDyeingRequisitionDetailsWdQueries = require("../../db/queries/wd/wd-form-dyeing-requisition-details-wd");

// Util
const constants = require("../../util/constants");
const { wdFormDyeingRequisitionDetailsTableName, wdFormDyeingRequisitionDetailsWdTableName } = require("../../util/database-tables-name");

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wdSettlingForm) => {

    let results = false
    for (let i = 0; i < wdSettlingForm.items.length; i++) {
        const element = wdSettlingForm.items[i];

        if (element.wdFormDyeingOrderRequisitionDetailsId != null) {
            console.log("settlingFormByOrder");
            results = await this.settlingFormByOrder(element)
        } else {
            console.log("settlingForm");
            results = await this.settlingForm(element)
        }

    }

    if (results) {
        return results;
    } else {
        return constants.insertError;
    }
};

exports.settlingForm = async (wdSettlingForm) => {
    let updateResults = false

    // Check is found
    let whereCluse = {};
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.id`] = wdSettlingForm.wdFormDyeingRequisitionDetailsId;
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wdFormDyeingRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {

        let oldQuantity = isFound[0].quantity
        let formCurrentQuantity = isFound[0].current_quantity
        let newQuantity = 0
        let defferenceFormQuantity = 0

        defferenceFormQuantity = parseFloat((formCurrentQuantity - newQuantity).toFixed(3))

        if (formCurrentQuantity >= defferenceFormQuantity) {
            // Step 1 => Decrement quantity in  wd_form_dyeing_requisition_details
            await wdFormDyeingRequisitionDetailsQueries.update({
                quantity: oldQuantity - defferenceFormQuantity,
                current_quantity: formCurrentQuantity - defferenceFormQuantity
            }, {
                id: wdSettlingForm.wdFormDyeingRequisitionDetailsId
            })

            // Step 2 => Select From wd_form_dyeing_requisition_details_wd Records
            let whereCluseDetailsWd = {};
            whereCluseDetailsWd[`${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`] = wdSettlingForm.wdFormDyeingRequisitionDetailsId;
            whereCluseDetailsWd[`${wdFormDyeingRequisitionDetailsWdTableName}.is_deleted`] = 0;
            whereCluseDetailsWd[`${wdFormDyeingRequisitionDetailsWdTableName}.is_active`] = 1;
            const wdFormDyeingRequisitionDetailsWdRecords = await wdFormDyeingRequisitionDetailsWdService.selectWithTwoCondition(whereCluseDetailsWd,
                ["quantity", ">", "0"])
            if (wdFormDyeingRequisitionDetailsWdRecords[0] != null) {
                for (let j = 0; j < wdFormDyeingRequisitionDetailsWdRecords.length; j++) {
                    const wdFormDyeingRequisitionDetailsWdRecord = wdFormDyeingRequisitionDetailsWdRecords[j];
                    let wdFormDyeingRequisitionDetailsWdQuantity = wdFormDyeingRequisitionDetailsWdRecord.quantity
                    let updatedQuantity = 0

                    if (wdFormDyeingRequisitionDetailsWdQuantity >= defferenceFormQuantity) {
                        // Decrement wd_form_dyeing_requisition_details_wd quantity
                        await wdFormDyeingRequisitionDetailsWdQueries.update({
                            quantity: wdFormDyeingRequisitionDetailsWdQuantity - defferenceFormQuantity
                        }, {
                            wd_form_dyeing_requisition_details_id: wdSettlingForm.wdFormDyeingRequisitionDetailsId,
                            wd_id: wdFormDyeingRequisitionDetailsWdRecord.wd_id
                        })
                        updatedQuantity = defferenceFormQuantity
                        defferenceFormQuantity = 0
                    } else {
                        // Decrement wd_form_dyeing_requisition_details_wd quantity
                        await wdFormDyeingRequisitionDetailsWdQueries.update({
                            quantity: 0
                        }, {
                            wd_form_dyeing_requisition_details_id: wdSettlingForm.wdFormDyeingRequisitionDetailsId,
                            wd_id: wdFormDyeingRequisitionDetailsWdRecord.wd_id
                        })
                        updatedQuantity = wdFormDyeingRequisitionDetailsWdQuantity
                        defferenceFormQuantity = parseFloat((defferenceFormQuantity - wdFormDyeingRequisitionDetailsWdQuantity).toFixed(3))
                    }

                    // select wd record
                    const wdRecord = await wdQueries.selectOne({
                        id: wdFormDyeingRequisitionDetailsWdRecord.wd_id
                    })
                    if (wdRecord[0] != null) {
                        const oldCurrentQuantity = wdRecord[0].current_quantity

                        // Increment wd current_quantity
                        await wdQueries.update({
                            current_quantity: oldCurrentQuantity + updatedQuantity
                        }, {
                            id: wdRecord[0].id
                        })
                    }

                    if (defferenceFormQuantity == 0) {
                        updateResults = true
                        break;
                    }
                }

            } else {
                updateResults = false
            }
        } else {
            return {
                ...constants.wrongQuantity,
                spentQuantity: formCurrentQuantity,
                newQuantity: defferenceFormQuantity
            }
        }
    } else {
        return constants.itemNotFound;
    }
    return updateResults
}

exports.settlingFormByOrder = async (wdSettlingForm) => {
    // Check is found
    let updateResults = false

    let whereCluse = {};
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.id`] = wdSettlingForm.wdFormDyeingRequisitionDetailsId;
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;
    const isFound = await wdFormDyeingRequisitionDetailsQueries.selectOne(whereCluse);
    if (isFound[0] != null) {

        const selectwdFormOrderDetailsWdFormDetailsOneResult = await wdFormOrderDetailsWdFormDetailsQueries.selectOne({
            wd_form_dyeing_requisition_details_id: wdSettlingForm.wdFormDyeingRequisitionDetailsId
        })

        const selectWdDyeingOrderRequisitionDetailsOneResult = await wdDyeingOrderRequisitionDetailsQueries.selectOne({
            id: selectwdFormOrderDetailsWdFormDetailsOneResult[0].wd_form_dyeing_order_requisition_details_id
        })

        let oldQuantity = isFound[0].quantity
        let formCurrentQuantity = isFound[0].current_quantity
        let newQuantity = 0
        let defferenceFormQuantity = 0

        defferenceFormQuantity = parseFloat((formCurrentQuantity - newQuantity).toFixed(3))

        if (formCurrentQuantity >= defferenceFormQuantity) {
            let callArray = []

            // Step 1 => Decrement quantity in  wd_form_dyeing_requisition_details
            callArray.push(await wdFormDyeingRequisitionDetailsQueries.update({
                quantity: oldQuantity - defferenceFormQuantity,
                current_quantity: formCurrentQuantity - defferenceFormQuantity
            }, {
                id: wdSettlingForm.wdFormDyeingRequisitionDetailsId
            }))

            // Decrement quantity in wd_form_order_details_wd_form_details
            callArray.push(await wdFormOrderDetailsWdFormDetailsQueries.update({
                quantity: selectwdFormOrderDetailsWdFormDetailsOneResult[0].quantity - defferenceFormQuantity
            }, {
                wd_form_dyeing_requisition_details_id: wdSettlingForm.wdFormDyeingRequisitionDetailsId,
                wd_form_dyeing_order_requisition_details_id: selectwdFormOrderDetailsWdFormDetailsOneResult[0].wd_form_dyeing_order_requisition_details_id,
            }))

            // Increment form_current_quantity in wd_form_dyeing_order_requisition_details
            callArray.push(await wdDyeingOrderRequisitionDetailsQueries.update({
                form_current_quantity: selectWdDyeingOrderRequisitionDetailsOneResult[0].form_current_quantity + defferenceFormQuantity
            }, {
                id: selectWdDyeingOrderRequisitionDetailsOneResult[0].id,
            }))
            await Promise.all(callArray)

            // Step 2 => Select From wd_form_dyeing_requisition_details_wd Records
            let whereCluseDetailsWd = {};
            whereCluseDetailsWd[`${wdFormDyeingRequisitionDetailsWdTableName}.wd_form_dyeing_requisition_details_id`] = wdSettlingForm.wdFormDyeingRequisitionDetailsId;
            whereCluseDetailsWd[`${wdFormDyeingRequisitionDetailsWdTableName}.is_deleted`] = 0;
            whereCluseDetailsWd[`${wdFormDyeingRequisitionDetailsWdTableName}.is_active`] = 1;
            const wdFormDyeingRequisitionDetailsWdRecords = await wdFormDyeingRequisitionDetailsWdService.selectWithTwoCondition(whereCluseDetailsWd,
                ["quantity", ">", "0"])
            if (wdFormDyeingRequisitionDetailsWdRecords[0] != null) {
                for (let j = 0; j < wdFormDyeingRequisitionDetailsWdRecords.length; j++) {
                    const wdFormDyeingRequisitionDetailsWdRecord = wdFormDyeingRequisitionDetailsWdRecords[j];
                    let wdFormDyeingRequisitionDetailsWdQuantity = wdFormDyeingRequisitionDetailsWdRecord.quantity
                    let updatedQuantity = 0

                    if (wdFormDyeingRequisitionDetailsWdQuantity >= defferenceFormQuantity) {
                        // Decrement wd_form_dyeing_requisition_details_wd quantity
                        await wdFormDyeingRequisitionDetailsWdQueries.update({
                            quantity: wdFormDyeingRequisitionDetailsWdQuantity - defferenceFormQuantity
                        }, {
                            wd_form_dyeing_requisition_details_id: wdSettlingForm.wdFormDyeingRequisitionDetailsId,
                            wd_id: wdFormDyeingRequisitionDetailsWdRecord.wd_id
                        })
                        updatedQuantity = defferenceFormQuantity
                        defferenceFormQuantity = 0
                    } else {
                        // Decrement wd_form_dyeing_requisition_details_wd quantity
                        await wdFormDyeingRequisitionDetailsWdQueries.update({
                            quantity: 0
                        }, {
                            wd_form_dyeing_requisition_details_id: wdSettlingForm.wdFormDyeingRequisitionDetailsId,
                            wd_id: wdFormDyeingRequisitionDetailsWdRecord.wd_id
                        })
                        updatedQuantity = wdFormDyeingRequisitionDetailsWdQuantity
                        defferenceFormQuantity = parseFloat((defferenceFormQuantity - wdFormDyeingRequisitionDetailsWdQuantity).toFixed(3))
                    }

                    // select wd record
                    const wdRecord = await wdQueries.selectOne({
                        id: wdFormDyeingRequisitionDetailsWdRecord.wd_id
                    })
                    if (wdRecord[0] != null) {
                        const oldCurrentQuantity = wdRecord[0].current_quantity

                        // Increment wd current_quantity
                        await wdQueries.update({
                            current_quantity: oldCurrentQuantity + updatedQuantity
                        }, {
                            id: wdRecord[0].id
                        })
                    }

                    if (defferenceFormQuantity == 0) {
                        updateResults = true
                        break;
                    }
                }

            } else {
                updateResults = false
            }
        } else {
            return {
                ...constants.wrongQuantity,
                spentQuantity: formCurrentQuantity,
                newQuantity: defferenceFormQuantity
            }
        }

    } else {
        return constants.itemNotFound;
    }
    return updateResults
}