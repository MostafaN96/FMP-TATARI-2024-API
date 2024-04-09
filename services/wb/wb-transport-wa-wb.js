// Services
const wbTransportWaWbRequisitionDetailsService = require("./wb-transport-wa-wb-details");

// Queries
const wbTransportWaWbRequisitionQueries = require("../../db/queries/wb/wb-transport-wa-wb");
const generalQueries = require("../../db/queries/general/general");

// Util
const constants = require("../../util/constants");
const wbTransportWaWbTableName = require("../../util/database-tables-name").wbTransportWaWbTableName;

// Helper
const trans = require("../../helpers/transform");

exports.create = async (wbTransportWaWbRequisition) => {
    wbTransportWaWbRequisition.id = trans.transform();

    // Select Max Number Of Requisition
    const selectMaxRequisitionNumber = await generalQueries.selectMaxValue(wbTransportWaWbTableName, { number: 'number' })
    if (selectMaxRequisitionNumber[0].number == null) {
        selectMaxRequisitionNumber[0].number = 0
    }
    wbTransportWaWbRequisition.number = selectMaxRequisitionNumber[0].number + 1

    // Check Duplication Data
    const selectOneResult = await wbTransportWaWbRequisitionQueries.selectOne({ number: wbTransportWaWbRequisition.number });
    if (selectOneResult[0] != null) {
        return constants.duplicatedData;
    }

    const results = await wbTransportWaWbRequisitionQueries.insert(wbTransportWaWbRequisition);
    if (results) {
        return await wbTransportWaWbRequisitionDetailsService.create(wbTransportWaWbRequisition);
    } else {
        return constants.insertError;
    }
};

exports.select = async () => {
    const results = await wbTransportWaWbRequisitionQueries.select();
    for (let i = 0; i < results.length; i++) {
        const element = results[i];
        element.details = await wbTransportWaWbRequisitionDetailsService.selectByRequisitionId(element.id)
    }
    return results;
  };