// Services
const weSellRequisitionDetailsService = require("./we-sell-requisition-details");

// Queries
const weSellRequisitionQueries = require("../../db/queries/we/we-sell-requisition");
const generalQueries = require("../../db/queries/general/general");
const deliveryCarQueries = require("../../db/queries/general/delivery-car");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { weSellRequisitionTableName } = require("../../util/database-tables-name");

// Helper
const trans = require("../../helpers/transform");

exports.create = async (weSellRequisition) => {
    weSellRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(weSellRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    weSellRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await weSellRequisitionQueries.selectOne({ number: weSellRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    // Check Delivery Car
    const selectOneDeliveryCarResult = await deliveryCarQueries.selectOne({ id: weSellRequisition.deliveryCarId });
    if (Array.isArray(selectOneDeliveryCarResult) && selectOneDeliveryCarResult.length > 0) {
      //
    } else {
      weSellRequisition.deliveryCarId = null
    }

    const results = await weSellRequisitionQueries.insert(weSellRequisition);
    if (results) {
        return await weSellRequisitionDetailsService.create(weSellRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await weSellRequisitionQueries.select();
    return results;
  };
  
exports.confirm = async (weSellRequisition) => {
    // check is found
    const isFound = await weSellRequisitionQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: weSellRequisition.id,
    });
    if (isFound[0] != null) {
        let whereCluse = {};
        whereCluse[`${weSellRequisitionTableName}.id`] = weSellRequisition.id;
        whereCluse[`${weSellRequisitionTableName}.is_deleted`] = 0;
        whereCluse[`${weSellRequisitionTableName}.is_active`] = 1;
  
        // updated
        const updateResults = await weSellRequisitionQueries.update(
            {
                is_approved: weSellRequisition.isApproved
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