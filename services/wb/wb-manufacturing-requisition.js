// Services
const wbManufacturingInputService = require("./wb-manufacturing-input");
const wbManufacturingOutputService = require("./wb-manufacturing-output");

// Database
const db = require("../../db/config/connection").getConnection();

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
    const trx = await db.transaction();
    try {
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
            await trx.rollback();
            return constants.duplicatedData;
        }

        const results = await wbManufacturingRequisitionQueries.insert(wbManufacturingRequisition);
        if (results) {
            // إنشاء المدخلات والمخرجات والتخصيص (كل شيء في wb-manufacturing-input.js)
            const inputResult = await wbManufacturingInputService.create(wbManufacturingRequisition, 0, trx);
            
            // Commit التراجعة
            await trx.commit();
            
            return {
                status: 200,
                message: "تم الإنشاء بنجاح",
                ...inputResult
            };
        } else {
            await trx.rollback();
            return constants.insertError;
        }
    } catch (error) {
        await trx.rollback();
        console.error("خطأ في create:", error);
        return {
            status: 500,
            message: "خطأ في الخادم",
            error: error.message
        };
    }
};

exports.createForOrder = async (wbManufacturingRequisition) => {
    const trx = await db.transaction();
    try {
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
            await trx.rollback();
            return constants.duplicatedData;
        }

        const results = await wbManufacturingRequisitionQueries.insertForOrder(wbManufacturingRequisition);
        if (results) {
            // إنشاء المدخلات والمخرجات والتخصيص (كل شيء في wb-manufacturing-input.js)
            const inputResult = await wbManufacturingInputService.create(wbManufacturingRequisition, 1, trx);
            
            // Commit التراجعة
            await trx.commit();
            
            return {
                status: 200,
                message: "تم الإنشاء بنجاح",
                ...inputResult
            };
        } else {
            await trx.rollback();
            return constants.insertError;
        }
    } catch (error) {
        await trx.rollback();
        console.error("خطأ في createForOrder:", error);
        return {
            status: 500,
            message: "خطأ في الخادم",
            error: error.message
        };
    }
};

exports.select = async () => {
    let results = await wbManufacturingRequisitionQueries.select();
    if (Array.isArray(results) && results.length > 0) {
        for (let j = 0; j < results.length; j++) {
            let selectWbManufacturingRequisition = results[j];

            let selectManufacturingOutputByRequisitionId = await wbManufacturingOutputService.selectByRequisitionId(selectWbManufacturingRequisition.id)
            selectWbManufacturingRequisition.details = selectManufacturingOutputByRequisitionId[0];
        }
    }
    return results;
  };

exports.selectOrders = async () => {
    let results = await wbManufacturingRequisitionQueries.selectOrders();
    if (Array.isArray(results) && results.length > 0) {
        for (let j = 0; j < results.length; j++) {
            let selectWbManufacturingRequisition = results[j];

            let selectManufacturingOutputByRequisitionId = await wbManufacturingOutputService.selectByRequisitionIdForOrder(selectWbManufacturingRequisition.id)
            selectWbManufacturingRequisition.details = selectManufacturingOutputByRequisitionId[0];
        }
    }
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