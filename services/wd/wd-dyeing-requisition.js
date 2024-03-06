// Services
const wdDyeingRequisitionDetailsService = require("./wd-dyeing-requisition-details");

// Queries
const wdDyeingRequisitionQueries = require("../../db/queries/wd/wd-dyeing-requisition");
const wdFormDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-form-dyeing-requisition-details");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const { wdDyeingRequisitionTableName, wdFormDyeingRequisitionDetailsTableName } = require("../../util/database-tables-name");

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wdDyeingRequisition) => {
    wdDyeingRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wdDyeingRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wdDyeingRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wdDyeingRequisitionQueries.selectOne({ number: wdDyeingRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    // Check Valid Current Quantity
    for (let i = 0; i < wdDyeingRequisition.items.length; i++) {
        const element = wdDyeingRequisition.items[i];

        let whereCluse = {}
        whereCluse[`${wdFormDyeingRequisitionDetailsTableName}.id`] = element.wdFormRequisitionDetailsId
        const selectOneFormQuantity = await wdFormDyeingRequisitionDetailsQueries.selectOne(whereCluse)
        if (selectOneFormQuantity[0] != null) {
            if (parseFloat(element.quantity) > selectOneFormQuantity[0].current_quantity) {
                return {
                    ...constants.wrongQuantity,
                    spentQuantity: selectOneFormQuantity[0].current_quantity,
                    newQuantity: element.quantity
                }
            }
        }
    }

    const results = await wdDyeingRequisitionQueries.insert(wdDyeingRequisition);
    if (results) {
        return await wdDyeingRequisitionDetailsService.create(wdDyeingRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wdDyeingRequisitionQueries.select();
    return results;
  };