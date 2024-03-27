// Services
const wbManufacturingInputService = require("./wb-manufacturing-input");

// Queries
const wbManufacturingRequisitionQueries = require("../../db/queries/wb/wb-manufacturing-requisition");
const consigmentManufacturingQueries = require("../../db/queries/general/consigment-manufacturing");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wbManufacturingRequisitionTableName = require("../../util/database-tables-name").wbManufacturingRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wbManufacturingRequisition) => {
    wbManufacturingRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wbManufacturingRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wbManufacturingRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wbManufacturingRequisitionQueries.selectOne({ number: wbManufacturingRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wbManufacturingRequisitionQueries.insert(wbManufacturingRequisition);
    if (results) {
        return await wbManufacturingInputService.create(wbManufacturingRequisition, 0);
    } else {
        return constants.insertError;
    }
};

exports.createForOrder = async (wbManufacturingRequisition) => {
    wbManufacturingRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wbManufacturingRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wbManufacturingRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wbManufacturingRequisitionQueries.selectOne({ number: wbManufacturingRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wbManufacturingRequisitionQueries.insertForOrder(wbManufacturingRequisition);
    if (results) {
        return await wbManufacturingInputService.create(wbManufacturingRequisition, 1);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wbManufacturingRequisitionQueries.select();
    return results;
  };

exports.selectOrders = async () => {
    const results = await wbManufacturingRequisitionQueries.selectOrders();
    return results;
  };
  
exports.update = async (wbManufacturingInput) => {
    // check is found
    let whereCluse = {};
    whereCluse[`${wbManufacturingRequisitionTableName}.id`] = wbManufacturingInput.id;
    whereCluse[`${wbManufacturingRequisitionTableName}.is_deleted`] = 0;
    whereCluse[`${wbManufacturingRequisitionTableName}.is_active`] = 1;
    const isFound = await wbManufacturingRequisitionQueries.selectOne(whereCluse);
    if (isFound[0] != null) {
  
        // updated
        const updateResults = await wbManufacturingRequisitionQueries.update({
            date: wbManufacturingInput.date,
            note: wbManufacturingInput.note,
            status: wbManufacturingInput.status
        }, {
            id: wbManufacturingInput.id
        });
        if (updateResults) {
          return constants.updateSuccess;
        } else {
          return constants.updateError;
        }
    } else {
      return constants.itemNotFound;
    }
  };