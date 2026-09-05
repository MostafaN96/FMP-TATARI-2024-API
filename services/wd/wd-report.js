const moment = require("moment")

// Config
const knex = require("../../db/config/connection").getConnection();

// Service
const wdReportQueries = require("../../db/queries/wd/wd-report");
const bussinessmanService = require("../general/bussinessman");

// Queries
const fabricQueries = require("../../db/queries/general/fabric");
const wdQueries = require("../../db/queries/wd/wd");
const generalQueries = require("../../db/queries/general/general");
const wdTransportRequisitionWcWdDetailsQueries = require("../../db/queries/wd/wd-transport-wc-wd-details");
const wdTransportRequisitionWdWcDetailsQueries = require("../../db/queries/wd/wd-transport-requisition-wd-wc-details");
const wdReconciliationRequisitionDetailsQueries = require("../../db/queries/wd/wd-reconciliation-requisition-details");
const wdTransitionBetweenDyersRequisitionDetailsQueries = require("../../db/queries/wd/wd-transition-between-dyers-requisition-details");
const wdDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-dyeing-requisition-details");
const wdFormDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-form-dyeing-requisition-details");

// Util
const constantsPayloads = require("../../util/constants-payloads");
const { wdTransportWcWdTableName, fabricTableName, wdTableName, 
    wdReconciliationRequisitionDetailsTableName, wdTransportWcWdDetailsTableName, 
    anointedColorsPricesTableName, 
    bussinessmanTableName,
    wdTransportRequisitionWdWcDetailsTableName,
    wdTransitionBetweenDyersRequisitionDetailsTableName,
    wdDyeingRequisitionDetailsTableName,
    wdFormDyeingRequisitionDetailsTableName} = require("../../util/database-tables-name");

exports.selectInventoryTotal = async (fabricReport) => {
    let data = []

    let fabricWhereCluse = {};
    fabricWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    fabricWhereCluse[`${fabricTableName}.is_active`] = 1;
    fabricWhereCluse[`${wdTableName}.is_deleted`] = 0;
    fabricWhereCluse[`${wdTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${fabricTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wdTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wdTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenDyersWhereCluse = {};
    transitionBetweenDyersWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    transitionBetweenDyersWhereCluse[`${fabricTableName}.is_active`] = 1;
    transitionBetweenDyersWhereCluse[`${wdTableName}.is_deleted`] = 0;
    transitionBetweenDyersWhereCluse[`${wdTableName}.is_active`] = 1;
    transitionBetweenDyersWhereCluse[`${wdTableName}.type`] = constantsPayloads.transportBetweenType;
    let whereCluseArray = [fabricWhereCluse, reconciliationWhereCluse, transitionBetweenDyersWhereCluse]

    // select fabrics 
    let formFabrics = []
    
    let fabrics = (fabricReport.isShowClosedBalances == 1) ? await fabricQueries.selectStoredWdFabricsInDyers(whereCluseArray, 0) : await fabricQueries.selectStoredWdFabricsInDyers(whereCluseArray)
    if (Array.isArray(fabrics) && fabrics.length > 0) {
        if(fabricReport.isShowClosedBalances == 0) {
            // formFabrics = await fabricQueries.selectStoredWdFormFabricsInDyers(whereCluseArray)
            // fabrics = fabrics.concat(formFabrics);
            formFabrics = await wdQueries.selectStoredDyeingAndFabricAndConsigmentDyeingForm(whereCluseArray)
            if(formFabrics[0] != null) {
                let uniqueFabrics = arrayUnique(fabrics.concat(formFabrics), 'fabric_id', 'fabric_id');
                fabrics = uniqueFabrics
            }
            // fabrics = [...fabrics, ...formFabrics]
        }
        const processedFabrics = await Promise.all(fabrics.map(async (fabric) => {
            const requisitionsPromise = Promise.all([
                wdTransportRequisitionWcWdDetailsQueries.selectTotalByFabricIdByDyeingId(fabric.fabric_id, fabric.dyeing_id),
                wdReconciliationRequisitionDetailsQueries.selectInputTotalByFabricIdByDyeingId(fabric.fabric_id, fabric.dyeing_id),
                wdReconciliationRequisitionDetailsQueries.selectOutputTotalByFabricIdByDyeingId(fabric.fabric_id, fabric.dyeing_id),
                wdTransportRequisitionWdWcDetailsQueries.selectTotalByFabricIdByDyeingId(fabric.fabric_id, fabric.dyeing_id),
                wdTransitionBetweenDyersRequisitionDetailsQueries.selectFromDyeingTotalByFabricIdByDyeingId(fabric.fabric_id, fabric.dyeing_id),
                wdTransitionBetweenDyersRequisitionDetailsQueries.selectToDyeingTotalByFabricIdByDyeingId(fabric.fabric_id, fabric.dyeing_id),
                wdDyeingRequisitionDetailsQueries.selectTotalByFabricIdByDyeingId(fabric.fabric_id, fabric.dyeing_id),
                wdFormDyeingRequisitionDetailsQueries.selectTotalByFabricIdByDyeingId(fabric.fabric_id, fabric.dyeing_id),
                wdFormDyeingRequisitionDetailsQueries.selectTotalByFabricIdByDyeingIdPreparedDyeing(fabric.fabric_id, fabric.dyeing_id)
            ]);

            const latestPricePromise = selectLatestWdPriceByDyeingAndFabric(fabric.dyeing_id, fabric.fabric_id);
            const [requisitions, latestPrice] = await Promise.all([requisitionsPromise, latestPricePromise]);

            const sortedAsc = mergeAndSortRequisitions(requisitions);
            const totals = calculateInventoryTotals(sortedAsc);

            return {
                ...fabric,
                latest_price: latestPrice,
                ...totals,
                details: sortedAsc
            };
        }));

        data = processedFabrics;
    }

    return data;
};

exports.selectInventoryTotalByFabricByDyeing = async (fabricId, dyeingId) => {
    const sortedAsc = await wdReportQueries.selectAllMovementsTotalByFabricByDyeing(fabricId, dyeingId);

    // Select Max Added Date
    let maxDateWhereCluse = {};
            maxDateWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
            maxDateWhereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
            const selectMaxDate = await knex(wdTransportWcWdTableName)
            .max({ date: 'date' })
            .innerJoin(`${wdTransportWcWdDetailsTableName}`,
                `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`,
                `${wdTransportWcWdTableName}.id`)
                .innerJoin(`${wdTableName}`,
                `${wdTableName}.wd_transport_wc_wd_details_id`,
                `${wdTransportWcWdDetailsTableName}.id`)
            .where(maxDateWhereCluse)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let wdTransportRequisitionWcWdDetailsWhereCluse = {};
        wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
        wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
        wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTransportWcWdTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await wdTransportRequisitionWcWdDetailsQueries.selectLatestPrice(wdTransportRequisitionWcWdDetailsWhereCluse)
        sortedAsc[0].latest_price = latestPrice[0]?.price
    } else {
        sortedAsc[0].latest_price = 0
    }
    return sortedAsc;
};


exports.selectInventoryDetails = async (fabricReport) => {
    let data = []

    let fabricWhereCluse = {};
    fabricWhereCluse[`${wdTableName}.is_deleted`] = 0;
    fabricWhereCluse[`${wdTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wdTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wdTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    
    let transitionBetweenDyersWhereCluse = {};
    transitionBetweenDyersWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    transitionBetweenDyersWhereCluse[`${fabricTableName}.is_active`] = 1;
    transitionBetweenDyersWhereCluse[`${wdTableName}.is_deleted`] = 0;
    transitionBetweenDyersWhereCluse[`${wdTableName}.is_active`] = 1;
    transitionBetweenDyersWhereCluse[`${wdTableName}.type`] = constantsPayloads.transportBetweenType;
    let whereCluseArray = [fabricWhereCluse, reconciliationWhereCluse, transitionBetweenDyersWhereCluse]

    // select dyersFabricsLots 
    let formFabrics = []
    let dyersFabricsLots = (fabricReport.isShowClosedBalances == 1) ? await wdQueries.selectStoredDyeingAndFabricAndConsigmentDyeing(whereCluseArray, 0) : await wdQueries.selectStoredDyeingAndFabricAndConsigmentDyeing(whereCluseArray)
    if (dyersFabricsLots[0] != null) {

        if(fabricReport.isShowClosedBalances == 0) {
            formFabrics = await wdQueries.selectStoredDyeingAndFabricAndConsigmentDyeingForm(whereCluseArray)
            if(formFabrics[0] != null) {
                let uniqueFabrics = arrayUniqueThreeColumn(
                    dyersFabricsLots.concat(formFabrics), 
                    'fabric_id', 'fabric_id', 
                'consigment_dyeing_id', 'consigment_dyeing_id',
            'wc_fabric_order_requisition_id', 'wc_fabric_order_requisition_id');
                dyersFabricsLots = uniqueFabrics
            }
        }

        const processedDyerFabricLots = await Promise.all(dyersFabricsLots.map(async (dyerFabricLots) => {
            const requisitionsPromise = Promise.all([
                wdTransportRequisitionWcWdDetailsQueries.selectDetailsByDyeingByFabricByConsigmentDyeing(
                    dyerFabricLots.dyeing_id, dyerFabricLots.fabric_id, dyerFabricLots.consigment_dyeing_id,
                    dyerFabricLots.wc_fabric_order_requisition_id
                ),
                wdReconciliationRequisitionDetailsQueries.selectInputDetailsByDyeingByFabricByConsigmentDyeing(
                    dyerFabricLots.dyeing_id, dyerFabricLots.fabric_id, dyerFabricLots.consigment_dyeing_id,
                    dyerFabricLots.wc_fabric_order_requisition_id
                ),
                wdReconciliationRequisitionDetailsQueries.selectOutputDetailsByDyeingByFabricByConsigmentDyeing(
                    dyerFabricLots.dyeing_id, dyerFabricLots.fabric_id, dyerFabricLots.consigment_dyeing_id,
                    dyerFabricLots.wc_fabric_order_requisition_id
                ),
                wdTransportRequisitionWdWcDetailsQueries.selectDetailsByDyeingByFabricByConsigmentDyeing(
                    dyerFabricLots.dyeing_id, dyerFabricLots.fabric_id, dyerFabricLots.consigment_dyeing_id,
                    dyerFabricLots.wc_fabric_order_requisition_id
                ),
                wdTransitionBetweenDyersRequisitionDetailsQueries.selectFromDyeingDetailsByDyeingByFabricByConsigmentDyeing(
                    dyerFabricLots.dyeing_id, dyerFabricLots.fabric_id, dyerFabricLots.consigment_dyeing_id,
                    dyerFabricLots.wc_fabric_order_requisition_id
                ),
                wdTransitionBetweenDyersRequisitionDetailsQueries.selectToDyeingDetailsByDyeingByFabricByConsigmentDyeing(
                    dyerFabricLots.dyeing_id, dyerFabricLots.fabric_id, dyerFabricLots.consigment_dyeing_id,
                    dyerFabricLots.wc_fabric_order_requisition_id
                ),
                wdDyeingRequisitionDetailsQueries.selectDetailsByDyeingByFabricByConsigmentDyeing(
                    dyerFabricLots.dyeing_id, dyerFabricLots.fabric_id, dyerFabricLots.consigment_dyeing_id,
                    dyerFabricLots.wc_fabric_order_requisition_id
                ),
                wdFormDyeingRequisitionDetailsQueries.selectDetailsByDyeingByFabricByConsigmentDyeing(
                    dyerFabricLots.dyeing_id, dyerFabricLots.fabric_id, dyerFabricLots.consigment_dyeing_id,
                    dyerFabricLots.wc_fabric_order_requisition_id
                ),
                wdFormDyeingRequisitionDetailsQueries.selectDetailsByDyeingByFabricByConsigmentDyeingPreparedDyeing(
                    dyerFabricLots.dyeing_id, dyerFabricLots.fabric_id, dyerFabricLots.consigment_dyeing_id,
                    dyerFabricLots.wc_fabric_order_requisition_id
                )
            ]);

            const latestPricePromise = selectLatestWdPriceByDyeingAndFabric(
                dyerFabricLots.dyeing_id,
                dyerFabricLots.fabric_id,
                dyerFabricLots.consigment_dyeing_id
            );

            const [requisitions, latestPrice] = await Promise.all([requisitionsPromise, latestPricePromise]);
            const sortedAsc = mergeAndSortRequisitions(requisitions);
            const totals = calculateInventoryTotals(sortedAsc);

            return {
                ...dyerFabricLots,
                latest_price: latestPrice,
                ...totals,
                details: sortedAsc
            };
        }));

        data = processedDyerFabricLots;
    }

    return data;
};

exports.selectInventoryDetailsByDyeingByFabricByConsigmentDyeing = async (dyeingId, fabricId, consigmentDyeingId, fabricOrderId) => {
    const sortedAsc = await wdReportQueries.selectAllMovementsByDyeingByFabricByConsigmentDyeing(dyeingId, fabricId, consigmentDyeingId, fabricOrderId);

    // Select Max Added Date
    let maxDateWhereCluse = {};
    maxDateWhereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
    maxDateWhereCluse[`${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
    const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(wdTransportWcWdTableName,
        { date: 'date' }, maxDateWhereCluse,
        wdTransportWcWdDetailsTableName,
        `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`,
        `${wdTransportWcWdDetailsTableName}.id`)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let wdTransportRequisitionWcWdDetailsWhereCluse = {};
        wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
        wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTransportWcWdTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await wdTransportRequisitionWcWdDetailsQueries.selectLatestPrice(wdTransportRequisitionWcWdDetailsWhereCluse)
        sortedAsc[0].latest_price = (latestPrice[0] == undefined) ? 0 : latestPrice[0]?.price
    } else {
        sortedAsc[0].latest_price = 0
    }
    return sortedAsc;
};

exports.selectAllMovementsByConsigmentDyeing = async (consigmentDyeingId) => {
    return await wdReportQueries.selectAllMovementsByConsigmentDyeing(consigmentDyeingId);
};

exports.selectPriceWd = async (fabricId, dyeingId) => {
    let callArray = []

    callArray.push(wdTransportRequisitionWcWdDetailsQueries.selectPriceByFabricIdByDyeingId(fabricId, dyeingId))
    callArray.push(wdTransportRequisitionWdWcDetailsQueries.selectPriceByFabricIdByDyeingId(fabricId, dyeingId))
    callArray.push(wdReconciliationRequisitionDetailsQueries.selectPriceByFabricIdByDyeingId(fabricId, dyeingId))
    callArray.push(wdTransitionBetweenDyersRequisitionDetailsQueries.selectFromDyeingPriceByFabricIdByDyeingId(fabricId, dyeingId))
    callArray.push(wdTransitionBetweenDyersRequisitionDetailsQueries.selectToDyeingPriceByFabricIdByDyeingId(fabricId, dyeingId))
    callArray.push(wdDyeingRequisitionDetailsQueries.selectPriceByFabricIdByDyeingId(fabricId, dyeingId))
    const requisitions = await Promise.all(callArray)
    let sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4], 
    ...requisitions[5]].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
            maxDateWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
            maxDateWhereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
            const selectMaxDate = await knex(wdTransportWcWdTableName)
            .max({ date: 'date' })
            .innerJoin(`${wdTransportWcWdDetailsTableName}`,
                `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`,
                `${wdTransportWcWdTableName}.id`)
                .innerJoin(`${wdTableName}`,
                `${wdTableName}.wd_transport_wc_wd_details_id`,
                `${wdTransportWcWdDetailsTableName}.id`)
            .where(maxDateWhereCluse)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let wdTransportRequisitionWcWdDetailsWhereCluse = {};
        wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
        wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
        wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTransportWcWdTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await wdTransportRequisitionWcWdDetailsQueries.selectLatestPrice(wdTransportRequisitionWcWdDetailsWhereCluse)
        if(sortedAsc[0] == undefined) {
            sortedAsc = [{"latest_price": 0}]
        } else {
            sortedAsc[0].latest_price = (latestPrice[0] == undefined) ? 0 : latestPrice[0]?.price
        }
    } else {
        sortedAsc[0].latest_price = 0
    }
    return sortedAsc;
};

exports.selectPriceByFabricByDyeingByConsigmentDyeingInWd = async (fabricId, dyeingId, consigmentDyeingId) => {
    let callArray = []

    callArray.push(wdTransportRequisitionWcWdDetailsQueries.selectPriceByFabricIdByDyeingIdByConsigmentDyeingId(fabricId, dyeingId, consigmentDyeingId))
    callArray.push(wdTransportRequisitionWdWcDetailsQueries.selectPriceByFabricIdByDyeingIdByConsigmentDyeingId(fabricId, dyeingId, consigmentDyeingId))
    callArray.push(wdReconciliationRequisitionDetailsQueries.selectPriceByFabricIdByDyeingIdByConsigmentDyeingId(fabricId, dyeingId, consigmentDyeingId))
    callArray.push(wdTransitionBetweenDyersRequisitionDetailsQueries.selectFromDyeingPriceByFabricIdByDyeingIdByConsigmentDyeingId(fabricId, dyeingId, consigmentDyeingId))
    callArray.push(wdTransitionBetweenDyersRequisitionDetailsQueries.selectToDyeingPriceByFabricIdByDyeingIdByConsigmentDyeingId(fabricId, dyeingId, consigmentDyeingId))
    callArray.push(wdDyeingRequisitionDetailsQueries.selectPriceByFabricIdByDyeingIdByConsigmentDyeingId(fabricId, dyeingId, consigmentDyeingId))
    const requisitions = await Promise.all(callArray)
    let sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4], 
    ...requisitions[5]].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
            maxDateWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
            maxDateWhereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
            maxDateWhereCluse[`${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
            const selectMaxDate = await knex(wdTransportWcWdTableName)
            .max({ date: 'date' })
            .innerJoin(`${wdTransportWcWdDetailsTableName}`,
                `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`,
                `${wdTransportWcWdTableName}.id`)
                .innerJoin(`${wdTableName}`,
                `${wdTableName}.wd_transport_wc_wd_details_id`,
                `${wdTransportWcWdDetailsTableName}.id`)
            .where(maxDateWhereCluse)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let wdTransportRequisitionWcWdDetailsWhereCluse = {};
        wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
        wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
        wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
        wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTransportWcWdTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await wdTransportRequisitionWcWdDetailsQueries.selectLatestPrice(wdTransportRequisitionWcWdDetailsWhereCluse)
        if(sortedAsc[0] == undefined) {
            sortedAsc = [{"latest_price": 0, "latest_price_dollar": 0}]
        } else {
            sortedAsc[0].latest_price = (latestPrice[0] == undefined) ? 0 : latestPrice[0]?.price
            sortedAsc[0].latest_price_dollar = (latestPrice[0] == undefined) ? 0 : latestPrice[0]?.price_dollar
        }
    } else {
        sortedAsc[0].latest_price = 0
        sortedAsc[0].latest_price_dollar = 0
    }
    return sortedAsc;
};

exports.selectInventoryByConsigmentsDyeing = async (consigmentsDyeing) => {
    let callArray = []
    
    let wdTransportWcWdDetailsWhereCluse = {};
    wdTransportWcWdDetailsWhereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
    wdTransportWcWdDetailsWhereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;
    callArray.push(wdTransportRequisitionWcWdDetailsQueries.selectByConsigmentDyeingForDyedFabricOrder(wdTransportWcWdDetailsWhereCluse, consigmentsDyeing))
    
    let wdTransportRequisitionWdWcWhereCluse = {};
    wdTransportRequisitionWdWcWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
    wdTransportRequisitionWdWcWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;
    callArray.push(wdTransportRequisitionWdWcDetailsQueries.selectByConsigmentDyeingForDyedFabricOrder(wdTransportRequisitionWdWcWhereCluse, consigmentsDyeing))
    
    let wdReconciliationRequisitionDetailsWhereCluse = {};
    wdReconciliationRequisitionDetailsWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
    wdReconciliationRequisitionDetailsWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.is_active`] = 1;
    callArray.push(wdReconciliationRequisitionDetailsQueries.selectByConsigmentDyeingForDyedFabricOrder(wdReconciliationRequisitionDetailsWhereCluse, consigmentsDyeing))
    
    let wdTransitionBetweenDyersRequisitionDetailsWhereCluse = {};
    wdTransitionBetweenDyersRequisitionDetailsWhereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_deleted`] = 0;
    wdTransitionBetweenDyersRequisitionDetailsWhereCluse[`${wdTransitionBetweenDyersRequisitionDetailsTableName}.is_active`] = 1;
    callArray.push(wdTransitionBetweenDyersRequisitionDetailsQueries.selectFromByConsigmentDyeingForDyedFabricOrder(wdTransitionBetweenDyersRequisitionDetailsWhereCluse, consigmentsDyeing))
    callArray.push(wdTransitionBetweenDyersRequisitionDetailsQueries.selectToByConsigmentDyeingForDyedFabricOrder(wdTransitionBetweenDyersRequisitionDetailsWhereCluse, consigmentsDyeing))
    
    let wdDyeingRequisitionDetailsWhereCluse = {};
    wdDyeingRequisitionDetailsWhereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
    wdDyeingRequisitionDetailsWhereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;
    callArray.push(wdDyeingRequisitionDetailsQueries.selectByConsigmentDyeingForDyedFabricOrder(wdDyeingRequisitionDetailsWhereCluse, consigmentsDyeing))
    
    let wdFormDyeingRequisitionDetailsWhereCluse = {};
    wdFormDyeingRequisitionDetailsWhereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
    wdFormDyeingRequisitionDetailsWhereCluse[`${wdFormDyeingRequisitionDetailsTableName}.is_active`] = 1;
    callArray.push(wdFormDyeingRequisitionDetailsQueries.selectByConsigmentDyeingForDyedFabricOrder(wdFormDyeingRequisitionDetailsWhereCluse, consigmentsDyeing))
    
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5], ...requisitions[6]].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    return sortedAsc;
};

exports.selectInventoryTotalByDate = async (bodyPaylod) => {
    let callArray = []
    
    callArray.push(wdTransportRequisitionWcWdDetailsQueries.selectTotalDetailsByDateWd(bodyPaylod))
    callArray.push(wdTransportRequisitionWdWcDetailsQueries.selectTotalDetailsByDateWd(bodyPaylod))
    callArray.push(wdReconciliationRequisitionDetailsQueries.selectTotalDetailsByDateWd(bodyPaylod))
    callArray.push(wdTransitionBetweenDyersRequisitionDetailsQueries.selectFromDyeingTotalDetailsByDate(bodyPaylod))
    callArray.push(wdTransitionBetweenDyersRequisitionDetailsQueries.selectToDyeingTotalDetailsByDate(bodyPaylod))
    callArray.push(wdDyeingRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPaylod))
    callArray.push(wdFormDyeingRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPaylod))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5], ...requisitions[6]].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    return sortedAsc;
};

exports.dyeingReportByDyeing = async (dyeingId) => {

    const manufacturingReportByFabricResult = await wdReportQueries.dyeingReportByDyeing(dyeingId)
    return manufacturingReportByFabricResult
};

exports.dyeingReportByDyes = async () => {
    let data = []
    
    let dyers = await bussinessmanService.selectDyerDyeing()
    if(dyers[0] != null) {
        for (let i = 0; i < dyers.length; i++) {
            const dyer = dyers[i];
            const dyeingReportByDyesResult = await wdReportQueries.dyeingReportByDyes(dyer.id)
            if(dyeingReportByDyesResult[0] != null) {
                data.push({...dyer, ...dyeingReportByDyesResult[0]})
            }
        }
    }

    return data
};

exports.dyeingOrdersReport = async () => {
    const results = await wdReportQueries.dyeingOrdersReport();
    return results;
};

exports.dyeingOrdersDetailsReport = async () => {
    const results = await wdReportQueries.dyeingOrdersDetailsReport();
    return results;
};

exports.formReportByFabric = async (fabricReport) => {
    let data = []

    let fabricWhereCluse = {};
    fabricWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    fabricWhereCluse[`${fabricTableName}.is_active`] = 1;
    fabricWhereCluse[`${wdTableName}.is_deleted`] = 0;
    fabricWhereCluse[`${wdTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${fabricTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wdTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wdTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transitionBetweenDyersWhereCluse = {};
    transitionBetweenDyersWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    transitionBetweenDyersWhereCluse[`${fabricTableName}.is_active`] = 1;
    transitionBetweenDyersWhereCluse[`${wdTableName}.is_deleted`] = 0;
    transitionBetweenDyersWhereCluse[`${wdTableName}.is_active`] = 1;
    transitionBetweenDyersWhereCluse[`${wdTableName}.type`] = constantsPayloads.transportBetweenType;
    let whereCluseArray = [fabricWhereCluse, reconciliationWhereCluse, transitionBetweenDyersWhereCluse]

    // select fabrics 
    let formFabrics = []
    
    let fabrics = (fabricReport.isShowClosedBalances == 1) ? await fabricQueries.selectStoredWdFabrics(whereCluseArray, 0) : await fabricQueries.selectStoredWdFabrics(whereCluseArray)
    if (Array.isArray(fabrics) && fabrics.length > 0) {
        if(fabricReport.isShowClosedBalances == 0) {
            formFabrics = await fabricQueries.selectStoredWdFormFabrics(whereCluseArray)
            fabrics = [...fabrics, ...formFabrics]
        }
        for (let i = 0; i < fabrics.length; i++) {
            let fabric = fabrics[i];
            let callArray = []

            data.push(fabric)

            callArray.push(wdTransportRequisitionWcWdDetailsQueries.selectInputTotalByFabricId(fabric.fabric_id, fabric.dyeing_id))
            callArray.push(wdReconciliationRequisitionDetailsQueries.selectInputTotalByFabricId(fabric.fabric_id, fabric.dyeing_id))
            callArray.push(wdReconciliationRequisitionDetailsQueries.selectOutputTotalByFabricId(fabric.fabric_id, fabric.dyeing_id))
            callArray.push(wdTransportRequisitionWdWcDetailsQueries.selectTotalByFabricIdForOutput(fabric.fabric_id, fabric.dyeing_id))
            callArray.push(wdTransitionBetweenDyersRequisitionDetailsQueries.selectFromDyeingTotalByFabricId(fabric.fabric_id, fabric.dyeing_id))
            callArray.push(wdTransitionBetweenDyersRequisitionDetailsQueries.selectToDyeingTotalByFabricId(fabric.fabric_id, fabric.dyeing_id))
            callArray.push(wdDyeingRequisitionDetailsQueries.selectTotalByFabricId(fabric.fabric_id, fabric.dyeing_id))
            callArray.push(wdFormDyeingRequisitionDetailsQueries.selectTotalByFabricId(fabric.fabric_id, fabric.dyeing_id))
            const requisitions = await Promise.all(callArray)
            const sortedAsc = [...requisitions[0], ...requisitions[1],
            ...requisitions[2], ...requisitions[3], ...requisitions[4],
            ...requisitions[5], ...requisitions[6], ...requisitions[7]].sort(
                (objA, objB) => moment(objA.date) - moment(objB.date)
            );
            data[i].details = sortedAsc
            // console.log("data[i] ::: ", data[i]);

        }
    }

    return data;
};

function arrayUnique(array, leftColumn, rightColumn) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i][leftColumn] === a[j][rightColumn] &&
                a[i]['dyeing_id'] === a[j]['dyeing_id'])
                a.splice(j--, 1);
        }
    }

    return a;
}

async function selectLatestWdPriceByDyeingAndFabric(dyeingId, fabricId, consigmentDyeingId = null) {
    let maxDateWhereCluse = {};
    maxDateWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
    maxDateWhereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
    if (consigmentDyeingId != null) {
        maxDateWhereCluse[`${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
    }

    const selectMaxDate = await knex(wdTransportWcWdTableName)
        .max({ date: 'date' })
        .innerJoin(`${wdTransportWcWdDetailsTableName}`,
            `${wdTransportWcWdDetailsTableName}.wd_transport_wc_wd_id`,
            `${wdTransportWcWdTableName}.id`)
        .innerJoin(`${wdTableName}`,
            `${wdTableName}.wd_transport_wc_wd_details_id`,
            `${wdTransportWcWdDetailsTableName}.id`)
        .where(maxDateWhereCluse);

    if (selectMaxDate[0] == null || selectMaxDate[0]?.date == null) {
        return 0;
    }

    let wdTransportRequisitionWcWdDetailsWhereCluse = {};
    wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTableName}.dyeing_id`] = dyeingId;
    wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTransportWcWdDetailsTableName}.fabric_id`] = fabricId;
    if (consigmentDyeingId != null) {
        wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTransportWcWdDetailsTableName}.consigment_dyeing_id`] = consigmentDyeingId;
    }
    wdTransportRequisitionWcWdDetailsWhereCluse[`${wdTransportWcWdTableName}.date`] = selectMaxDate[0]?.date;

    const latestPrice = await wdTransportRequisitionWcWdDetailsQueries.selectLatestPrice(wdTransportRequisitionWcWdDetailsWhereCluse);
    if (latestPrice[0] == null) {
        return 0;
    }

    return latestPrice[0]?.price || 0;
}

function mergeAndSortRequisitions(requisitions) {
    return requisitions.flat().sort((objA, objB) => moment(objA.date) - moment(objB.date));
}

function calculateInventoryTotals(sortedAsc) {
    const totals = sortedAsc.reduce((accumulator, item) => {
        const inputOutputType = parseInt(item.input_output);
        if (inputOutputType === 1) {
            accumulator.totalInput += parseFloat(item.quantity) || 0;
        } else if (inputOutputType === 0) {
            accumulator.totalOutput += parseFloat(item.quantity) || 0;
        } else if (inputOutputType === 2) {
            accumulator.totalFormQuantity += parseFloat(item.form_current_quantity) || 0;
            accumulator.totalFormPrepareDyeingQuantity += parseFloat(item.form_prepare_dyeing_current_quantity) || 0;
        }
        return accumulator;
    }, {
        totalInput: 0,
        totalOutput: 0,
        totalFormQuantity: 0,
        totalFormPrepareDyeingQuantity: 0
    });

    return {
        input_quantity: parseFloat(totals.totalInput.toFixed(2)),
        output_quantity: parseFloat(totals.totalOutput.toFixed(2)),
        form_current_quantity: parseFloat(totals.totalFormQuantity.toFixed(2)),
        form_prepare_dyeing_current_quantity: parseFloat(totals.totalFormPrepareDyeingQuantity.toFixed(2))
    };
}

function arrayUniqueThreeColumn(array, 
    leftColumn, rightColumn,
    leftColumn2, rightColumn2,
    leftColumn3, rightColumn3) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i][leftColumn] === a[j][rightColumn] && 
                a[i][leftColumn2] === a[j][rightColumn2] &&
                a[i][leftColumn3] === a[j][rightColumn3] &&
                a[i]['dyeing_id'] === a[j]['dyeing_id'])
                a.splice(j--, 1);
        }
    }

    return a;
}

exports.inquireFabricAvilabilityReportWd = async (fabric) => {
    
    let bussinessmanWhereCluse = {};
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_stock`] = 1;
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_deleted`] = 0;
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_active`] = 1;

    let wdFabricWhereCluse = {};
    wdFabricWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    wdFabricWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wdFabricWhereCluse[`${fabricTableName}.is_active`] = 1;

    let wdReconciliationWhereCluse = {};
    wdReconciliationWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    wdReconciliationWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wdReconciliationWhereCluse[`${fabricTableName}.is_active`] = 1;
    wdReconciliationWhereCluse[`${wdTableName}.is_deleted`] = 0;
    wdReconciliationWhereCluse[`${wdTableName}.is_active`] = 1;
    wdReconciliationWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let wdTransitionBetweenDyersWhereCluse = {};
    wdTransitionBetweenDyersWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    wdTransitionBetweenDyersWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wdTransitionBetweenDyersWhereCluse[`${fabricTableName}.is_active`] = 1;
    wdTransitionBetweenDyersWhereCluse[`${wdTableName}.is_deleted`] = 0;
    wdTransitionBetweenDyersWhereCluse[`${wdTableName}.is_active`] = 1;
    wdTransitionBetweenDyersWhereCluse[`${wdTableName}.type`] = constantsPayloads.transportBetweenType;

    let wdWhereCluseArray = [wdFabricWhereCluse, wdReconciliationWhereCluse, wdTransitionBetweenDyersWhereCluse, bussinessmanWhereCluse]

    // select wd Fabrics 
    let wdFabrics = await fabricQueries.selectStoredWdFabricsForInquireFabricAvilability(wdWhereCluseArray)
    return wdFabrics
};

exports.inquireFabricAvilabilityTotalReportWd = async (fabric) => {
    
    let bussinessmanWhereCluse = {};
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_stock`] = 1;
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_deleted`] = 0;
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_active`] = 1;

    let wdFabricWhereCluse = {};
    wdFabricWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    wdFabricWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wdFabricWhereCluse[`${fabricTableName}.is_active`] = 1;

    let wdReconciliationWhereCluse = {};
    wdReconciliationWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    wdReconciliationWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wdReconciliationWhereCluse[`${fabricTableName}.is_active`] = 1;
    wdReconciliationWhereCluse[`${wdTableName}.is_deleted`] = 0;
    wdReconciliationWhereCluse[`${wdTableName}.is_active`] = 1;
    wdReconciliationWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let wdTransitionBetweenDyersWhereCluse = {};
    wdTransitionBetweenDyersWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    wdTransitionBetweenDyersWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wdTransitionBetweenDyersWhereCluse[`${fabricTableName}.is_active`] = 1;
    wdTransitionBetweenDyersWhereCluse[`${wdTableName}.is_deleted`] = 0;
    wdTransitionBetweenDyersWhereCluse[`${wdTableName}.is_active`] = 1;
    wdTransitionBetweenDyersWhereCluse[`${wdTableName}.type`] = constantsPayloads.transportBetweenType;

    let wdWhereCluseArray = [wdFabricWhereCluse, wdReconciliationWhereCluse, wdTransitionBetweenDyersWhereCluse, bussinessmanWhereCluse]

    // select wd Fabrics 
    let wdFabrics = await fabricQueries.selectStoredWdFabricsForInquireFabricAvilabilityTotal(wdWhereCluseArray)
    return wdFabrics
};

exports.inquireFabricFormAvilabilityReportWd = async (fabric) => {
    
    let bussinessmanWhereCluse = {};
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_stock`] = 1;
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_deleted`] = 0;
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_active`] = 1;

    let wdFabricWhereCluse = {};
    wdFabricWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    wdFabricWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wdFabricWhereCluse[`${fabricTableName}.is_active`] = 1;
    wdFabricWhereCluse[`${anointedColorsPricesTableName}.color_id`] = fabric.colorId;
    wdFabricWhereCluse[`${anointedColorsPricesTableName}.code`] = fabric.colorCode;

    // let wdReconciliationWhereCluse = {};
    // wdReconciliationWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    // wdReconciliationWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    // wdReconciliationWhereCluse[`${fabricTableName}.is_active`] = 1;
    // wdReconciliationWhereCluse[`${anointedColorsPricesTableName}.color_id`] = fabric.colorId;
    // wdReconciliationWhereCluse[`${anointedColorsPricesTableName}.code`] = fabric.colorCode;
    // wdReconciliationWhereCluse[`${wdTableName}.is_deleted`] = 0;
    // wdReconciliationWhereCluse[`${wdTableName}.is_active`] = 1;
    // wdReconciliationWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    // let wdTransitionBetweenDyersWhereCluse = {};
    // wdTransitionBetweenDyersWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    // wdTransitionBetweenDyersWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    // wdTransitionBetweenDyersWhereCluse[`${fabricTableName}.is_active`] = 1;
    // wdTransitionBetweenDyersWhereCluse[`${anointedColorsPricesTableName}.color_id`] = fabric.colorId;
    // wdTransitionBetweenDyersWhereCluse[`${anointedColorsPricesTableName}.code`] = fabric.colorCode;
    // wdTransitionBetweenDyersWhereCluse[`${wdTableName}.is_deleted`] = 0;
    // wdTransitionBetweenDyersWhereCluse[`${wdTableName}.is_active`] = 1;
    // wdTransitionBetweenDyersWhereCluse[`${wdTableName}.type`] = constantsPayloads.transportBetweenType;

    let wdWhereCluseArray = [wdFabricWhereCluse, bussinessmanWhereCluse]

    // select wd Form Fabrics 
    let wdFormFabrics = await fabricQueries.selectStoredWdFormFabricsForInquireFabricAvilability(wdWhereCluseArray)
    return wdFormFabrics
};

exports.inquireFabricFormAvilabilityTotalReportWd = async (fabric) => {

    let bussinessmanWhereCluse = {};
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_stock`] = 1;
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_deleted`] = 0;
    bussinessmanWhereCluse[`${bussinessmanTableName}.is_active`] = 1;

    let wdFabricWhereCluse = {};
    wdFabricWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    wdFabricWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wdFabricWhereCluse[`${fabricTableName}.is_active`] = 1;
    wdFabricWhereCluse[`${anointedColorsPricesTableName}.color_id`] = fabric.colorId;
    wdFabricWhereCluse[`${anointedColorsPricesTableName}.code`] = fabric.colorCode;

    // let wdReconciliationWhereCluse = {};
    // wdReconciliationWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    // wdReconciliationWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    // wdReconciliationWhereCluse[`${fabricTableName}.is_active`] = 1;
    // wdReconciliationWhereCluse[`${anointedColorsPricesTableName}.color_id`] = fabric.colorId;
    // wdReconciliationWhereCluse[`${anointedColorsPricesTableName}.code`] = fabric.colorCode;
    // wdReconciliationWhereCluse[`${wdTableName}.is_deleted`] = 0;
    // wdReconciliationWhereCluse[`${wdTableName}.is_active`] = 1;
    // wdReconciliationWhereCluse[`${wdReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    // let wdTransitionBetweenDyersWhereCluse = {};
    // wdTransitionBetweenDyersWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    // wdTransitionBetweenDyersWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    // wdTransitionBetweenDyersWhereCluse[`${fabricTableName}.is_active`] = 1;
    // wdTransitionBetweenDyersWhereCluse[`${anointedColorsPricesTableName}.color_id`] = fabric.colorId;
    // wdTransitionBetweenDyersWhereCluse[`${anointedColorsPricesTableName}.code`] = fabric.colorCode;
    // wdTransitionBetweenDyersWhereCluse[`${wdTableName}.is_deleted`] = 0;
    // wdTransitionBetweenDyersWhereCluse[`${wdTableName}.is_active`] = 1;
    // wdTransitionBetweenDyersWhereCluse[`${wdTableName}.type`] = constantsPayloads.transportBetweenType;

    let wdWhereCluseArray = [wdFabricWhereCluse, bussinessmanWhereCluse]

    // select wd Form Fabrics 
    let wdFormFabrics = await fabricQueries.selectStoredWdFormFabricsForInquireFabricAvilabilityTotal(wdWhereCluseArray)
    return wdFormFabrics
};
