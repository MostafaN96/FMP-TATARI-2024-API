const moment = require("moment")

// Config
const knex = require("../../db/config/connection").getConnection();

// Service
const wcReportQueries = require("../../db/queries/wc/wc-report");

// Queries
const fabricQueries = require("../../db/queries/general/fabric");
const wcQueries = require("../../db/queries/wc/wc");
const generalQueries = require("../../db/queries/general/general");
const wbManufacturingOutputQueries = require("../../db/queries/wb/wb-manufacturing-output");
const wcAddRequisitionDetailsQueries = require("../../db/queries/wc/wc-add-requisition-details");
const wcSellRequisitionDetailsQueries = require("../../db/queries/wc/wc-sell-requisition-details");
const wcReturnRequisitionDetailsQueries = require("../../db/queries/wc/wc-return-requisition-details");
const wcReconciliationRequisitionDetailsQueries = require("../../db/queries/wc/wc-reconciliation-requisition-details");
const wdTransportWcWdDetailsQueries = require("../../db/queries/wd/wd-transport-wc-wd-details");
const wdTransportRequisitionWdWcDetailsQueries = require("../../db/queries/wd/wd-transport-requisition-wd-wc-details");
const bussinessmanService = require("../../services/general/bussinessman");
const wdDyeingOrderRequisitionDetailsService = require("../../services/wd/wd-dyeing-order-requisition-details");
const wcExecuteOrderRequisitionDetailsQueries = require("../../db/queries/wc/wc-execute-order-requisition-details");
const wcTransitionBetweenWHRequisitionDetailsQueries = require("../../db/queries/wc/wc-transition-between-wh-requisition-details");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wbManufacturingOutputTableName, wbManufacturingRequisitionTableName, 
    wbManufacturingInputOutputTableName, warehouseTableName,
    fabricTableName, wcTableName, wcReconciliationRequisitionDetailsTableName,
    wcAddRequisitionTableName, wcAddRequisitionDetailsTableName

} = require("../../util/database-tables-name");

exports.selectInventoryTotal = async (fabricReport) => {
    let data = []

    let fabricWhereCluse = {};
    fabricWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    fabricWhereCluse[`${fabricTableName}.is_active`] = 1;
    fabricWhereCluse[`${wcTableName}.is_deleted`] = 0;
    fabricWhereCluse[`${wcTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${fabricTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wcTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wcTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transportWdWcWhereCluse = {};
    transportWdWcWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    transportWdWcWhereCluse[`${fabricTableName}.is_active`] = 1;
    transportWdWcWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transportWdWcWhereCluse[`${wcTableName}.is_active`] = 1;
    transportWdWcWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportFromBToAType;

    let manufacturingOutputWhereCluse = {};
    manufacturingOutputWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    manufacturingOutputWhereCluse[`${fabricTableName}.is_active`] = 1;
    manufacturingOutputWhereCluse[`${wcTableName}.is_deleted`] = 0;
    manufacturingOutputWhereCluse[`${wcTableName}.is_active`] = 1;
    manufacturingOutputWhereCluse[`${wcTableName}.type`] = constantsPayloads.manufactruingType;

    let executeOrderWhereCluse = {};
    executeOrderWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    executeOrderWhereCluse[`${fabricTableName}.is_active`] = 1;
    executeOrderWhereCluse[`${wcTableName}.is_deleted`] = 0;
    executeOrderWhereCluse[`${wcTableName}.is_active`] = 1;
    executeOrderWhereCluse[`${wcTableName}.type`] = constantsPayloads.executeOrderType;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${fabricTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${wcTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportBetweenType;

    let whereCluseArray = [
        fabricWhereCluse, reconciliationWhereCluse, 
        transportWdWcWhereCluse, manufacturingOutputWhereCluse,
        executeOrderWhereCluse, transitionBetweenWhWhereCluse
    ]

    // select fabrics 
    const fabrics = (fabricReport.isShowClosedBalances == 1) ? await fabricQueries.selectStoredWcFabrics(whereCluseArray, 0) : await fabricQueries.selectStoredWcFabrics(whereCluseArray)
    if (fabrics[0] != null) {
        for (let i = 0; i < fabrics.length; i++) {
            let fabric = fabrics[i];
            let callArray = []

            // Select Max Added Date
            let maxDateWhereCluse = {};
            maxDateWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabric.id;
            const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(wcAddRequisitionTableName,
                { date: 'date' }, maxDateWhereCluse,
                wcAddRequisitionDetailsTableName,
                `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`,
                `${wcAddRequisitionTableName}.id`)
            if (selectMaxDate[0] != null) {
                // Select Latest Price
                let wcAddRequisitionDetailsWhereCluse = {};
                wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabric.id;
                wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
                const latestPrice = await wcAddRequisitionDetailsQueries.selectLatestPrice(wcAddRequisitionDetailsWhereCluse)
                fabric.latest_price = (latestPrice[0] == undefined) ? 0 : latestPrice[0]?.price
                fabric.latest_price_dollar = (latestPrice[0] == undefined) ? 0 : latestPrice[0]?.price_dollar
            } else {
                fabric.latest_price = 0
                fabric.latest_price_dollar = 0
            }
            let manufacturingMaxDateWhereCluse = {};
            manufacturingMaxDateWhereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabric.id;
            const selectManufacturingMaxDate = await knex(wbManufacturingOutputTableName)
            .max({ date: 'date' })
            .innerJoin(wbManufacturingInputOutputTableName,
                `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`,
                `${wbManufacturingOutputTableName}.id`)
                .innerJoin(wbManufacturingRequisitionTableName,
                    `${wbManufacturingRequisitionTableName}.id`,
                    `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
            .where(manufacturingMaxDateWhereCluse)
            
            if (selectManufacturingMaxDate[0].date != null) {
                // Select Latest Manufacturing Price
                let wbManufacturingOutputWhereCluse = {};
                wbManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabric.id;
                wbManufacturingOutputWhereCluse[`${wbManufacturingRequisitionTableName}.date`] = selectManufacturingMaxDate[0]?.date;
                const latestManufacturingPrice = await wbManufacturingOutputQueries.selectLatestPrice(wbManufacturingOutputWhereCluse)
                fabric.latest_manufacturing_price = (latestManufacturingPrice[0] == undefined) ? 0 : latestManufacturingPrice[0]?.price
                fabric.latest_manufacturing_price_dollar = (latestManufacturingPrice[0] == undefined) ? 0 : latestManufacturingPrice[0]?.price_dollar
            } else {
                fabric.latest_manufacturing_price = 0
                fabric.latest_manufacturing_price_dollar = 0
            }
            // Get Sum Current Quantity Of fabric 
            // const sumCurrentQuantity = await waService.selectSumCurrentQuantityByYarnWa(fabric.id)
            // fabric.current_quantity = sumCurrentQuantity[0].current_quantity

            data.push(fabric)

            callArray.push(wcAddRequisitionDetailsQueries.selectTotalByFabricId(fabric.id))
            callArray.push(wcSellRequisitionDetailsQueries.selectTotalByFabricId(fabric.id))
            callArray.push(wcReturnRequisitionDetailsQueries.selectTotalByFabricId(fabric.id))
            callArray.push(wcReconciliationRequisitionDetailsQueries.selectTotalByFabricId(fabric.id))
            callArray.push(wdTransportWcWdDetailsQueries.selectTotalByFabricId(fabric.id))
            callArray.push(wdTransportRequisitionWdWcDetailsQueries.selectTotalByFabricIdForInput(fabric.id))
            callArray.push(wbManufacturingOutputQueries.selectTotalByFabricId(fabric.id))
            callArray.push(wcExecuteOrderRequisitionDetailsQueries.selectFromTotalByFabricId(fabric.id))
            callArray.push(wcExecuteOrderRequisitionDetailsQueries.selectToTotalByFabricId(fabric.id))
            callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectFromTotalByFabricId(fabric.id))
            callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectToTotalByFabricId(fabric.id))

            const requisitions = await Promise.all(callArray)
            const sortedAsc = [...requisitions[0], ...requisitions[1],
            ...requisitions[2], ...requisitions[3], ...requisitions[4],
            ...requisitions[5], ...requisitions[6], ...requisitions[7],
            ...requisitions[8], ...requisitions[9], ...requisitions[10]
        ].sort(
                (objA, objB) => moment(objA.date) - moment(objB.date)
            );
            data[i].details = sortedAsc

        }
    }

    return data;
};

exports.selectInventoryTotalByFabric = async (fabricId) => {
    let callArray = []

    callArray.push(wcAddRequisitionDetailsQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(wcSellRequisitionDetailsQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(wcReturnRequisitionDetailsQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(wcReconciliationRequisitionDetailsQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(wdTransportWcWdDetailsQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(wdTransportRequisitionWdWcDetailsQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(wbManufacturingOutputQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(wcExecuteOrderRequisitionDetailsQueries.selectFromTotalDetailsByFabricId(fabricId))
    callArray.push(wcExecuteOrderRequisitionDetailsQueries.selectToTotalDetailsByFabricId(fabricId))
    callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectFromTotalDetailsByFabricId(fabricId))
    callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectToTotalDetailsByFabricId(fabricId))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5], ...requisitions[6], ...requisitions[7],
    ...requisitions[8], ...requisitions[9], ...requisitions[10]
].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
    maxDateWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
    const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(wcAddRequisitionTableName,
        { date: 'date' }, maxDateWhereCluse,
        wcAddRequisitionDetailsTableName,
        `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`,
        `${wcAddRequisitionTableName}.id`)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let wcAddRequisitionDetailsWhereCluse = {};
        wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
        wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await wcAddRequisitionDetailsQueries.selectLatestPrice(wcAddRequisitionDetailsWhereCluse)
        sortedAsc[0].latest_price = latestPrice[0]?.price
        sortedAsc[0].latest_price_dollar = latestPrice[0]?.price_dollar
    } else {
        sortedAsc[0].latest_price = 0
        sortedAsc[0].latest_price_dollar = 0
    }
    return sortedAsc;
};

exports.selectInventoryDetails = async (fabricReport) => {
    let data = []

    let fabricWhereCluse = {};
    fabricWhereCluse[`${wcTableName}.is_deleted`] = 0;
    fabricWhereCluse[`${wcTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${wcTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${wcTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transportWdWcWhereCluse = {};
    transportWdWcWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transportWdWcWhereCluse[`${wcTableName}.is_active`] = 1;
    transportWdWcWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportFromBToAType;

    let manufacturingOutputWhereCluse = {};
    manufacturingOutputWhereCluse[`${wcTableName}.is_deleted`] = 0;
    manufacturingOutputWhereCluse[`${wcTableName}.is_active`] = 1;
    manufacturingOutputWhereCluse[`${wcTableName}.type`] = constantsPayloads.manufactruingType;

    let executeOrderWhereCluse = {};
    executeOrderWhereCluse[`${wcTableName}.is_deleted`] = 0;
    executeOrderWhereCluse[`${wcTableName}.is_active`] = 1;
    executeOrderWhereCluse[`${wcTableName}.type`] = constantsPayloads.executeOrderType;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${wcTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportBetweenType;

    let whereCluseArray = [
        fabricWhereCluse, reconciliationWhereCluse, 
        transportWdWcWhereCluse, manufacturingOutputWhereCluse,
        executeOrderWhereCluse, transitionBetweenWhWhereCluse
    ]

    // select warehousesFabricsConsigmentsManufacturing 
    const warehousesFabricsConsigmentsManufacturing = (fabricReport.isShowClosedBalances == 1) ? await wcQueries.selectStoredWarehouseAndFabricAndConsigmentManufacturing(whereCluseArray, 0) : await wcQueries.selectStoredWarehouseAndFabricAndConsigmentManufacturing(whereCluseArray)
    if (warehousesFabricsConsigmentsManufacturing[0] != null) {
        for (let i = 0; i < warehousesFabricsConsigmentsManufacturing.length; i++) {
            let warehousesFabricConsigmentManufacturing = warehousesFabricsConsigmentsManufacturing[i];
            let callArray = []

            // Select Max Added Date
            let maxDateWhereCluse = {};
            maxDateWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = warehousesFabricConsigmentManufacturing.fabric_id;
            maxDateWhereCluse[`${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`] = warehousesFabricConsigmentManufacturing.consigment_manufacturing_id;
            const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(wcAddRequisitionTableName,
                { date: 'date' }, maxDateWhereCluse,
                wcAddRequisitionDetailsTableName,
                `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`,
                `${wcAddRequisitionTableName}.id`)
            if (selectMaxDate[0] != null) {
                // Select Latest Price
                let wcAddRequisitionDetailsWhereCluse = {};
                wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = warehousesFabricConsigmentManufacturing.fabric_id;
                wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
                const latestPrice = await wcAddRequisitionDetailsQueries.selectLatestPrice(wcAddRequisitionDetailsWhereCluse)
                warehousesFabricConsigmentManufacturing.latest_price = latestPrice[0]?.price
                warehousesFabricConsigmentManufacturing.latest_price_dollar = latestPrice[0]?.price_dollar
            } else {
                warehousesFabricConsigmentManufacturing.latest_price = 0
                warehousesFabricConsigmentManufacturing.latest_price_dollar = 0
            }

            let manufacturingMaxDateWhereCluse = {};
            manufacturingMaxDateWhereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = warehousesFabricConsigmentManufacturing.fabric_id;
            const selectManufacturingMaxDate = await knex(wbManufacturingOutputTableName)
            .max({ date: 'date' })
            .innerJoin(wbManufacturingInputOutputTableName,
                `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`,
                `${wbManufacturingOutputTableName}.id`)
                .innerJoin(wbManufacturingRequisitionTableName,
                    `${wbManufacturingRequisitionTableName}.id`,
                    `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
            .where(manufacturingMaxDateWhereCluse)
            
            if (selectManufacturingMaxDate[0].date != null) {
                // Select Latest Manufacturing Price
                let wbManufacturingOutputWhereCluse = {};
                wbManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = warehousesFabricConsigmentManufacturing.fabric_id;
                wbManufacturingOutputWhereCluse[`${wbManufacturingRequisitionTableName}.date`] = selectManufacturingMaxDate[0]?.date;
                const latestManufacturingPrice = await wbManufacturingOutputQueries.selectLatestPrice(wbManufacturingOutputWhereCluse)
                warehousesFabricConsigmentManufacturing.latest_manufacturing_price = latestManufacturingPrice[0]?.price
                warehousesFabricConsigmentManufacturing.latest_manufacturing_price_dollar = latestManufacturingPrice[0]?.price_dollar
            } else {
                warehousesFabricConsigmentManufacturing.latest_manufacturing_price = 0
                warehousesFabricConsigmentManufacturing.latest_manufacturing_price_dollar = 0
            }

            // Get Sum Current Quantity Of warehousesFabricConsigmentManufacturing 
            // const sumCurrentQuantity = await waService.selectSumCurrentQuantityByYarnWa(warehousesFabricConsigmentManufacturing.id)
            // warehousesFabricConsigmentManufacturing.current_quantity = sumCurrentQuantity[0].current_quantity

            data.push(warehousesFabricConsigmentManufacturing)

            callArray.push(wcAddRequisitionDetailsQueries.selectDetailsByWarehouseByFabricByConsigmentManufacturing(
                warehousesFabricConsigmentManufacturing.warehouse_id, warehousesFabricConsigmentManufacturing.fabric_id, warehousesFabricConsigmentManufacturing.consigment_manufacturing_id
            ))
            callArray.push(wcSellRequisitionDetailsQueries.selectDetailsByWarehouseByFabricByConsigmentManufacturing(
                warehousesFabricConsigmentManufacturing.warehouse_id, warehousesFabricConsigmentManufacturing.fabric_id, warehousesFabricConsigmentManufacturing.consigment_manufacturing_id
            ))
            callArray.push(wcReturnRequisitionDetailsQueries.selectDetailsByWarehouseByFabricByConsigmentManufacturing(
                warehousesFabricConsigmentManufacturing.warehouse_id, warehousesFabricConsigmentManufacturing.fabric_id, warehousesFabricConsigmentManufacturing.consigment_manufacturing_id
            ))
            callArray.push(wcReconciliationRequisitionDetailsQueries.selectDetailsByWarehouseByFabricByConsigmentManufacturing(
                warehousesFabricConsigmentManufacturing.warehouse_id, warehousesFabricConsigmentManufacturing.fabric_id, warehousesFabricConsigmentManufacturing.consigment_manufacturing_id
            ))
            callArray.push(wdTransportWcWdDetailsQueries.selectDetailsByWarehouseByFabricByConsigmentManufacturing(
                warehousesFabricConsigmentManufacturing.warehouse_id, warehousesFabricConsigmentManufacturing.fabric_id, warehousesFabricConsigmentManufacturing.consigment_manufacturing_id
            ))
            callArray.push(wdTransportRequisitionWdWcDetailsQueries.selectDetailsByWarehouseByFabricByConsigmentManufacturing(
                warehousesFabricConsigmentManufacturing.warehouse_id, warehousesFabricConsigmentManufacturing.fabric_id, warehousesFabricConsigmentManufacturing.consigment_manufacturing_id
            ))
            callArray.push(wbManufacturingOutputQueries.selectDetailsByWarehouseByFabricByConsigmentManufacturing(
                warehousesFabricConsigmentManufacturing.warehouse_id, warehousesFabricConsigmentManufacturing.fabric_id, warehousesFabricConsigmentManufacturing.consigment_manufacturing_id
            ))
            callArray.push(wcExecuteOrderRequisitionDetailsQueries.selectFromWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing(
                warehousesFabricConsigmentManufacturing.warehouse_id, warehousesFabricConsigmentManufacturing.fabric_id, warehousesFabricConsigmentManufacturing.consigment_manufacturing_id
            ))
            callArray.push(wcExecuteOrderRequisitionDetailsQueries.selectToWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing(
                warehousesFabricConsigmentManufacturing.warehouse_id, warehousesFabricConsigmentManufacturing.fabric_id, warehousesFabricConsigmentManufacturing.consigment_manufacturing_id
            ))
            callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing(
                warehousesFabricConsigmentManufacturing.warehouse_id, warehousesFabricConsigmentManufacturing.fabric_id, warehousesFabricConsigmentManufacturing.consigment_manufacturing_id
            ))
            callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing(
                warehousesFabricConsigmentManufacturing.warehouse_id, warehousesFabricConsigmentManufacturing.fabric_id, warehousesFabricConsigmentManufacturing.consigment_manufacturing_id
            ))
            const requisitions = await Promise.all(callArray)
            const sortedAsc = [...requisitions[0], ...requisitions[1],
            ...requisitions[2], ...requisitions[3], ...requisitions[4],
            ...requisitions[5], ...requisitions[6], ...requisitions[7],
            ...requisitions[8], ...requisitions[9], ...requisitions[10]
        ].sort(
                (objA, objB) => moment(objA.date) - moment(objB.date)
            );
            data[i].details = sortedAsc

        }
    }

    return data;
};

exports.selectInventoryDetailsByWarehouseByFabricByConsigmentManufacturing = async (fabricId, warehouseId, consigmentManufacturingId) => {
    let callArray = []

    callArray.push(wcAddRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId))
    callArray.push(wcSellRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId))
    callArray.push(wcReturnRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId))
    callArray.push(wcReconciliationRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId))
    callArray.push(wdTransportWcWdDetailsQueries.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId))
    callArray.push(wdTransportRequisitionWdWcDetailsQueries.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId))
    callArray.push(wbManufacturingOutputQueries.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId))
    callArray.push(wcExecuteOrderRequisitionDetailsQueries.selectFromWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId))
    callArray.push(wcExecuteOrderRequisitionDetailsQueries.selectToWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId))
    callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId))
    callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId))
    const requisitions = await Promise.all(callArray)
    let sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5], ...requisitions[6], ...requisitions[7],
    ...requisitions[8], ...requisitions[9], ...requisitions[10]
].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
    maxDateWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
    maxDateWhereCluse[`${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
    const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(wcAddRequisitionTableName,
        { date: 'date' }, maxDateWhereCluse,
        wcAddRequisitionDetailsTableName,
        `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`,
        `${wcAddRequisitionTableName}.id`)
    if (selectMaxDate[0].date != null) {
        // Select Latest Price
        let wcAddRequisitionDetailsWhereCluse = {};
        wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
        wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await wcAddRequisitionDetailsQueries.selectLatestPrice(wcAddRequisitionDetailsWhereCluse)
        sortedAsc[0].latest_price = (latestPrice[0] != null) ? latestPrice[0].price : 0
        sortedAsc[0].latest_price_dollar = (latestPrice[0] != null) ? latestPrice[0].price_dollar : 0
    } else {
        if(sortedAsc.length > 0) {
            sortedAsc[0].latest_price = 0
            sortedAsc[0].latest_price_dollar = 0
        } 
        // else {
        //     sortedAsc = [...sortedAsc, ...[{latest_price: 0}]] 
        // }
    }
    return sortedAsc;
};

exports.selectPriceWc = async (fabricId) => {
    let callArray = []

    callArray.push(wcAddRequisitionDetailsQueries.selectPriceByFabricId(fabricId))
    callArray.push(wcSellRequisitionDetailsQueries.selectPriceByFabricId(fabricId))
    callArray.push(wcReturnRequisitionDetailsQueries.selectPriceByFabricId(fabricId))
    callArray.push(wcReconciliationRequisitionDetailsQueries.selectPriceByFabricId(fabricId))
    callArray.push(wdTransportWcWdDetailsQueries.selectPriceByFabricId(fabricId))
    callArray.push(wdTransportRequisitionWdWcDetailsQueries.selectPriceByFabricId(fabricId))
    callArray.push(wbManufacturingOutputQueries.selectPriceByFabricId(fabricId))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5], ...requisitions[6]
].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
    maxDateWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
    const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(wcAddRequisitionTableName,
        { date: 'date' }, maxDateWhereCluse,
        wcAddRequisitionDetailsTableName,
        `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`,
        `${wcAddRequisitionTableName}.id`)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let wcAddRequisitionDetailsWhereCluse = {};
        wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
        wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await wcAddRequisitionDetailsQueries.selectLatestPrice(wcAddRequisitionDetailsWhereCluse)
        if(latestPrice[0] != null ) {
            sortedAsc[0].latest_price = latestPrice[0].price
            sortedAsc[0].latest_price_dollar = latestPrice[0].price_dollar
        } else {
            if(sortedAsc.length > 0) {
                sortedAsc[0].latest_price = 0
                sortedAsc[0].latest_price_dollar = 0
            } 
        }
    } else {
        sortedAsc[0].latest_price = 0
        sortedAsc[0].latest_price_dollar = 0
    }
    return sortedAsc;
};

exports.selectPriceByFabricByConsigmentManufacturingInWc = async (fabricId, consigmentManufacturingId) => {
    let callArray = []
    
    callArray.push(wcAddRequisitionDetailsQueries.selectPriceByFabricIdByConsigmentManufacturingId(fabricId, consigmentManufacturingId))
    callArray.push(wcSellRequisitionDetailsQueries.selectPriceByFabricIdByConsigmentManufacturingId(fabricId, consigmentManufacturingId))
    callArray.push(wcReturnRequisitionDetailsQueries.selectPriceByFabricIdByConsigmentManufacturingId(fabricId, consigmentManufacturingId))
    callArray.push(wcReconciliationRequisitionDetailsQueries.selectPriceByFabricIdByConsigmentManufacturingId(fabricId, consigmentManufacturingId))
    callArray.push(wdTransportWcWdDetailsQueries.selectPriceByFabricIdByConsigmentManufacturingId(fabricId, consigmentManufacturingId))
    callArray.push(wdTransportRequisitionWdWcDetailsQueries.selectPriceByFabricIdByConsigmentManufacturingId(fabricId, consigmentManufacturingId))
    callArray.push(wbManufacturingOutputQueries.selectPriceByFabricIdByConsigmentManufacturingId(fabricId, consigmentManufacturingId))
    const requisitions = await Promise.all(callArray)
    let sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5], ...requisitions[6]
].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
    maxDateWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
    const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(wcAddRequisitionTableName,
        { date: 'date' }, maxDateWhereCluse,
        wcAddRequisitionDetailsTableName,
        `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`,
        `${wcAddRequisitionTableName}.id`)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let wcAddRequisitionDetailsWhereCluse = {};
        wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
        wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await wcAddRequisitionDetailsQueries.selectLatestPrice(wcAddRequisitionDetailsWhereCluse)
        if(latestPrice[0] != null ) {
            // sortedAsc[0].latest_price = latestPrice[0].price
            sortedAsc = [...sortedAsc, ...[{latest_price: latestPrice[0].price, latest_price_dollar: latestPrice[0].price_dollar}]] 
        } else {
            sortedAsc = [...sortedAsc, ...[{latest_price: 0, latest_price_dollar: 0}]] 
        }

        // Select Max Added Date
    let maxDateManufacturingOutputWhereCluse = {};
    maxDateManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;
    const selectManufacturingOutputMaxDate = await generalQueries.selectMaxValueWith2JoinCondition(wbManufacturingOutputTableName,
        { date: 'date' }, maxDateManufacturingOutputWhereCluse,
        wbManufacturingInputOutputTableName,
        `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`,
        `${wbManufacturingOutputTableName}.id`,
        wbManufacturingRequisitionTableName,
        `${wbManufacturingRequisitionTableName}.id`,
        `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`
        )
    if (selectManufacturingOutputMaxDate[0] != null) {
        // Select Latest Manufacturing Output Price
        let wbManufacturingOutputWhereCluse = {};
        wbManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;
        wbManufacturingOutputWhereCluse[`${wbManufacturingRequisitionTableName}.date`] = selectManufacturingOutputMaxDate[0]?.date;
        const latestManufacturingOutputPrice = await wbManufacturingOutputQueries.selectLatestPrice(wbManufacturingOutputWhereCluse)
        if (latestManufacturingOutputPrice[0] != null) {
            sortedAsc[0].latest_manufacturing_price = latestManufacturingOutputPrice[0]?.price
            sortedAsc[0].latest_manufacturing_price_dollar = latestManufacturingOutputPrice[0]?.price_dollar
        } else {
            sortedAsc[0].latest_manufacturing_price= 0
            sortedAsc[0].latest_manufacturing_price_dollar = 0
        }
    }

    } else {
        sortedAsc = [...sortedAsc, ...[{latest_price: 0, latest_price_dollar: 0}]] 
    }
    return sortedAsc;
};

exports.purchasesByFabric = async (fabricId) => {
    let whereCluse = {};
    whereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabricId;
    const results = await wcReportQueries.purchasesYarns(whereCluse, "date");
    return results;
};

exports.purchasesBySupplier = async (supplierId) => {
    let whereCluse = {};
    whereCluse[`${wcAddRequisitionTableName}.supplier_id`] = supplierId;
    const results = await wcReportQueries.purchasesYarns(whereCluse, "fabric_id");
    return results;
};

exports.purchasesBySuppliers = async () => {

    const suppliers = await bussinessmanService.selectSuppliersBoughtFromWa()
    for (let i = 0; i < suppliers.length; i++) {
        const supplier = suppliers[i];

        let whereCluse = {};
        whereCluse[`${wcAddRequisitionTableName}.supplier_id`] = supplier.id;
        const results = await wcReportQueries.purchasesBySuppliers(whereCluse);

        if (results[0] != null) {
            let data = Object.assign(suppliers[i], results[0]);
            suppliers[i] = data
        }
    }
    suppliers.sort(function (a, b) { return b.quantity - a.quantity });
    return suppliers
};

exports.manufacturingReportByFabric = async (fabricId) => {

    const manufacturingReportByFabricResult = await wcReportQueries.manufacturingReportByFabric(fabricId)
    return manufacturingReportByFabricResult
};

exports.selectInventoryTotalByDate = async (bodyPaylod) => {
    let callArray = []

    callArray.push(wcAddRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPaylod))
    callArray.push(wcSellRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPaylod))
    callArray.push(wcReturnRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPaylod))
    callArray.push(wcReconciliationRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPaylod))
    callArray.push(wdTransportWcWdDetailsQueries.selectTotalDetailsByDate(bodyPaylod))
    callArray.push(wdTransportRequisitionWdWcDetailsQueries.selectTotalDetailsByDate(bodyPaylod))
    callArray.push(wbManufacturingOutputQueries.selectTotalDetailsByDate(bodyPaylod))
    callArray.push(wcExecuteOrderRequisitionDetailsQueries.selectFromWarehouseTotalDetailsByDate(bodyPaylod))
    callArray.push(wcExecuteOrderRequisitionDetailsQueries.selectToWarehouseTotalDetailsByDate(bodyPaylod))
    callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseTotalDetailsByDate(bodyPaylod))
    callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseTotalDetailsByDate(bodyPaylod))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5], ...requisitions[6], ...requisitions[7],
    ...requisitions[8], ...requisitions[9], ...requisitions[10]
].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );
    return sortedAsc;
};


exports.inquireFabricAvilabilityReportWc = async (fabric) => {
    
    let warehouseWhereCluse = {};
    warehouseWhereCluse[`${warehouseTableName}.is_stock`] = 1;
    warehouseWhereCluse[`${warehouseTableName}.is_deleted`] = 0;
    warehouseWhereCluse[`${warehouseTableName}.is_active`] = 1;


    let wcFabricWhereCluse = {};
    wcFabricWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    wcFabricWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wcFabricWhereCluse[`${fabricTableName}.is_active`] = 1;
    wcFabricWhereCluse[`${wcTableName}.is_deleted`] = 0;
    wcFabricWhereCluse[`${wcTableName}.is_active`] = 1;

    let wcReconciliationWhereCluse = {};
    wcReconciliationWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    wcReconciliationWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wcReconciliationWhereCluse[`${fabricTableName}.is_active`] = 1;
    wcReconciliationWhereCluse[`${wcTableName}.is_deleted`] = 0;
    wcReconciliationWhereCluse[`${wcTableName}.is_active`] = 1;
    wcReconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let wcTransportWdWcWhereCluse = {};
    wcTransportWdWcWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    wcTransportWdWcWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wcTransportWdWcWhereCluse[`${fabricTableName}.is_active`] = 1;
    wcTransportWdWcWhereCluse[`${wcTableName}.is_deleted`] = 0;
    wcTransportWdWcWhereCluse[`${wcTableName}.is_active`] = 1;
    wcTransportWdWcWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportFromBToAType;

    let WcManufacturingOutputWhereCluse = {};
    WcManufacturingOutputWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    WcManufacturingOutputWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    WcManufacturingOutputWhereCluse[`${fabricTableName}.is_active`] = 1;
    WcManufacturingOutputWhereCluse[`${wcTableName}.is_deleted`] = 0;
    WcManufacturingOutputWhereCluse[`${wcTableName}.is_active`] = 1;
    WcManufacturingOutputWhereCluse[`${wcTableName}.type`] = constantsPayloads.manufactruingType;

    let executeOrderWhereCluse = {};
    executeOrderWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    executeOrderWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    executeOrderWhereCluse[`${fabricTableName}.is_active`] = 1;
    executeOrderWhereCluse[`${wcTableName}.is_deleted`] = 0;
    executeOrderWhereCluse[`${wcTableName}.is_active`] = 1;
    executeOrderWhereCluse[`${wcTableName}.type`] = constantsPayloads.executeOrderType;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    transitionBetweenWhWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${fabricTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${wcTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportBetweenType;

    let wcWhereCluseArray = [
        wcFabricWhereCluse, wcReconciliationWhereCluse, 
        wcTransportWdWcWhereCluse, WcManufacturingOutputWhereCluse, 
        warehouseWhereCluse, executeOrderWhereCluse,
        transitionBetweenWhWhereCluse
    ]

    // select wc Fabrics 
    let wcFabrics = await fabricQueries.selectStoredWcFabricsForInquireFabricAvilability(wcWhereCluseArray)
    return wcFabrics
};

exports.inquireFabricAvilabilityTotalReportWc = async (fabric) => {
    
    let warehouseWhereCluse = {};
    warehouseWhereCluse[`${warehouseTableName}.is_stock`] = 1;
    warehouseWhereCluse[`${warehouseTableName}.is_deleted`] = 0;
    warehouseWhereCluse[`${warehouseTableName}.is_active`] = 1;

    let wcFabricWhereCluse = {};
    wcFabricWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    wcFabricWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wcFabricWhereCluse[`${fabricTableName}.is_active`] = 1;
    wcFabricWhereCluse[`${wcTableName}.is_deleted`] = 0;
    wcFabricWhereCluse[`${wcTableName}.is_active`] = 1;

    let wcReconciliationWhereCluse = {};
    wcReconciliationWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    wcReconciliationWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wcReconciliationWhereCluse[`${fabricTableName}.is_active`] = 1;
    wcReconciliationWhereCluse[`${wcTableName}.is_deleted`] = 0;
    wcReconciliationWhereCluse[`${wcTableName}.is_active`] = 1;
    wcReconciliationWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let wcTransportWdWcWhereCluse = {};
    wcTransportWdWcWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    wcTransportWdWcWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    wcTransportWdWcWhereCluse[`${fabricTableName}.is_active`] = 1;
    wcTransportWdWcWhereCluse[`${wcTableName}.is_deleted`] = 0;
    wcTransportWdWcWhereCluse[`${wcTableName}.is_active`] = 1;
    wcTransportWdWcWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportFromBToAType;

    let WcManufacturingOutputWhereCluse = {};
    WcManufacturingOutputWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    WcManufacturingOutputWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    WcManufacturingOutputWhereCluse[`${fabricTableName}.is_active`] = 1;
    WcManufacturingOutputWhereCluse[`${wcTableName}.is_deleted`] = 0;
    WcManufacturingOutputWhereCluse[`${wcTableName}.is_active`] = 1;
    WcManufacturingOutputWhereCluse[`${wcTableName}.type`] = constantsPayloads.manufactruingType;

    let executeOrderWhereCluse = {};
    executeOrderWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    executeOrderWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    executeOrderWhereCluse[`${fabricTableName}.is_active`] = 1;
    executeOrderWhereCluse[`${wcTableName}.is_deleted`] = 0;
    executeOrderWhereCluse[`${wcTableName}.is_active`] = 1;
    executeOrderWhereCluse[`${wcTableName}.type`] = constantsPayloads.executeOrderType;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${fabricTableName}.id`] = fabric.fabricId;
    transitionBetweenWhWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${fabricTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${wcTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportBetweenType;


    let wcWhereCluseArray = [
        wcFabricWhereCluse, wcReconciliationWhereCluse, 
        wcTransportWdWcWhereCluse, WcManufacturingOutputWhereCluse, 
        warehouseWhereCluse, executeOrderWhereCluse,
        transitionBetweenWhWhereCluse
    ]

    // select wc Fabrics 
    let wcFabrics = await fabricQueries.selectStoredWcFabricsForInquireFabricAvilabilityTotal(wcWhereCluseArray)
    return wcFabrics
};


exports.fabricsForOrderWc = async (dyeingOrderRequisitions) => {
    let data = []

    const myFirstPromise = new Promise(async (resolve, reject) => {
        for (let i = 0; i < dyeingOrderRequisitions.length; i++) {
            const element = dyeingOrderRequisitions[i];

            let calcQuantity = element.quantity

            neededFabricQuantity = parseFloat(((calcQuantity / (1 - (constants.notZero(element.wasteRatio) / 100)))).toFixed(3))

            data.push({
                id: element.fabricId,
                name: element.fabric_name,
                code: element.fabric_code,
                needed_quantity: neededFabricQuantity,
            })
        }

        resolve(data); // Yay! Everything went well!

    })
    return await myFirstPromise

}