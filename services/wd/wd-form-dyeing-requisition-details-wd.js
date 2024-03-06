// QuerieswaCottonSellRequisitionDetailsWa
const wdFormDyeingRequisitionDetailsWdQueries = require("../../db/queries/wd/wd-form-dyeing-requisition-details-wd");

// Util
const constants = require("../../util/constants");

exports.create = async (wdFormDyeingRequisitionDetailsWd, items) => {
  
    const results = await wdFormDyeingRequisitionDetailsWdQueries.insert(wdFormDyeingRequisitionDetailsWd, items);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

  exports.select = async (whereCluse) => {
    const results = await wdFormDyeingRequisitionDetailsWdQueries.select(whereCluse);
    return results;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    const results = await wdFormDyeingRequisitionDetailsWdQueries.selectWithTwoCondition(whereCluse, andWhereCluseArray);
    return results;
  };

