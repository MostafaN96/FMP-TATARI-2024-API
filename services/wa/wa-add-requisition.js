// Services
const waAddRequisitionDetailsService = require("./wa-add-requisition-details");

// Queries
const waAddRequisitionQueries = require("../../db/queries/wa/wa-add-requisition");
const generalQueries = require("../../db/queries/general/general");
const bussinessmanQueries = require("../../db/queries/general/bussinessman");

// Util
const constants = require("../../util/constants");
const waAddRequisitionTableName = require("../../util/database-tables-name").waAddRequisitionTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (waAddRequisition) => {
    waAddRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(waAddRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    waAddRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await waAddRequisitionQueries.selectOne({ number: waAddRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await waAddRequisitionQueries.insert(waAddRequisition);
    if (results) {
        return await waAddRequisitionDetailsService.create(waAddRequisition, 0);
    } else {
        return constants.insertError;
    }
};

exports.createForOrder = async (waAddRequisition) => {
    waAddRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(waAddRequisitionTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    waAddRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await waAddRequisitionQueries.selectOne({ number: waAddRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await waAddRequisitionQueries.insertForOrder(waAddRequisition);
    if (results) {
        // Select Supllier for consigment name
        const selectBussinessmanOneResult = await bussinessmanQueries.selectOne({
            id: waAddRequisition.supplierId
        })
        if (Array.isArray(selectBussinessmanOneResult) && selectBussinessmanOneResult.length > 0) {
            waAddRequisition.supplierName = selectBussinessmanOneResult[0].name
        }

        return await waAddRequisitionDetailsService.create(waAddRequisition, 1);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await waAddRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
        const element = results[i];
        element.details = await waAddRequisitionDetailsService.selectByRequisitionId(element.id)
    }
    return results;
};

  exports.selectOrders = async () => {
    const results = await waAddRequisitionQueries.selectOrders();
    return results;
  };