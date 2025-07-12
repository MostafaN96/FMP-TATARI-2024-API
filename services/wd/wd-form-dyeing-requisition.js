// Services
const wdFormDyeingRequisitionDetailsService = require("./wd-form-dyeing-requisition-details");
const wdService = require("./wd");

// Queries
const wdFormDyeingRequisitionQueries = require("../../db/queries/wd/wd-form-dyeing-requisition");
const wdDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-dyeing-order-requisition-details");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wdFormDyeingRequisitionTableName = require("../../util/database-tables-name").wdFormDyeingRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wdFormDyeingRequisition) => {
    wdFormDyeingRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wdFormDyeingRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wdFormDyeingRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wdFormDyeingRequisitionQueries.selectOne({ number: wdFormDyeingRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    // checkValidQuantityInWd
    // let results = false
    // for (let k = 0; k < wdFormDyeingRequisition.items.length; k++) {
    //     const element = wdFormDyeingRequisition.items[k];
    //     const checkValidWbQuantityResult = this.checkValidQuantityInWd(wdFormDyeingRequisition, element)
    //     results = checkValidWbQuantityResult
    //     if (checkValidWbQuantityResult  && typeof(checkValidWbQuantityResult) != "object") {
    //         if(k == wdFormDyeingRequisition.items.length-1) {
    //             results = await wdFormDyeingRequisitionQueries.insert(wdFormDyeingRequisition);
    //             if (results) {
    //                 return await wdFormDyeingRequisitionDetailsService.create(wdFormDyeingRequisition);
    //             } else {
    //                 return constants.insertError;
    //             }
    //         }
    //     } else {
    //         return results = checkValidWbQuantityResult
    //     }
    // }

    const results = await wdFormDyeingRequisitionQueries.insert(wdFormDyeingRequisition);
    if (results) {
        return await wdFormDyeingRequisitionDetailsService.create(wdFormDyeingRequisition);
    } else {
        return constants.insertError;
    }

};

exports.createForOrder = async (wdFormDyeingRequisition) => {
    wdFormDyeingRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wdFormDyeingRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wdFormDyeingRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wdFormDyeingRequisitionQueries.selectOne({ number: wdFormDyeingRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }
    
    // Check Ordered Quantity
    let insertFlag = true
    for (let i = 0; i < wdFormDyeingRequisition.items.length; i++) {
        const element = wdFormDyeingRequisition.items[i];

        const selectOneOrderedQuantity = await wdDyeingRequisitionDetailsQueries.selectOne({ id: element.wdFormDyeingOrderRequisitionDetailsId })
        if (selectOneOrderedQuantity[0] != null) {
            if (parseFloat(element.quantity) > selectOneOrderedQuantity[0].form_current_quantity) {
                insertFlag = false;
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: selectOneOrderedQuantity[0].form_current_quantity,
                    newQuantity: element.quantity
                }
            }
        }
        if(i == wdFormDyeingRequisition.items.length-1 && insertFlag) {
            const results = await wdFormDyeingRequisitionQueries.insertForOrder(wdFormDyeingRequisition);
            if (results) {
                return await wdFormDyeingRequisitionDetailsService.createForOrder(wdFormDyeingRequisition);
            } else {
                return constants.insertError;
            }
        }
    }

    
};

exports.select = async () => {
    const results = await wdFormDyeingRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
        const element = results[i];
        element.details = await wdFormDyeingRequisitionDetailsService.selectByRequisitionId(element.id)
    }
    return results;
  };

// exports.checkValidQuantityInWd = async (data, item) => {
//     const sumCurrentQuantityWd = await wdService.selectSumCurrentQuantityByDyeingByFabricByConsigmentDyeingInWd(data.dyeingId, item.fabricId, item.consigmentDyeingId)
//     if (sumCurrentQuantityWd[0] != null) {
//         const sumCurrentQuantity = sumCurrentQuantityWd[0].current_quantity
//         if (sumCurrentQuantity >= item.quantity) {
//             return true
//         } else {
//             return {
//                 ...constants.wrongQuantity,
//                 spentQuantity: sumCurrentQuantity,
//                 newQuantity: item.quantity
//             }
//         }
//     }
// };

