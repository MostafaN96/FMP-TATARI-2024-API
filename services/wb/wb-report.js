const moment = require("moment")

// Config
const knex = require("../../db/config/connection").getConnection();

// Service
const wbManufacturingInputService = require("../../services/wb/wb-manufacturing-input");
const wbManufacturingOutputService = require("../../services/wb/wb-manufacturing-output");
const wcReportService = require("../../services/wc/wc-report");

// Queries
const wbReportQueries = require("../../db/queries/wb/wb-report");
const yarnQueries = require("../../db/queries/general/yarn");
const wbQueries = require("../../db/queries/wb/wb");
const generalQueries = require("../../db/queries/general/general");
const wbTransportRequisitionWaWbDetailsQueries = require("../../db/queries/wb/wb-transport-wa-wb-details");
const wbTransportRequisitionWbWaDetailsQueries = require("../../db/queries/wb/wb-transport-requisition-wb-wa-details");
const wbReconciliationRequisitionDetailsQueries = require("../../db/queries/wb/wb-reconciliation-requisition-details");
const wbTransitionBetweenIndustriesRequisitionDetailsQueries = require("../../db/queries/wb/wb-transition-between-industries-requisition-details");
const wbManufacturingInputQueries = require("../../db/queries/wb/wb-manufacturing-input");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wbTransportWaWbTableName, bussinessmanTableName } = require("../../util/database-tables-name");
const yarnTableName = require("../../util/database-tables-name").yarnTableName;
const wbTableName = require("../../util/database-tables-name").wbTableName;
const wbReconciliationRequisitionDetailsTableName = require("../../util/database-tables-name").wbReconciliationRequisitionDetailsTableName;
const wbTransportWaWbDetailsTableName = require("../../util/database-tables-name").wbTransportWaWbDetailsTableName;

exports.selectInventoryTotal = async (yarnReport) => {
    let data = []

    let yarnWhereCluse = {};
    yarnWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    yarnWhereCluse[`${yarnTableName}.is_active`] = 1;
    yarnWhereCluse[`${wbTableName}.is_deleted`] = 0;
    yarnWhereCluse[`${wbTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${yarnTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${yarnTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.type`] = constantsPayloads.transportBetweenType;
    let whereCluseArray = [yarnWhereCluse, reconciliationWhereCluse, transitionBetweenIndustriesWhereCluse]

    // select yarns 
    const yarns = (yarnReport.isShowClosedBalances == 1) ? await yarnQueries.selectStoredWbYarnsInManufacturers(whereCluseArray, 0) : await yarnQueries.selectStoredWbYarnsInManufacturers(whereCluseArray)
    if (yarns[0] != null) {
        for (let i = 0; i < yarns.length; i++) {
            let yarn = yarns[i];
            let callArray = []

            // Select Max Added Date
            let maxDateWhereCluse = {};
            maxDateWhereCluse[`${wbTableName}.industry_id`] = yarn.manufacturer_id;
            maxDateWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarn.yarn_id;
            const selectMaxDate = await knex(wbTransportWaWbTableName)
            .max({ date: 'date' })
            .innerJoin(`${wbTransportWaWbDetailsTableName}`,
                `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`,
                `${wbTransportWaWbTableName}.id`)
                .innerJoin(`${wbTableName}`,
                `${wbTableName}.wb_transport_wa_wb_details_id`,
                `${wbTransportWaWbDetailsTableName}.id`)
            .where(maxDateWhereCluse)
            if (selectMaxDate[0] != null) {
                // Select Latest Price
                let wbTransportRequisitionWaWbDetailsWhereCluse = {};
                wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTableName}.industry_id`] = yarn.manufacturer_id;
                wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarn.yarn_id;
                wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTransportWaWbTableName}.date`] = selectMaxDate[0]?.date;
                const latestPrice = await wbTransportRequisitionWaWbDetailsQueries.selectLatestPrice(wbTransportRequisitionWaWbDetailsWhereCluse)
                yarn.latest_price = latestPrice[0]?.price
                yarn.latest_price_dollar = latestPrice[0]?.price_dollar 
            } else {
                yarn.latest_price = 0
                yarn.latest_price_dollar = 0
            }
            // Get Sum Current Quantity Of yarn 
            // const sumCurrentQuantity = await wbService.selectSumCurrentQuantityByIndustryByYarnInWb(yarn.manufacturer_id, yarn.yarn_id)
            // yarn.current_quantity = (sumCurrentQuantity[0].current_quantity != null) ? sumCurrentQuantity[0].current_quantity : 0

            data.push(yarn)

            callArray.push(wbTransportRequisitionWaWbDetailsQueries.selectTotalByYarnIdByIndustryId(yarn.yarn_id, yarn.manufacturer_id))
            callArray.push(wbReconciliationRequisitionDetailsQueries.selectTotalByYarnIdByIndustryId(yarn.yarn_id, yarn.manufacturer_id))
            callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectTotalByYarnIdByIndustryId(yarn.yarn_id, yarn.manufacturer_id))
            callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectFromIndustryTotalByYarnIdByIndustryId(yarn.yarn_id, yarn.manufacturer_id))
            callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectToIndustryTotalByYarnIdByIndustryId(yarn.yarn_id, yarn.manufacturer_id))
            callArray.push(wbManufacturingInputQueries.selectTotalByYarnIdByIndustryId(yarn.yarn_id, yarn.manufacturer_id))
            const requisitions = await Promise.all(callArray)
            const sortedAsc = [...requisitions[0], ...requisitions[1],
            ...requisitions[2], ...requisitions[3], ...requisitions[4],
            ...requisitions[5]].sort(
                (objA, objB) => moment(objA.date) - moment(objB.date)
            );
            data[i].details = sortedAsc

        }
    }

    return data;
};

exports.selectInventoryTotalByYarnByIndustry = async (manufacturerId, yarnId) => {
    let callArray = []

    callArray.push(wbTransportRequisitionWaWbDetailsQueries.selectTotalDetailsByYarnIdByIndustryId(yarnId, manufacturerId))
    callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectTotalDetailsByYarnIdByIndustryId(yarnId, manufacturerId))
    callArray.push(wbReconciliationRequisitionDetailsQueries.selectTotalDetailsByYarnIdByIndustryId(yarnId, manufacturerId))
    callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectFromIndustryTotalDetailsByYarnIdByIndustryId(yarnId, manufacturerId))
    callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectToIndustryTotalDetailsByYarnIdByIndustryId(yarnId, manufacturerId))
    callArray.push(wbManufacturingInputQueries.selectTotalDetailsByYarnIdByIndustryId(yarnId, manufacturerId))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5]].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
            maxDateWhereCluse[`${wbTableName}.industry_id`] = manufacturerId;
            maxDateWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
            const selectMaxDate = await knex(wbTransportWaWbTableName)
            .max({ date: 'date' })
            .innerJoin(`${wbTransportWaWbDetailsTableName}`,
                `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`,
                `${wbTransportWaWbTableName}.id`)
                .innerJoin(`${wbTableName}`,
                `${wbTableName}.wb_transport_wa_wb_details_id`,
                `${wbTransportWaWbDetailsTableName}.id`)
            .where(maxDateWhereCluse)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let wbTransportRequisitionWaWbDetailsWhereCluse = {};
        wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTableName}.industry_id`] = manufacturerId;
        wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
        wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTransportWaWbTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await wbTransportRequisitionWaWbDetailsQueries.selectLatestPrice(wbTransportRequisitionWaWbDetailsWhereCluse)
        sortedAsc[0].latest_price = latestPrice[0]?.price
        sortedAsc[0].latest_price_dollar = latestPrice[0]?.price_dollar
    } else {
        sortedAsc[0].latest_price = 0
        sortedAsc[0].latest_price_dollar = 0
    }
    return sortedAsc;
};

exports.selectInventoryDetails = async (yarnReport) => {
    let data = []

    let yarnWhereCluse = {};
    yarnWhereCluse[`${wbTableName}.is_deleted`] = 0;
    yarnWhereCluse[`${wbTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenIndustriesWhereCluse = {};
    transitionBetweenIndustriesWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${yarnTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    transitionBetweenIndustriesWhereCluse[`${wbTableName}.type`] = constantsPayloads.transportBetweenType;
    let whereCluseArray = [yarnWhereCluse, reconciliationWhereCluse, transitionBetweenIndustriesWhereCluse]

    // select industriesYarnsLots 
    const industriesYarnsLots = (yarnReport.isShowClosedBalances == 1) ? await wbQueries.selectStoredIndustryAndYarnAndYarnLot(whereCluseArray, 0) : await wbQueries.selectStoredIndustryAndYarnAndYarnLot(whereCluseArray)
    if (industriesYarnsLots[0] != null) {
        for (let i = 0; i < industriesYarnsLots.length; i++) {
            let industryYarnLot = industriesYarnsLots[i];
            let callArray = []

            // Select Max Added Date
            let maxDateWhereCluse = {};
            maxDateWhereCluse[`${wbTableName}.industry_id`] = industryYarnLot.manufacturer_id;
            maxDateWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = industryYarnLot.yarn_id;
            maxDateWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = industryYarnLot.yarn_lot_id;
            const selectMaxDate = await knex(wbTransportWaWbTableName)
            .max({ date: 'date' })
            .innerJoin(`${wbTransportWaWbDetailsTableName}`,
                `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`,
                `${wbTransportWaWbTableName}.id`)
                .innerJoin(`${wbTableName}`,
                `${wbTableName}.wb_transport_wa_wb_details_id`,
                `${wbTransportWaWbDetailsTableName}.id`)
            .where(maxDateWhereCluse)
            if (selectMaxDate[0] != null) {
                // Select Latest Price
                let wbTransportRequisitionWaWbDetailsWhereCluse = {};
                wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTableName}.industry_id`] = industryYarnLot.manufacturer_id;
                wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = industryYarnLot.yarn_id;
                wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = industryYarnLot.yarn_lot_id;
                wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTransportWaWbTableName}.date`] = selectMaxDate[0]?.date;
                const latestPrice = await wbTransportRequisitionWaWbDetailsQueries.selectLatestPrice(wbTransportRequisitionWaWbDetailsWhereCluse)
                industryYarnLot.latest_price = latestPrice[0]?.price
                industryYarnLot.latest_price_dollar = latestPrice[0]?.price_dollar
            } else {
                industryYarnLot.latest_price = 0
                industryYarnLot.latest_price_dollar = 0
            }
            // Get Sum Current Quantity Of industryYarnLot 
            // const sumCurrentQuantity = await wbService.selectSumCurrentQuantityByIndustryByYarnByYarnLotInWb(industryYarnLot.manufacturer_id, industryYarnLot.yarn_id, industryYarnLot.yarn_lot_id)
            // industryYarnLot.current_quantity = sumCurrentQuantity[0].current_quantity

            data.push(industryYarnLot)

            callArray.push(wbTransportRequisitionWaWbDetailsQueries.selectDetailsByIndustryByYarnByLot(
                industryYarnLot.manufacturer_id, industryYarnLot.yarn_id, industryYarnLot.yarn_lot_id, 
                industryYarnLot.consigment_yarn_id
            ))
            callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectDetailsByIndustryByYarnByLot(
                industryYarnLot.manufacturer_id, industryYarnLot.yarn_id, industryYarnLot.yarn_lot_id, 
                industryYarnLot.consigment_yarn_id
            ))
            callArray.push(wbReconciliationRequisitionDetailsQueries.selectDetailsByIndustryByYarnByLot(
                industryYarnLot.manufacturer_id, industryYarnLot.yarn_id, industryYarnLot.yarn_lot_id, 
                industryYarnLot.consigment_yarn_id
            ))
            callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectFromIndustryDetailsByIndustryByYarnByLot(
                industryYarnLot.manufacturer_id, industryYarnLot.yarn_id, industryYarnLot.yarn_lot_id, 
                industryYarnLot.consigment_yarn_id
            ))
            callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectToIndustryDetailsByIndustryByYarnByLot(
                industryYarnLot.manufacturer_id, industryYarnLot.yarn_id, industryYarnLot.yarn_lot_id, 
                industryYarnLot.consigment_yarn_id
            ))
            callArray.push(wbManufacturingInputQueries.selectDetailsByIndustryByYarnByLot(
                industryYarnLot.manufacturer_id, industryYarnLot.yarn_id, industryYarnLot.yarn_lot_id, 
                industryYarnLot.consigment_yarn_id
            ))
            const requisitions = await Promise.all(callArray)
            const sortedAsc = [...requisitions[0], ...requisitions[1],
            ...requisitions[2], ...requisitions[3], ...requisitions[4],
            ...requisitions[5]].sort(
                (objA, objB) => moment(objA.date) - moment(objB.date)
            );
            data[i].details = sortedAsc

        }
    }

    return data;
};

exports.selectInventoryDetailsByIndustryByYarnByLot = async (industryId, yarnId, yarnLotId, consigmentYarnId) => {
    let callArray = []

    callArray.push(wbTransportRequisitionWaWbDetailsQueries.selectDetailsDetailsByIndustryByYarnByLot(industryId, yarnId, yarnLotId, consigmentYarnId))
    callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectDetailsDetailsByIndustryByYarnByLot(industryId, yarnId, yarnLotId, consigmentYarnId))
    callArray.push(wbReconciliationRequisitionDetailsQueries.selectDetailsDetailsByIndustryByYarnByLot(industryId, yarnId, yarnLotId, consigmentYarnId))
    callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectFromIndustryDetailsDetailsByIndustryByYarnByLot(industryId, yarnId, yarnLotId, consigmentYarnId))
    callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectToIndustryDetailsDetailsByIndustryByYarnByLot(industryId, yarnId, yarnLotId, consigmentYarnId))
    callArray.push(wbManufacturingInputQueries.selectDetailsDetailsByIndustryByYarnByLot(industryId, yarnId, yarnLotId, consigmentYarnId))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5]].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
    maxDateWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
    maxDateWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_lot_id`] = yarnLotId;
    const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(wbTransportWaWbTableName,
        { date: 'date' }, maxDateWhereCluse,
        wbTransportWaWbDetailsTableName,
        `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`,
        `${wbTransportWaWbDetailsTableName}.id`)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let wbTransportRequisitionWaWbDetailsWhereCluse = {};
        wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
        wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTransportWaWbTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await wbTransportRequisitionWaWbDetailsQueries.selectLatestPrice(wbTransportRequisitionWaWbDetailsWhereCluse)
        sortedAsc[0].latest_price = (latestPrice[0] != null) ? latestPrice[0].price : 0
        sortedAsc[0].latest_price_dollar = (latestPrice[0] != null) ? latestPrice[0].price_dollar : 0
    } else {
        sortedAsc[0].latest_price = 0
        sortedAsc[0].latest_price_dollar = 0
    }
    return sortedAsc;
};

exports.selectPriceWb = async (yarnId, manufacturerId) => {
    let callArray = []

    callArray.push(wbTransportRequisitionWaWbDetailsQueries.selectPriceByYarnIdByIndustryId(yarnId, manufacturerId))
    callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectPriceByYarnIdByIndustryId(yarnId, manufacturerId))
    callArray.push(wbReconciliationRequisitionDetailsQueries.selectPriceByYarnIdByIndustryId(yarnId, manufacturerId))
    callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectFromIndustryPriceByYarnIdByIndustryId(yarnId, manufacturerId))
    callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectToIndustryPriceByYarnIdByIndustryId(yarnId, manufacturerId))
    callArray.push(wbManufacturingInputQueries.selectPriceByYarnIdByIndustryId(yarnId, manufacturerId))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4]].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
            maxDateWhereCluse[`${wbTableName}.industry_id`] = manufacturerId;
            maxDateWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
            const selectMaxDate = await knex(wbTransportWaWbTableName)
            .max({ date: 'date' })
            .innerJoin(`${wbTransportWaWbDetailsTableName}`,
                `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`,
                `${wbTransportWaWbTableName}.id`)
                .innerJoin(`${wbTableName}`,
                `${wbTableName}.wb_transport_wa_wb_details_id`,
                `${wbTransportWaWbDetailsTableName}.id`)
            .where(maxDateWhereCluse)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let wbTransportRequisitionWaWbDetailsWhereCluse = {};
        wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTableName}.industry_id`] = manufacturerId;
        wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
        wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTransportWaWbTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await wbTransportRequisitionWaWbDetailsQueries.selectLatestPrice(wbTransportRequisitionWaWbDetailsWhereCluse)
        if(latestPrice[0] != null) {
            sortedAsc[0].latest_price = latestPrice[0].price
            sortedAsc[0].latest_price_dollar = latestPrice[0].price_dollar
        } else {
            sortedAsc[0].latest_price = 0
            sortedAsc[0].latest_price_dollar = 0
        }
    } else {
        sortedAsc[0].latest_price = 0
        sortedAsc[0].latest_price_dollar = 0
    }
    return sortedAsc;
};

exports.selectPriceByYarnIdByIndustryIdByConsigmentWb = async (yarnId, manufacturerId, consigmentYarnId) => {
    let callArray = []

    callArray.push(wbTransportRequisitionWaWbDetailsQueries.selectPriceByYarnIdByIndustryId(yarnId, manufacturerId))
    callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectPriceByYarnIdByIndustryId(yarnId, manufacturerId))
    callArray.push(wbReconciliationRequisitionDetailsQueries.selectPriceByYarnIdByIndustryId(yarnId, manufacturerId))
    callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectFromIndustryPriceByYarnIdByIndustryId(yarnId, manufacturerId))
    callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectToIndustryPriceByYarnIdByIndustryId(yarnId, manufacturerId))
    callArray.push(wbManufacturingInputQueries.selectPriceByYarnIdByIndustryId(yarnId, manufacturerId))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4]].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
            maxDateWhereCluse[`${wbTableName}.industry_id`] = manufacturerId;
            maxDateWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
            maxDateWhereCluse[`${wbTransportWaWbDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
            const selectMaxDate = await knex(wbTransportWaWbTableName)
            .max({ date: 'date' })
            .innerJoin(`${wbTransportWaWbDetailsTableName}`,
                `${wbTransportWaWbDetailsTableName}.wb_transport_wa_wb_id`,
                `${wbTransportWaWbTableName}.id`)
                .innerJoin(`${wbTableName}`,
                `${wbTableName}.wb_transport_wa_wb_details_id`,
                `${wbTransportWaWbDetailsTableName}.id`)
            .where(maxDateWhereCluse)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let wbTransportRequisitionWaWbDetailsWhereCluse = {};
        wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTableName}.industry_id`] = manufacturerId;
        wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTransportWaWbDetailsTableName}.yarn_id`] = yarnId;
        wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTransportWaWbDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
        wbTransportRequisitionWaWbDetailsWhereCluse[`${wbTransportWaWbTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await wbTransportRequisitionWaWbDetailsQueries.selectLatestPrice(wbTransportRequisitionWaWbDetailsWhereCluse)
        if(latestPrice[0] != null) {
            sortedAsc[0].latest_price = latestPrice[0].price
            sortedAsc[0].latest_price_dollar = latestPrice[0].price_dollar
        } else {
            sortedAsc[0].latest_price = 0
            sortedAsc[0].latest_price_dollar = 0
        }
    } else {
        sortedAsc[0].latest_price = 0
        sortedAsc[0].latest_price_dollar = 0
    }
    return sortedAsc;
};

exports.circularKnittingMachineManufacturingReport = async () => {
    const results = await wbReportQueries.circularKnittingMachineManufacturingReport();
    return results;
};

exports.circularKnittingMachineReport = async () => {
    const results = await wbReportQueries.circularKnittingMachineReport();
    return results;
};

exports.manufacturingOrdersReport = async () => {
    const results = await wbReportQueries.manufacturingOrdersReport();
    return results;
};

exports.manufacturingOrdersDetailsReport = async () => {
    const results = await wbReportQueries.manufacturingOrdersDetailsReport();
    return results;
};


exports.selectInventoryTotalByDate = async (bodyPaylod) => {
    let callArray = []

    callArray.push(wbTransportRequisitionWaWbDetailsQueries.selectTotalDetailsByDateWb(bodyPaylod))
    callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectTotalDetailsByDateWb(bodyPaylod))
    callArray.push(wbReconciliationRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPaylod))
    callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectFromIndustryTotalDetailsByDate(bodyPaylod))
    callArray.push(wbTransitionBetweenIndustriesRequisitionDetailsQueries.selectToIndustryTotalDetailsByDate(bodyPaylod))
    callArray.push(wbManufacturingInputQueries.selectTotalDetailsByDate(bodyPaylod))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5]].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    return sortedAsc;
};

exports.selectByFabricByConsigmentManufacturing = async (fabricId, consigmentManufacturingId) => {
    let callArray = []
    
        callArray.push(wbManufacturingInputService.selectByFabricByConsigmentManufacturing(fabricId, consigmentManufacturingId))
        callArray.push(wbManufacturingOutputService.selectByFabricByConsigmentManufacturing(fabricId, consigmentManufacturingId))
        const result = await Promise.all(callArray)
        const data = [result[0], result[1]]
    return data;
};

exports.inquireYarnAvilabilityReportWb = async (fabric, yarnId) => {
    
    let bussinessmanWhereCluse = {};
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_stock`] = 1;
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_deleted`] = 0;
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_active`] = 1;

    let wbYarnWhereCluse = {};
    wbYarnWhereCluse[`${yarnTableName}.id`] = yarnId;
    wbYarnWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    wbYarnWhereCluse[`${yarnTableName}.is_active`] = 1;
    wbYarnWhereCluse[`${wbTableName}.is_deleted`] = 0;
    wbYarnWhereCluse[`${wbTableName}.is_active`] = 1;
    wbYarnWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabric.fabricId;

    let wbReconciliationWhereCluse = {};
    wbReconciliationWhereCluse[`${yarnTableName}.id`] = yarnId;
    wbReconciliationWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    wbReconciliationWhereCluse[`${yarnTableName}.is_active`] = 1;
    wbReconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    wbReconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    wbReconciliationWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabric.fabricId;
    wbReconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let wbTransitionBetweenIndustriesWhereCluse = {};
    wbTransitionBetweenIndustriesWhereCluse[`${yarnTableName}.id`] = yarnId;
    wbTransitionBetweenIndustriesWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    wbTransitionBetweenIndustriesWhereCluse[`${yarnTableName}.is_active`] = 1;
    wbTransitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    wbTransitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    wbTransitionBetweenIndustriesWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabric.fabricId;
    wbTransitionBetweenIndustriesWhereCluse[`${wbTableName}.type`] = constantsPayloads.transportBetweenType;

    let wbWhereCluseArray = [
        wbYarnWhereCluse, wbReconciliationWhereCluse, 
        wbTransitionBetweenIndustriesWhereCluse, bussinessmanWhereCluse
    ]

    // select wb Yarn 
    let wbYarns = await yarnQueries.selectStoredWbYarnsInManufacturersForInquireFabricAvilability(wbWhereCluseArray)
    return wbYarns
};

exports.inquireYarnAvilabilityTotalReportWb = async (fabric, yarnId) => {
    
    let bussinessmanWhereCluse = {};
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_stock`] = 1;
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_deleted`] = 0;
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_active`] = 1;

    let wbYarnWhereCluse = {};
    wbYarnWhereCluse[`${yarnTableName}.id`] = yarnId;
    wbYarnWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    wbYarnWhereCluse[`${yarnTableName}.is_active`] = 1;
    wbYarnWhereCluse[`${wbTableName}.is_deleted`] = 0;
    wbYarnWhereCluse[`${wbTableName}.is_active`] = 1;
    wbYarnWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabric.fabricId;

    let wbReconciliationWhereCluse = {};
    wbReconciliationWhereCluse[`${yarnTableName}.id`] = yarnId;
    wbReconciliationWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    wbReconciliationWhereCluse[`${yarnTableName}.is_active`] = 1;
    wbReconciliationWhereCluse[`${wbTableName}.is_deleted`] = 0;
    wbReconciliationWhereCluse[`${wbTableName}.is_active`] = 1;
    wbReconciliationWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabric.fabricId;
    wbReconciliationWhereCluse[`${wbReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let wbTransitionBetweenIndustriesWhereCluse = {};
    wbTransitionBetweenIndustriesWhereCluse[`${yarnTableName}.id`] = yarnId;
    wbTransitionBetweenIndustriesWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    wbTransitionBetweenIndustriesWhereCluse[`${yarnTableName}.is_active`] = 1;
    wbTransitionBetweenIndustriesWhereCluse[`${wbTableName}.is_deleted`] = 0;
    wbTransitionBetweenIndustriesWhereCluse[`${wbTableName}.is_active`] = 1;
    wbTransitionBetweenIndustriesWhereCluse[`${wbTableName}.fabric_to_be_manufactured_id`] = fabric.fabricId;
    wbTransitionBetweenIndustriesWhereCluse[`${wbTableName}.type`] = constantsPayloads.transportBetweenType;

    let wbWhereCluseArray = [
        wbYarnWhereCluse, wbReconciliationWhereCluse, 
        wbTransitionBetweenIndustriesWhereCluse, bussinessmanWhereCluse
    ]

    // select wb Yarn 
    let wbYarns = await yarnQueries.selectStoredWbYarnsInManufacturersForInquireFabricAvilabilityTotal(wbWhereCluseArray)
    return wbYarns
};


exports.inquireFabricsByDyeingOrderForOrderWb = async (fabric) => {
    let data = []
    let calcQuantity = fabric.quantity

    const myFirstPromise = new Promise(async (resolve, reject) => {
        
        ////////////////////////////////////////// WC ///////////////////////////////////////
            // select wc fabrics 
            const wcFabrics = await wcReportService.inquireFabricAvilabilityTotalReportWc(fabric)

            if (wcFabrics[0] != null) {
                for (let i = 0; i < wcFabrics.length; i++) {
                    const wcFabric = wcFabrics[i];

                    data.push(wcFabric)
                    calcQuantity = parseFloat((((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))) ) - parseFloat((wcFabric.current_quantity).toFixed(3))).toFixed(3))
                    if (calcQuantity > 0) {
                        wcFabric.needed_quantity = (wcFabrics.length - 1 == i) ? calcQuantity : 0,
                            data.pop()
                        data.push(wcFabric)
                    }
                }
            } else {
                data.push(
                    {
                        id: fabric.fabricId,
                        name: fabric.fabric_name,
                        code: fabric.fabric_code,
                        existed_quantity: 0,
                        needed_quantity: parseFloat((((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))) ) ).toFixed(3)),
                    }
                )
            }

        resolve(data); // Yay! Everything went well!

    })
    return await myFirstPromise

}