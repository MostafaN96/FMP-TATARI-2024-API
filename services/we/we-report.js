const moment = require("moment")

// Config
const knex = require("../../db/config/connection").getConnection();

// Service
const weReportQueries = require("../../db/queries/we/we-report");
const wdReportService = require("../wd/wd-report");
const wcReportService = require("../wc/wc-report");
const fabricYarnsService = require("../general/fabric-yarns");
const wbReportService = require("../wb/wb-report");
const waReportService = require("../wa/wa-report");
const bussinessmanService = require("../../services/general/bussinessman");
const ordersRequisitionsService = require("../../services/general/orders-requisitions");
const wbTransportWaWbRequisitionDetailsService = require("../../services/wb/wb-transport-wa-wb-details");
const wbManufacturingOutputService = require("../../services/wb/wb-manufacturing-output");
const wdTransportRequisitionWcWdDetailsService = require("../wd/wd-transport-wc-wd-details");

// Queries
const fabricQueries = require("../../db/queries/general/fabric");
const weQueries = require("../../db/queries/we/we");
const generalQueries = require("../../db/queries/general/general");
const wdDyeingRequisitionDetailsQueries = require("../../db/queries/wd/wd-dyeing-requisition-details");
const weAddRequisitionDetailsQueries = require("../../db/queries/we/we-add-requisition-details");
const weSellRequisitionDetailsQueries = require("../../db/queries/we/we-sell-requisition-details");
const weReturnRequisitionDetailsQueries = require("../../db/queries/we/we-return-requisition-details");
const weReturnSellRequisitionDetailsQueries = require("../../db/queries/we/we-return-sell-requisition-details");
const weReconciliationRequisitionDetailsQueries = require("../../db/queries/we/we-reconciliation-requisition-details");
const wdDyeingOrderRequisitionDetailsQueries = require("../../db/queries/wd/wd-dyeing-order-requisition-details");
const weDyedFabricOrderRequisitionDetailsQueries = require("../../db/queries/we/we-dyed-fabric-order-requisition-details");
const weTransitionBetweenWHRequisitionDetailsQueries = require("../../db/queries/we/we-transition-between-wh-requisition-details");
const weExecuteOrderRequisitionDetailsQueries = require("../../db/queries/we/we-execute-order-requisition-details");

// Util
const constantsPayloads = require("../../util/constants-payloads");
const constants = require("../../util/constants");
const { weTableName, fabricTableName, wdDyeingRequisitionDetailsTableName,
    weReconciliationRequisitionDetailsTableName, weAddRequisitionTableName,
    weAddRequisitionDetailsTableName, weReturnRequisitionDetailsTableName,
    weReturnSellRequisitionDetailsTableName,
    wdDyeingRequisitionTableName,
    anointedColorsPricesTableName,
    colorTableName,
    warehouseTableName,
    wdDyeingOrderRequisitionDetailsTableName,
    weDyedFabricOrderRequisitionDetailsTableName,
    weTransitionBetweenWHRequisitionDetailsTableName,
    waExecuteOrderRequisitionTableName,
    waExecuteOrderRequisitionDetailsTableName,
    ordersRequisitionsTableName,
    weDyedFabricOrderRequisitionTableName,
    wbTransportWaWbDetailsTableName,
    wbManufacturingOutputTableName,
    wdTransportWcWdDetailsTableName
} = require("../../util/database-tables-name");

exports.selectInventoryTotal = async (fabricReport) => {
    let data = []

    let fabricWhereCluse = {};
    fabricWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    fabricWhereCluse[`${fabricTableName}.is_active`] = 1;
    fabricWhereCluse[`${weTableName}.is_deleted`] = 0;
    fabricWhereCluse[`${weTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${fabricTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${weTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${weTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let dyeingWhereCluse = {};
    dyeingWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    dyeingWhereCluse[`${fabricTableName}.is_active`] = 1;
    dyeingWhereCluse[`${weTableName}.is_deleted`] = 0;
    dyeingWhereCluse[`${weTableName}.is_active`] = 1;
    dyeingWhereCluse[`${weTableName}.type`] = constantsPayloads.dyeingType;

    let transitionBetweenToWHWhereCluse = {};
    transitionBetweenToWHWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    transitionBetweenToWHWhereCluse[`${fabricTableName}.is_active`] = 1;
    transitionBetweenToWHWhereCluse[`${weTableName}.is_deleted`] = 0;
    transitionBetweenToWHWhereCluse[`${weTableName}.is_active`] = 1;
    transitionBetweenToWHWhereCluse[`${weTableName}.type`] = constantsPayloads.transportBetweenType;

    let executeOrderWhereCluse = {};
    executeOrderWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    executeOrderWhereCluse[`${fabricTableName}.is_active`] = 1;
    executeOrderWhereCluse[`${weTableName}.is_deleted`] = 0;
    executeOrderWhereCluse[`${weTableName}.is_active`] = 1;
    executeOrderWhereCluse[`${weTableName}.type`] = constantsPayloads.executeOrderType;

    let returnSellWhereCluse = {};
    returnSellWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    returnSellWhereCluse[`${fabricTableName}.is_active`] = 1;
    returnSellWhereCluse[`${weTableName}.is_deleted`] = 0;
    returnSellWhereCluse[`${weTableName}.is_active`] = 1;
    returnSellWhereCluse[`${weTableName}.type`] = constantsPayloads.returnSellType;

    let whereCluseArray = [fabricWhereCluse, reconciliationWhereCluse, 
        dyeingWhereCluse, transitionBetweenToWHWhereCluse, executeOrderWhereCluse,
        returnSellWhereCluse
    ]

    // select fabrics 
    const fabrics = (fabricReport.isShowClosedBalances == 1) ? await fabricQueries.selectStoredWeFabrics(whereCluseArray, 0) : await fabricQueries.selectStoredWeFabrics(whereCluseArray)
    if (fabrics[0] != null) {
        for (let i = 0; i < fabrics.length; i++) {
            let fabric = fabrics[i];
            let callArray = []

            // Select Max Added Date
            let maxDateWhereCluse = {};
            maxDateWhereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = fabric.dyed_fabric_id;
            const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(weAddRequisitionTableName,
                { date: 'date' }, maxDateWhereCluse,
                weAddRequisitionDetailsTableName,
                `${weAddRequisitionDetailsTableName}.we_add_requisition_id`,
                `${weAddRequisitionTableName}.id`)
            if (selectMaxDate[0] != null) {
                // Select Latest Price
                let wcAddRequisitionDetailsWhereCluse = {};
                wcAddRequisitionDetailsWhereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = fabric.dyed_fabric_id;
                wcAddRequisitionDetailsWhereCluse[`${weAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
                const latestPrice = await weAddRequisitionDetailsQueries.selectLatestPrice(wcAddRequisitionDetailsWhereCluse)
                if (latestPrice[0] != null) {
                    fabric.latest_price = latestPrice[0]?.price
                    fabric.latest_price_dollar = latestPrice[0]?.price_dollar
                } else {
                    fabric.latest_price = 0
                    fabric.latest_price_dollar = 0
                }
            } else {
                fabric.latest_price = 0
                fabric.latest_price_dollar = 0
            }
            let dyeingMaxDateWhereCluse = {};
            dyeingMaxDateWhereCluse[`${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`] = fabric.dyed_fabric_id;
            const selectDyeingMaxDate = await knex(wdDyeingRequisitionDetailsTableName)
                .max({ date: 'date' })
                .innerJoin(wdDyeingRequisitionTableName,
                    `${wdDyeingRequisitionTableName}.id`,
                    `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
                .where(dyeingMaxDateWhereCluse)

            if (selectDyeingMaxDate[0].date != null) {
                // Select Latest Manufacturing Price
                let wdDyeingWhereCluse = {};
                wdDyeingWhereCluse[`${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`] = fabric.dyed_fabric_id;
                wdDyeingWhereCluse[`${wdDyeingRequisitionTableName}.date`] = selectDyeingMaxDate[0]?.date;
                const latestDyeingPrice = await wdDyeingRequisitionDetailsQueries.selectLatestPrice(wdDyeingWhereCluse)
                if (latestDyeingPrice[0] != null) {
                    fabric.latest_dyeing_price = latestDyeingPrice[0]?.price
                    fabric.latest_dyeing_price_dollar = latestDyeingPrice[0]?.price_dollar
                } else {
                    fabric.latest_dyeing_price = 0
                    fabric.latest_dyeing_price_dollar = 0
                }
            } else {
                fabric.latest_dyeing_price = 0
                fabric.latest_dyeing_price_dollar = 0
            }
            // Get Sum Current Quantity Of fabric 
            // const sumCurrentQuantity = await waService.selectSumCurrentQuantityByYarnWa(fabric.dyed_fabric_id)
            // fabric.current_quantity = sumCurrentQuantity[0].current_quantity

            data.push(fabric)

            callArray.push(weAddRequisitionDetailsQueries.selectTotalByFabricId(fabric.dyed_fabric_id))
            callArray.push(weSellRequisitionDetailsQueries.selectTotalByFabricId(fabric.dyed_fabric_id))
            callArray.push(weReturnRequisitionDetailsQueries.selectTotalByFabricId(fabric.dyed_fabric_id))
            callArray.push(weReconciliationRequisitionDetailsQueries.selectTotalByFabricId(fabric.dyed_fabric_id))
            callArray.push(wdDyeingRequisitionDetailsQueries.selectTotalByFabricIdForWe(fabric.dyed_fabric_id))
            callArray.push(weReturnSellRequisitionDetailsQueries.selectTotalByFabricId(fabric.dyed_fabric_id))
            callArray.push(weTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseTotalByFabricId(fabric.dyed_fabric_id))
            callArray.push(weTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseTotalByFabricId(fabric.dyed_fabric_id))
            callArray.push(weExecuteOrderRequisitionDetailsQueries.selectFromTotalByFabricId(fabric.dyed_fabric_id))
            callArray.push(weExecuteOrderRequisitionDetailsQueries.selectToTotalByFabricId(fabric.dyed_fabric_id))
            const requisitions = await Promise.all(callArray)
            const sortedAsc = [...requisitions[0], ...requisitions[1],
            ...requisitions[2], ...requisitions[3], ...requisitions[4],
            ...requisitions[5], ...requisitions[6], ...requisitions[7],
            ...requisitions[8], ...requisitions[9]
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

    callArray.push(weAddRequisitionDetailsQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(weSellRequisitionDetailsQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(weReturnRequisitionDetailsQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(weReconciliationRequisitionDetailsQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(wdDyeingRequisitionDetailsQueries.selectTotalDetailsByFabricIdForWe(fabricId))
    callArray.push(weReturnSellRequisitionDetailsQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(weTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseTotalDetailsByFabricId(fabricId))
    callArray.push(weTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseTotalDetailsByFabricId(fabricId))
    callArray.push(weExecuteOrderRequisitionDetailsQueries.selectFromTotalDetailsByFabricId(fabricId))
    callArray.push(weExecuteOrderRequisitionDetailsQueries.selectToTotalDetailsByFabricId(fabricId))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5], ...requisitions[6], ...requisitions[7],
    ...requisitions[8], ...requisitions[9]
].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
    maxDateWhereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
    const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(weAddRequisitionTableName,
        { date: 'date' }, maxDateWhereCluse,
        weAddRequisitionDetailsTableName,
        `${weAddRequisitionDetailsTableName}.we_add_requisition_id`,
        `${weAddRequisitionTableName}.id`)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let wcAddRequisitionDetailsWhereCluse = {};
        wcAddRequisitionDetailsWhereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
        wcAddRequisitionDetailsWhereCluse[`${weAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await weAddRequisitionDetailsQueries.selectLatestPrice(wcAddRequisitionDetailsWhereCluse)
        if (latestPrice[0] != null) {
            sortedAsc[0].latest_price = latestPrice[0]?.price
            sortedAsc[0].latest_price_dollar = latestPrice[0]?.price_dollar
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

exports.selectInventoryDetails = async (fabricReport) => {
    let data = []

    let fabricWhereCluse = {};
    fabricWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    fabricWhereCluse[`${fabricTableName}.is_active`] = 1;
    fabricWhereCluse[`${weTableName}.is_deleted`] = 0;
    fabricWhereCluse[`${weTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${weTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${weTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let dyeingWhereCluse = {};
    dyeingWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    dyeingWhereCluse[`${fabricTableName}.is_active`] = 1;
    dyeingWhereCluse[`${weTableName}.is_deleted`] = 0;
    dyeingWhereCluse[`${weTableName}.is_active`] = 1;
    dyeingWhereCluse[`${weTableName}.type`] = constantsPayloads.dyeingType;

    let returnSellWhereCluse = {};
    returnSellWhereCluse[`${weTableName}.is_deleted`] = 0;
    returnSellWhereCluse[`${weTableName}.is_active`] = 1;
    returnSellWhereCluse[`${weTableName}.type`] = constantsPayloads.returnSellType;

    let transitionBetweenToWHWhereCluse = {};
    transitionBetweenToWHWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    transitionBetweenToWHWhereCluse[`${fabricTableName}.is_active`] = 1;
    transitionBetweenToWHWhereCluse[`${weTableName}.is_deleted`] = 0;
    transitionBetweenToWHWhereCluse[`${weTableName}.is_active`] = 1;
    transitionBetweenToWHWhereCluse[`${weTableName}.type`] = constantsPayloads.transportBetweenType;

    let executeOrderWhereCluse = {};
    executeOrderWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    executeOrderWhereCluse[`${fabricTableName}.is_active`] = 1;
    executeOrderWhereCluse[`${weTableName}.is_deleted`] = 0;
    executeOrderWhereCluse[`${weTableName}.is_active`] = 1;
    executeOrderWhereCluse[`${weTableName}.type`] = constantsPayloads.executeOrderType;

    let whereCluseArray = [fabricWhereCluse, reconciliationWhereCluse, dyeingWhereCluse, 
        returnSellWhereCluse, transitionBetweenToWHWhereCluse, executeOrderWhereCluse
    ]

    // select warehousesFabrics 
    const warehousesFabrics = (fabricReport.isShowClosedBalances == 1) ? await weQueries.selectStoredWarehouseAndFabricForReport(whereCluseArray, 0) : await weQueries.selectStoredWarehouseAndFabricForReport(whereCluseArray)
    if (warehousesFabrics[0] != null) {
        for (let i = 0; i < warehousesFabrics.length; i++) {
            let warehousesFabric = warehousesFabrics[i];
            let callArray = []

            // Select Max Added Date
            let maxDateWhereCluse = {};
            maxDateWhereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = warehousesFabric.dyed_fabric_id;
            const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(weAddRequisitionTableName,
                { date: 'date' }, maxDateWhereCluse,
                weAddRequisitionDetailsTableName,
                `${weAddRequisitionDetailsTableName}.we_add_requisition_id`,
                `${weAddRequisitionTableName}.id`)
            if (selectMaxDate[0] != null) {
                // Select Latest Price
                let wcAddRequisitionDetailsWhereCluse = {};
                wcAddRequisitionDetailsWhereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = warehousesFabric.dyed_fabric_id;
                wcAddRequisitionDetailsWhereCluse[`${weAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
                const latestPrice = await weAddRequisitionDetailsQueries.selectLatestPrice(wcAddRequisitionDetailsWhereCluse)
                if (latestPrice[0] != null) {
                    warehousesFabric.latest_price = latestPrice[0]?.price
                    warehousesFabric.latest_price_dollar = latestPrice[0]?.price_dollar
                } else {
                    warehousesFabric.latest_price = 0
                    warehousesFabric.latest_price_dollar = 0
                }
            } else {
                warehousesFabric.latest_price = 0
                warehousesFabric.latest_price_dollar = 0
            }

            let dyeingMaxDateWhereCluse = {};
            dyeingMaxDateWhereCluse[`${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`] = warehousesFabric.dyed_fabric_id;
            const selectDyeingMaxDate = await knex(wdDyeingRequisitionDetailsTableName)
                .max({ date: 'date' })
                .innerJoin(wdDyeingRequisitionTableName,
                    `${wdDyeingRequisitionTableName}.id`,
                    `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
                .where(dyeingMaxDateWhereCluse)

            if (selectDyeingMaxDate[0].date != null) {
                // Select Latest Manufacturing Price
                let wdDyeingWhereCluse = {};
                wdDyeingWhereCluse[`${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`] = warehousesFabric.dyed_fabric_id;
                wdDyeingWhereCluse[`${wdDyeingRequisitionTableName}.date`] = selectDyeingMaxDate[0]?.date;
                const latestDyeingPrice = await wdDyeingRequisitionDetailsQueries.selectLatestPrice(wdDyeingWhereCluse)
                if (latestDyeingPrice[0] != null) {
                    warehousesFabric.latest_dyeing_price = latestDyeingPrice[0]?.price
                    warehousesFabric.latest_dyeing_price_dollar = latestDyeingPrice[0]?.price_dollar
                } else {
                    warehousesFabric.latest_dyeing_price = 0
                    warehousesFabric.latest_dyeing_price_dollar = 0
                }
            } else {
                warehousesFabric.latest_dyeing_price = 0
                warehousesFabric.latest_dyeing_price_dollar = 0
            }


            // Get Sum Current Quantity Of warehousesFabric
            // const sumCurrentQuantity = await waService.selectSumCurrentQuantityByYarnWa(warehousesFabricConsigmentManufacturing.id)
            // warehousesFabric.current_quantity = sumCurrentQuantity[0].current_quantity

            data.push(warehousesFabric)

            callArray.push(weAddRequisitionDetailsQueries.selectDetailsByWarehouseByFabric(
                warehousesFabric.warehouse_id, warehousesFabric.dyed_fabric_id
            ))
            callArray.push(weSellRequisitionDetailsQueries.selectDetailsByWarehouseByFabric(
                warehousesFabric.warehouse_id, warehousesFabric.dyed_fabric_id
            ))
            callArray.push(weReturnRequisitionDetailsQueries.selectDetailsByWarehouseByFabric(
                warehousesFabric.warehouse_id, warehousesFabric.dyed_fabric_id
            ))
            callArray.push(weReconciliationRequisitionDetailsQueries.selectDetailsByWarehouseByFabric(
                warehousesFabric.warehouse_id, warehousesFabric.dyed_fabric_id
            ))
            callArray.push(weReturnSellRequisitionDetailsQueries.selectDetailsByWarehouseByFabric(
                warehousesFabric.warehouse_id, warehousesFabric.dyed_fabric_id
            ))
            callArray.push(wdDyeingRequisitionDetailsQueries.selectDetailsDetailsByFabricByWarehouseForWe(
                warehousesFabric.warehouse_id, warehousesFabric.dyed_fabric_id
            ))
            callArray.push(weTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseDetailsByFabricIdByWarehouseId(
                warehousesFabric.warehouse_id, warehousesFabric.dyed_fabric_id
                ))
            callArray.push(weTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseDetailsByFabricIdByWarehouseId(
                warehousesFabric.warehouse_id, warehousesFabric.dyed_fabric_id
                ))
            callArray.push(weExecuteOrderRequisitionDetailsQueries.selectFromWarehouseDetailsByWarehouseByFabric(
                warehousesFabric.warehouse_id, warehousesFabric.dyed_fabric_id
                ))
            callArray.push(weExecuteOrderRequisitionDetailsQueries.selectToWarehouseDetailsByWarehouseByFabric(
                warehousesFabric.warehouse_id, warehousesFabric.dyed_fabric_id
                ))
            const requisitions = await Promise.all(callArray)
            const sortedAsc = [...requisitions[0], ...requisitions[1],
            ...requisitions[2], ...requisitions[3], ...requisitions[4],
            ...requisitions[5], ...requisitions[6], ...requisitions[7],
            ...requisitions[8], ...requisitions[9]
        ].sort(
                (objA, objB) => moment(objA.date) - moment(objB.date)
            );
            data[i].details = sortedAsc

        }
    }

    return data;
};

exports.selectInventoryDetailsByWarehouseByFabric = async (fabricId, warehouseId) => {
    let callArray = []

    callArray.push(weAddRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByFabric(warehouseId, fabricId))
    callArray.push(weSellRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByFabric(warehouseId, fabricId))
    callArray.push(weReturnRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByFabric(warehouseId, fabricId))
    callArray.push(weReconciliationRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByFabric(warehouseId, fabricId))
    callArray.push(weReturnSellRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByFabric(warehouseId, fabricId))
    callArray.push(wdDyeingRequisitionDetailsQueries.selectDetailsDetailsByFabricByWarehouseForWe(warehouseId, fabricId))
    callArray.push(weTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseDetailsDetailsByWarehouseByFabricId(warehouseId, fabricId))
    callArray.push(weTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseDetailsDetailsByWarehouseByFabricId(warehouseId, fabricId))
    callArray.push(weExecuteOrderRequisitionDetailsQueries.selectFromWarehouseDetailsDetailsByWarehouseByFabric(warehouseId, fabricId))
    callArray.push(weExecuteOrderRequisitionDetailsQueries.selectToWarehouseDetailsDetailsByWarehouseByFabric(warehouseId, fabricId))
    const requisitions = await Promise.all(callArray)
    let sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5], ...requisitions[6], ...requisitions[7],
    ...requisitions[8], ...requisitions[9]
].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
    maxDateWhereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
    const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(weAddRequisitionTableName,
        { date: 'date' }, maxDateWhereCluse,
        weAddRequisitionDetailsTableName,
        `${weAddRequisitionDetailsTableName}.we_add_requisition_id`,
        `${weAddRequisitionTableName}.id`)
    if (selectMaxDate[0].date != null) {
        // Select Latest Price
        let weAddRequisitionDetailsWhereCluse = {};
        weAddRequisitionDetailsWhereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
        weAddRequisitionDetailsWhereCluse[`${weAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await weAddRequisitionDetailsQueries.selectLatestPrice(weAddRequisitionDetailsWhereCluse)
        if (latestPrice[0] != null) {
            sortedAsc[0].latest_price = latestPrice[0]?.price
            sortedAsc[0].latest_price_dollar = latestPrice[0]?.price_dollar
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

exports.selectPriceWe = async (fabricId, colorId, colorCode) => {
    let callArray = []

    let addRequisitionDetailsWhereCluse = {};
    addRequisitionDetailsWhereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
    addRequisitionDetailsWhereCluse[`${weAddRequisitionDetailsTableName}.color_id`] = colorId;
    addRequisitionDetailsWhereCluse[`${weAddRequisitionDetailsTableName}.color_code`] = colorCode;
    addRequisitionDetailsWhereCluse[`${weAddRequisitionDetailsTableName}.is_deleted`] = 0;
    addRequisitionDetailsWhereCluse[`${weAddRequisitionDetailsTableName}.is_active`] = 1;
    
    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
    reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.color_id`] = colorId;
    reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.color_code`] = colorCode;
    reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.is_active`] = 1;

    let dyeingWhereCluse = {};
    dyeingWhereCluse[`${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
    dyeingWhereCluse[`${anointedColorsPricesTableName}.color_id`] = colorId;
    dyeingWhereCluse[`${anointedColorsPricesTableName}.code`] = colorCode;
    dyeingWhereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
    dyeingWhereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;

    callArray.push(weAddRequisitionDetailsQueries.selectPriceWe(addRequisitionDetailsWhereCluse))
    callArray.push(weReconciliationRequisitionDetailsQueries.selectPriceWe(reconciliationWhereCluse))
    callArray.push(wdDyeingRequisitionDetailsQueries.selectPriceWe(dyeingWhereCluse))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2]
].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
    maxDateWhereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
    const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(weAddRequisitionTableName,
        { date: 'date' }, maxDateWhereCluse,
        weAddRequisitionDetailsTableName,
        `${weAddRequisitionDetailsTableName}.we_add_requisition_id`,
        `${weAddRequisitionTableName}.id`)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let weAddRequisitionDetailsWhereCluse = {};
        weAddRequisitionDetailsWhereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
        weAddRequisitionDetailsWhereCluse[`${weAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await weAddRequisitionDetailsQueries.selectLatestPrice(weAddRequisitionDetailsWhereCluse)
        if (latestPrice[0] != null) {
            sortedAsc[0].latest_price = latestPrice[0]?.price
            sortedAsc[0].latest_price_dollar = latestPrice[0]?.price_dollar
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

exports.purchasesByFabric = async (fabricId) => {
    let whereCluse = {};
    whereCluse[`${weAddRequisitionDetailsTableName}.dyed_fabric_id`] = fabricId;
    const results = await weReportQueries.purchasesYarns(whereCluse, "date");
    return results;
};

exports.purchasesBySupplier = async (supplierId) => {
    let whereCluse = {};
    whereCluse[`${weAddRequisitionTableName}.supplier_id`] = supplierId;
    const results = await weReportQueries.purchasesYarns(whereCluse, "dyed_fabric_id");
    return results;
};

exports.purchasesBySuppliers = async () => {

    const suppliers = await bussinessmanService.selectSuppliersBoughtFromWa()
    for (let i = 0; i < suppliers.length; i++) {
        const supplier = suppliers[i];

        let whereCluse = {};
        whereCluse[`${weAddRequisitionTableName}.supplier_id`] = supplier.id;
        const results = await weReportQueries.purchasesBySuppliers(whereCluse);

        if (results[0] != null) {
            let data = Object.assign(suppliers[i], results[0]);
            suppliers[i] = data
        }
    }
    suppliers.sort(function (a, b) { return b.quantity - a.quantity });
    return suppliers
};

exports.manufacturingReportByFabric = async (fabricId) => {

    const manufacturingReportByFabricResult = await weReportQueries.manufacturingReportByFabric(fabricId)
    return manufacturingReportByFabricResult
};

exports.selectInventoryByConsigmentsDyeing = async (consigmentsDyeing) => {
    let callArray = []

    let weAddRequisitionDetailsWhereCluse = {};
    weAddRequisitionDetailsWhereCluse[`${weAddRequisitionDetailsTableName}.is_deleted`] = 0;
    weAddRequisitionDetailsWhereCluse[`${weAddRequisitionDetailsTableName}.is_active`] = 1;
    callArray.push(weAddRequisitionDetailsQueries.selectByConsigmentDyeingForDyedFabricOrder(weAddRequisitionDetailsWhereCluse, consigmentsDyeing))

    callArray.push(weSellRequisitionDetailsQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(weReturnRequisitionDetailsQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(weReconciliationRequisitionDetailsQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(weReturnSellRequisitionDetailsQueries.selectTotalDetailsByFabricId(fabricId))
    callArray.push(weTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseTotalDetailsByFabricId(fabricId))
    callArray.push(weTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseTotalDetailsByFabricId(fabricId))
    callArray.push(weExecuteOrderRequisitionDetailsQueries.selectFromTotalDetailsByFabricId(fabricId))
    callArray.push(weExecuteOrderRequisitionDetailsQueries.selectToTotalDetailsByFabricId(fabricId))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5], ...requisitions[6], ...requisitions[7], 
    ...requisitions[8] 
].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    return sortedAsc;
};

exports.selectInventoryTotalByDate = async (bodyPaylod) => {
    let callArray = []

    // bodyPaylod.startDate = bodyPaylod.startDate.split('T')[0]
    // bodyPaylod.endDate = bodyPaylod.endDate.split('T')[0]
    callArray.push(weAddRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPaylod))
    callArray.push(weSellRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPaylod))
    callArray.push(weReturnRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPaylod))
    callArray.push(weReconciliationRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPaylod))
    callArray.push(wdDyeingRequisitionDetailsQueries.selectTotalDetailsByDateForWe(bodyPaylod))
    callArray.push(weReturnSellRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPaylod))
    callArray.push(weTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseTotalDetailsByDate(bodyPaylod))
    callArray.push(weTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseTotalDetailsByDate(bodyPaylod))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5], ...requisitions[6], ...requisitions[7]
].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    return sortedAsc;
};

exports.dyeingReportByFabric = async (dyedFabricId) => {

    const dyeingReportByFabricResult = await weReportQueries.dyeingReportByFabric(dyedFabricId)
    return dyeingReportByFabricResult
};

exports.dyedFabricReportByOrderBySeller = async (orderId, sellerId) => {
    let callArray = []

    //
    let waExecuteOrderRequisitionWhereCluse = {};
    waExecuteOrderRequisitionWhereCluse[`${ordersRequisitionsTableName}.we_dyed_fabric_order_requisition_id`] = orderId;
    waExecuteOrderRequisitionWhereCluse[`${weDyedFabricOrderRequisitionTableName}.seller_id`] = sellerId;
    // waExecuteOrderRequisitionWhereCluse[`${weDyedFabricOrderRequisitionTableName}.is_order`] = 0;
    waExecuteOrderRequisitionWhereCluse[`${weDyedFabricOrderRequisitionTableName}.is_deleted`] = 0;
    waExecuteOrderRequisitionWhereCluse[`${weDyedFabricOrderRequisitionTableName}.is_active`] = 1;
    const selectWaConsigmentsYarnsResult = await ordersRequisitionsService.selectWaYarnConsigmentsOrder(waExecuteOrderRequisitionWhereCluse)    
    
    callArray.push(waReportService.selectInventoryByConsigmentsYarn(selectWaConsigmentsYarnsResult))

    //
    let wbTransportWaWbRequisitionDetailsWhereCluse = {};
    wbTransportWaWbRequisitionDetailsWhereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
    wbTransportWaWbRequisitionDetailsWhereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
    const selectWbConsigmentsYarnResult = await wbTransportWaWbRequisitionDetailsService.selectWbConsigmentsYarn(wbTransportWaWbRequisitionDetailsWhereCluse, selectWaConsigmentsYarnsResult)

    callArray.push(wbReportService.selectInventoryByConsigmentsYarn(selectWbConsigmentsYarnResult))

    //
    let wbManufacturingOutputWhereCluse = {};
    wbManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.is_deleted`] = 0;
    wbManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.is_active`] = 1;
    const selectWcConsigmentsManufacturingResult = await wbManufacturingOutputService.selectWcConsigmentsManufacturing(wbManufacturingOutputWhereCluse, selectWbConsigmentsYarnResult)

    callArray.push(wcReportService.selectInventoryByConsigmentsManufacturing(selectWcConsigmentsManufacturingResult))

    let wdTransportWcWdRequisitionDetailsWhereCluse = {};
    wdTransportWcWdRequisitionDetailsWhereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
    wdTransportWcWdRequisitionDetailsWhereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;
    const selectWdConsigmentsDyeingResult = await wdTransportRequisitionWcWdDetailsService.selectWdConsigmentsDyeing(wdTransportWcWdRequisitionDetailsWhereCluse, selectWcConsigmentsManufacturingResult)

    callArray.push(wdReportService.selectInventoryByConsigmentsDyeing(selectWdConsigmentsDyeingResult))

    const requisitions = await Promise.all(callArray)
    const sortedAsc = [
        ...requisitions[0]
    ].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    selectbyConsigmentYarnForDyedFabricOrder
};

exports.salesReport = async () => {

    const salesReportResult = await weReportQueries.salesReport()
    return salesReportResult
};

exports.inquireFabricAvilabilityReportWe = async (fabric, addedData) => {
    let data = {}
    data.weFabrics = []
    data.wdFormFabrics = []
    data.wdFabrics = []
    data.wcFabrics = []
    data.wbYarns = []
    data.waYarns = []

    let isWeFabricsAdded = false
    let isWdFormFabricsAdded = false
    let isWdFabricsAdded = false
    let isWcFabricsAdded = false
    let isWbYarnsAdded = false
    let isWaYarnsAdded = false

    const myFirstPromise = new Promise(async (resolve, reject) => {
        // We call resolve(...) when what we were doing asynchronously was successful, and reject(...) when it failed.
        // In this example, we use setTimeout(...) to simulate async code.
        // In reality, you will probably be using something like XHR or an HTML API.

        let calcQuantity = parseFloat(fabric.quantity)

        let warehouseWhereCluse = {};
        warehouseWhereCluse[`${warehouseTableName}.is_stock`] = 1;
        warehouseWhereCluse[`${warehouseTableName}.is_deleted`] = 0;
        warehouseWhereCluse[`${warehouseTableName}.is_active`] = 1;

        let weFabricWhereCluse = {};
        weFabricWhereCluse[`${fabricTableName}.id`] = fabric.dyedFabricId;
        weFabricWhereCluse[`${colorTableName}.id`] = fabric.colorId;
        weFabricWhereCluse[`${weAddRequisitionDetailsTableName}.color_code`] = fabric.colorCode;
        weFabricWhereCluse[`${fabricTableName}.is_deleted`] = 0;
        weFabricWhereCluse[`${fabricTableName}.is_active`] = 1;
        weFabricWhereCluse[`${weTableName}.is_deleted`] = 0;
        weFabricWhereCluse[`${weTableName}.is_active`] = 1;

        let weReconciliationWhereCluse = {};
        weReconciliationWhereCluse[`${fabricTableName}.id`] = fabric.dyedFabricId;
        weReconciliationWhereCluse[`${colorTableName}.id`] = fabric.colorId;
        weReconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.color_code`] = fabric.colorCode;
        weReconciliationWhereCluse[`${fabricTableName}.is_deleted`] = 0;
        weReconciliationWhereCluse[`${fabricTableName}.is_active`] = 1;
        weReconciliationWhereCluse[`${weTableName}.is_deleted`] = 0;
        weReconciliationWhereCluse[`${weTableName}.is_active`] = 1;
        weReconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.input_output`] = 1;

        let weDyeingWhereCluse = {};
        weDyeingWhereCluse[`${fabricTableName}.id`] = fabric.dyedFabricId;
        weDyeingWhereCluse[`${anointedColorsPricesTableName}.color_id`] = fabric.colorId;
        weDyeingWhereCluse[`${anointedColorsPricesTableName}.code`] = fabric.colorCode;
        weDyeingWhereCluse[`${fabricTableName}.is_deleted`] = 0;
        weDyeingWhereCluse[`${fabricTableName}.is_active`] = 1;
        weDyeingWhereCluse[`${weTableName}.is_deleted`] = 0;
        weDyeingWhereCluse[`${weTableName}.is_active`] = 1;
        weDyeingWhereCluse[`${weTableName}.type`] = constantsPayloads.dyeingType;

        let transitionBetweenToWHWhereCluse = {};
        transitionBetweenToWHWhereCluse[`${fabricTableName}.id`] = fabric.dyedFabricId;
        transitionBetweenToWHWhereCluse[`${colorTableName}.id`] = fabric.colorId;
        transitionBetweenToWHWhereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`] = fabric.colorCode;
        transitionBetweenToWHWhereCluse[`${fabricTableName}.is_deleted`] = 0;
        transitionBetweenToWHWhereCluse[`${fabricTableName}.is_active`] = 1;
        transitionBetweenToWHWhereCluse[`${weTableName}.is_deleted`] = 0;
        transitionBetweenToWHWhereCluse[`${weTableName}.is_active`] = 1;
        transitionBetweenToWHWhereCluse[`${weTableName}.type`] = constantsPayloads.transportBetweenType;

        let weWhereCluseArray = [
            weFabricWhereCluse, weReconciliationWhereCluse, 
            weDyeingWhereCluse, warehouseWhereCluse,
            transitionBetweenToWHWhereCluse
        ]

        // select we fabrics 
        const weFabrics = await fabricQueries.selectStoredWeFabricsForInquireFabricAvilability(weWhereCluseArray)
        if (weFabrics[0] != null) {
            for (let i = 0; i < weFabrics.length; i++) {
                const weFabric = weFabrics[i];

                weFabric.ordered_quantity = calcQuantity

                data.weFabrics.push(weFabric)
                isWeFabricsAdded = await this.checkFoundObjectInArray4Attr(
                    addedData.weFabrics, weFabrics, 
                    'dyed_fabric_id',
                    'warehouse_id',
                    'color_id', 
                    'color_code')

                let getElementOf = (!isWeFabricsAdded) ?
                    weFabric
                    :
                    addedData.weFabrics[await this.getIndexOfElement4Attr(addedData.weFabrics, weFabric, 'dyed_fabric_id', 'warehouse_id', 'color_id', 'color_code')]

                let currentQuantity = (!isWeFabricsAdded) ?
                    weFabric.current_quantity
                    :
                    getElementOf.current_quantity

                getElementOf.current_quantity = (!isWeFabricsAdded) ?
                    (weFabric.current_quantity >= calcQuantity) ?
                        weFabric.current_quantity - calcQuantity :
                        0
                    :
                    (getElementOf.current_quantity >= calcQuantity) ?
                        getElementOf.current_quantity - calcQuantity :
                        0

                //
                weFabric.existed_quantity = (currentQuantity >= calcQuantity) ?
                    calcQuantity :
                    currentQuantity

                calcQuantity = (currentQuantity > 0) ?
                    parseFloat((calcQuantity - parseFloat((currentQuantity).toFixed(3))).toFixed(3))
                    :
                    parseFloat((calcQuantity).toFixed(3))

                if (calcQuantity > 0) {
                    weFabric.needed_quantity = (weFabrics.length - 1 == i) ? calcQuantity : 0,
                        data.weFabrics.pop()
                    data.weFabrics.push(weFabric)
                }
            }
        } else {
            // old
            // data.weFabrics = []

            // new
            data.weFabrics.push(
                {
                    id: fabric.dyed_fabric_id,
                    warehouse_id: '000',
                    warehouse_name: '',
                    dyed_fabric_id: fabric.dyedFabricId,
                    dyed_fabric_name: fabric.dyed_fabric_name,
                    dyed_fabric_code: fabric.dyed_fabric_code,
                    color_id: fabric.colorId,
                    color_name: fabric.color_name,
                    color_code: fabric.colorCode,
                    existed_quantity: 0,
                    needed_quantity: calcQuantity,
                    ordered_quantity: calcQuantity,
                }
            )
        }

        if (calcQuantity > 0) {
            ////////////////////////////////////////// WD ///////////////////////////////////////
            // select wd Form fabrics 
            const wdFormFabrics = await wdReportService.inquireFabricFormAvilabilityReportWd(fabric)
            if (wdFormFabrics[0] != null) {
                for (let i = 0; i < wdFormFabrics.length; i++) {
                    const wdFormFabric = wdFormFabrics[i];

                    data.wdFormFabrics.push(wdFormFabric)

                    isWdFormFabricsAdded = await this.checkFoundObjectInArray2Attr(
                        addedData.wdFormFabrics, wdFormFabric, 
                        'fabric_id', 'dyeing_id')

                    let getElementOf = (!isWdFormFabricsAdded) ?
                        wdFormFabric
                        :
                        addedData.wdFormFabrics[await this.getIndexOfElement2Attr(addedData.wdFormFabrics, wdFormFabric, 'fabric_id', 'dyeing_id')]

                    let currentQuantity = (!isWdFormFabricsAdded) ?
                        wdFormFabric.form_current_quantity
                        :
                        getElementOf.form_current_quantity

                    getElementOf.form_current_quantity = (!isWdFormFabricsAdded) ?
                        (wdFormFabric.form_current_quantity >= calcQuantity) ?
                            wdFormFabric.form_current_quantity - calcQuantity :
                            0
                        :
                        (getElementOf.form_current_quantity >= calcQuantity) ?
                            getElementOf.form_current_quantity - calcQuantity :
                            0

                    //
                    wdFormFabric.existed_quantity = (currentQuantity >= calcQuantity) ?
                        calcQuantity :
                        currentQuantity


                    calcQuantity = (currentQuantity > 0) ?
                    parseFloat((calcQuantity - parseFloat((currentQuantity).toFixed(3))).toFixed(3)) 
                    :
                    parseFloat((calcQuantity).toFixed(3))
                }
            } else {
                data.wdFormFabrics = []
            }

            // select wd fabrics 
            const wdFabrics = await wdReportService.inquireFabricAvilabilityReportWd(fabric)
            if (wdFabrics[0] != null) {
                for (let i = 0; i < wdFabrics.length; i++) {
                    const wdFabric = wdFabrics[i];

                    data.wdFabrics.push(wdFabric)

                    isWdFabricsAdded = await this.checkFoundObjectInArray2Attr(
                        addedData.wdFabrics, wdFabric, 
                        'fabric_id', 'dyeing_id')

                    let getElementOf = (!isWdFabricsAdded) ?
                        wdFabric
                        :
                        addedData.wdFabrics[await this.getIndexOfElement2Attr(addedData.wdFabrics, wdFabric, 'fabric_id', 'dyeing_id')]

                    let currentQuantity = (!isWdFabricsAdded) ?
                        wdFabric.current_quantity
                        :
                        getElementOf.current_quantity

                    getElementOf.current_quantity = (!isWdFabricsAdded) ?
                        (wdFabric.current_quantity >= calcQuantity) ?
                            wdFabric.current_quantity - calcQuantity :
                            0
                        :
                        (getElementOf.current_quantity >= calcQuantity) ?
                            getElementOf.current_quantity - calcQuantity :
                            0

                    //
                    wdFabric.existed_quantity = (currentQuantity >= calcQuantity) ?
                        calcQuantity :
                        currentQuantity

    
                    calcQuantity = (currentQuantity > 0) ? 
                    parseFloat((calcQuantity - parseFloat((currentQuantity).toFixed(3))).toFixed(3))
                    :
                    parseFloat((calcQuantity).toFixed(3))
                }
            } else {
                data.wdFabrics = []
            }
        }

        if (calcQuantity > 0) {
            ////////////////////////////////////////// WC ///////////////////////////////////////
            // select wc fabrics 
            const wcFabrics = await wcReportService.inquireFabricAvilabilityReportWc(fabric)

            if (wcFabrics[0] != null) {
                for (let i = 0; i < wcFabrics.length; i++) {
                    const wcFabric = wcFabrics[i];

                    wcFabric.ordered_quantity = (calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100)))
                    
                    data.wcFabrics.push(wcFabric)

                    isWcFabricsAdded = await this.checkFoundObjectInArray2Attr(
                        addedData.wcFabrics, wcFabric, 
                        'id', 
                        'warehouse_id')

                    let getElementOf = (!isWcFabricsAdded) ?
                    wcFabric
                        :
                        addedData.wcFabrics[await this.getIndexOfElement2Attr(addedData.wcFabrics, wcFabric, 'id', 'warehouse_id')]


                    let currentQuantity = (!isWcFabricsAdded) ?
                        wcFabric.current_quantity
                        :
                        getElementOf.current_quantity

                    getElementOf.current_quantity = (!isWcFabricsAdded) ?
                        (wcFabric.current_quantity >= (calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100)))) ?
                            wcFabric.current_quantity - (calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))) :
                            0
                        :
                        (getElementOf.current_quantity >= (calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100)))) ?
                            getElementOf.current_quantity - (calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))) :
                            0

                    //
                    wcFabric.existed_quantity = (currentQuantity >= (calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100)))) ?
                        (calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))) :
                        currentQuantity


                    calcQuantity = (currentQuantity > 0) ?
                        parseFloat((((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100)))) - parseFloat((currentQuantity).toFixed(3))).toFixed(3))
                        :
                        parseFloat((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))).toFixed(3))
                    if (calcQuantity > 0) {
                        wcFabric.needed_quantity = (wcFabrics.length - 1 == i) ? calcQuantity : 0,
                            data.wcFabrics.pop()
                        data.wcFabrics.push(wcFabric)
                    }
                }

            } else {
                // old
                // data.wcFabrics = []

                // new
                data.wcFabrics.push(
                    {
                        id: fabric.fabricId,
                        warehouse_id: '000',
                        warehouse_name: '',
                        name: fabric.fabric_name,
                        code: fabric.fabric_code,
                        existed_quantity: 0,
                        needed_quantity: parseFloat((((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))) ) ).toFixed(3)),
                        ordered_quantity: parseFloat((((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))) ) ).toFixed(3)),
                    }
                )
            }
        }

        if (calcQuantity > 0) {
            // console.log("if (calcQuantity > 0) { ", calcQuantity);

            ////////////////////////////////////////// WB ///////////////////////////////////////
            // select yarns of fabric
            const yarnsOfFabricResult = await fabricYarnsService.selectByFabricIdForReport(fabric.fabricId)
            if (yarnsOfFabricResult[0] != null) {

                for (let i = 0; i < yarnsOfFabricResult.length; i++) {
                    const yarnOfFabric = yarnsOfFabricResult[i];

                    // select wb yarns 
                    const wbYarns = await wbReportService.inquireYarnAvilabilityReportWb(fabric, yarnOfFabric.yarn_id)
                    if (Array.isArray(wbYarns) && wbYarns.length > 0) {
                        let neededYarnQuantity = calcQuantity
                        neededYarnQuantity = parseFloat(((calcQuantity * parseFloat(yarnOfFabric.total_ratio) / 100)).toFixed(3))
                        neededYarnQuantity = (yarnOfFabric.wast_ratio != 0) ? parseFloat((neededYarnQuantity / ( 1 - (constants.notZero(yarnOfFabric.wast_ratio) / 100) )).toFixed(3)) 
                        : neededYarnQuantity

                        for (let j = 0; j < wbYarns.length; j++) {
                            const wbYarn = wbYarns[j];

                            // check if yarn added before for not calc same current quantity in all records
                            isWbYarnsAdded = await this.checkFoundObjectInArray2Attr(
                                addedData.wbYarns, wbYarn, 
                                'yarn_id', 
                                'manufacturer_id'
                                )

                            let getElementOf = (!isWbYarnsAdded) ?
                            wbYarn
                                :
                                addedData.wbYarns[await this.getIndexOfElement2Attr(addedData.wbYarns, wbYarn, 'yarn_id', 'manufacturer_id')]


                            let currentQuantity = (!isWbYarnsAdded) ?
                                wbYarn.current_quantity
                                :
                                getElementOf.current_quantity

                            getElementOf.current_quantity = (!isWbYarnsAdded) ?
                                (wbYarn.current_quantity >= neededYarnQuantity) ?
                                    wbYarn.current_quantity - neededYarnQuantity
                                    :
                                    0
                                :
                                (getElementOf.current_quantity >= neededYarnQuantity) ?
                                    getElementOf.current_quantity - neededYarnQuantity :
                                    0


                            if (parseFloat(currentQuantity) >= neededYarnQuantity) {
                                wbYarn.existed_quantity = neededYarnQuantity
                                neededYarnQuantity = 0
                            } else {
                                wbYarn.existed_quantity = currentQuantity
                                neededYarnQuantity = (currentQuantity > 0) ?
                                parseFloat((neededYarnQuantity - currentQuantity).toFixed(3)) 
                                :
                                parseFloat((neededYarnQuantity).toFixed(3))
                            }
                            // if(isWbYarnsAdded) {
                            //     wbYarn.current_quantity = wbYarn.current_quantity - getElementOf.current_quantity
                            // }

                            data.wbYarns.push(wbYarn)
                            if (neededYarnQuantity == 0) {
                                // data.waYarns.push({})
                                continue;
                            } else {
                                if (wbYarns.length - 1 == j) {
                                    const waYarns = await waReportService.inquireYarnAvilabilityReportWa(yarnOfFabric.yarn_id)
                                    if (waYarns[0] != null) {
                                        // console.log("i ::: ", i);
                                        // console.log("neededYarnQuantity ::: ", neededYarnQuantity);
                                        for (let k = 0; k < waYarns.length; k++) {
                                            const waYarn = waYarns[k];

                                            waYarn.ordered_quantity = neededYarnQuantity

                                            // check if yarn added before for not calc same current quantity in all records
                                            isWaYarnsAdded = await this.checkFoundObjectInArray2Attr(
                                                addedData.waYarns, waYarn,
                                                'id',
                                                'warehouse_id'
                                                )

                                            let getElementOf = (!isWaYarnsAdded) ?
                                            waYarn
                                                :
                                                addedData.waYarns[await this.getIndexOfElement2Attr(addedData.waYarns, waYarn, 'id', 'warehouse_id')]

                                                let currentQuantity = (!isWaYarnsAdded) ?
                                                waYarn.current_quantity
                                                :
                                                getElementOf.current_quantity
            
                                            getElementOf.current_quantity = (!isWaYarnsAdded) ?
                                                (waYarn.current_quantity >= neededYarnQuantity) ?
                                                    waYarn.current_quantity - neededYarnQuantity
                                                    :
                                                    0
                                                :
                                                (getElementOf.current_quantity >= neededYarnQuantity) ?
                                                    getElementOf.current_quantity - neededYarnQuantity :
                                                    0

                                            if (parseFloat(currentQuantity) >= neededYarnQuantity) {
                                                waYarn.existed_quantity = currentQuantity
                                                // sssssssssssssssssssssssssssssssssss
                                                // waYarn.existed_quantity = neededYarnQuantity
                                                waYarn.needed_quantity = 0
                                                neededYarnQuantity = 0
                                            } else {
                                                waYarn.existed_quantity = currentQuantity
                                                neededYarnQuantity = (currentQuantity > 0) ?
                                                parseFloat((neededYarnQuantity - currentQuantity).toFixed(3)) 
                                                :
                                                parseFloat((neededYarnQuantity).toFixed(3)) 
                                            }

                                            if (neededYarnQuantity == 0) {
                                                data.waYarns.push(waYarn)
                                                continue;
                                            } else {
                                                data.waYarns.push(
                                                    {
                                                        id: yarnOfFabric.yarn_id,
                                                        warehouse_id: '000',
                                                        warehouse_name: waYarn.warehouse_name,
                                                        name: yarnOfFabric.yarn_name,
                                                        code: yarnOfFabric.yarn_code,
                                                        existed_quantity: waYarn.existed_quantity,
                                                        needed_quantity: (waYarns.length - 1 == k) ? neededYarnQuantity : 0,
                                                        ordered_quantity: neededYarnQuantity,
                                                    }
                                                )
                                            }
                                        }
                                    } else {
                                        data.waYarns.push(
                                            {
                                                id: yarnOfFabric.yarn_id,
                                                warehouse_id: '000',
                                                warehouse_name: '',
                                                name: yarnOfFabric.yarn_name,
                                                code: yarnOfFabric.yarn_code,
                                                existed_quantity: 0,
                                                needed_quantity: neededYarnQuantity,
                                                ordered_quantity: neededYarnQuantity,
                                            }
                                        )
                                    }
                                } else {
                                    // console.log("else => neededYarnQuantity :::: ", neededYarnQuantity);
                                    continue;
                                }
                            }
                        }
                    } else {
                        // data.wbYarns.push({})
                        const waYarns = await waReportService.inquireYarnAvilabilityReportWa(yarnOfFabric.yarn_id)
                        if (waYarns[0] != null) {
                            let calcQuantityYarn = parseFloat((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))).toFixed(3))
                            for (let j = 0; j < waYarns.length; j++) {
                                const waYarn = waYarns[j];

                                let orderedYarnQuantity = 0
                                orderedYarnQuantity = parseFloat(((calcQuantityYarn * parseFloat(yarnOfFabric.total_ratio) / 100)).toFixed(3))
                                orderedYarnQuantity = (yarnOfFabric.wast_ratio != 0) ? parseFloat((orderedYarnQuantity / ( 1 - (constants.notZero(yarnOfFabric.wast_ratio) / 100) )).toFixed(3)) 
                                : orderedYarnQuantity

                                let neededYarnQuantity = 0
                                neededYarnQuantity = parseFloat(((calcQuantityYarn * parseFloat(yarnOfFabric.total_ratio) / 100)).toFixed(3))
                                neededYarnQuantity = (yarnOfFabric.wast_ratio != 0) ? parseFloat((neededYarnQuantity / ( 1 - (constants.notZero(yarnOfFabric.wast_ratio) / 100) )).toFixed(3)) 
                                : neededYarnQuantity

                                calcQuantityYarn = 0

                                waYarn.ordered_quantity = orderedYarnQuantity

                                // check if yarn added before for not calc same current quantity in all records
                                isWaYarnsAdded = await this.checkFoundObjectInArray2Attr(
                                    addedData.waYarns, waYarn, 
                                    'id',
                                    'warehouse_id')

                                let getElementOf = (!isWaYarnsAdded) ?
                                waYarn
                                    :
                                    addedData.waYarns[await this.getIndexOfElement2Attr(addedData.waYarns, waYarn, 'id', 'warehouse_id')]

                                let currentQuantity = (!isWaYarnsAdded) ?
                                    waYarn.current_quantity
                                    :
                                    getElementOf.current_quantity

                                getElementOf.current_quantity = (!isWaYarnsAdded) ?
                                    (waYarn.current_quantity >= neededYarnQuantity) ?
                                        waYarn.current_quantity - neededYarnQuantity
                                        :
                                        0
                                    :
                                    (getElementOf.current_quantity >= neededYarnQuantity) ?
                                        getElementOf.current_quantity - neededYarnQuantity :
                                        0


                                if (parseFloat(currentQuantity) >= neededYarnQuantity) {
                                    waYarn.existed_quantity = currentQuantity
                                    // sssssssssssssssssssssssssssssssssss
                                    // waYarn.existed_quantity = neededYarnQuantity
                                    waYarn.needed_quantity = 0
                                    neededYarnQuantity = 0
                                } else {
                                    waYarn.existed_quantity = currentQuantity
                                    neededYarnQuantity = (currentQuantity > 0) ?
                                    parseFloat((neededYarnQuantity - currentQuantity).toFixed(3))
                                    :
                                    parseFloat((neededYarnQuantity).toFixed(3))
                                }

                                if (neededYarnQuantity == 0) {
                                    data.waYarns.push(waYarn)
                                    continue;
                                } else {
                                    data.waYarns.push(
                                        {
                                            id: yarnOfFabric.yarn_id,
                                            warehouse_id: waYarn.warehouse_id,
                                            warehouse_name: waYarn.warehouse_name,
                                            name: yarnOfFabric.yarn_name,
                                            code: yarnOfFabric.yarn_code,
                                            existed_quantity: waYarn.existed_quantity,
                                            needed_quantity: (waYarns.length - 1 == j) ? neededYarnQuantity : 0,
                                            ordered_quantity: (waYarns.length - 1 == j) ? orderedYarnQuantity : 0,
                                        }
                                    )
                                }
                            }
                        } else {
                            let calcQuantityYarn = parseFloat((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))).toFixed(3))
                            let orderedYarnQuantity = 0
                            orderedYarnQuantity = parseFloat(((calcQuantityYarn * parseFloat(yarnOfFabric.total_ratio) / 100)).toFixed(3))
                            orderedYarnQuantity = (yarnOfFabric.wast_ratio != 0) ? parseFloat((orderedYarnQuantity / ( 1 - (constants.notZero(yarnOfFabric.wast_ratio) / 100) )).toFixed(3)) 
                            : orderedYarnQuantity

                            data.waYarns.push(
                                {
                                    id: yarnOfFabric.yarn_id,
                                    warehouse_id: '000',
                                    warehouse_name: '',
                                    name: yarnOfFabric.yarn_name,
                                    code: yarnOfFabric.yarn_code,
                                    existed_quantity: 0,
                                    needed_quantity: orderedYarnQuantity,
                                    ordered_quantity: orderedYarnQuantity,
                                }
                            )
                        }
                    }
                }
            } else {
                data.waYarns = []
                data.wbYarns = []
            }
        } else {
            data.waYarns = []
            data.wbYarns = []
        }

        // for (const key in data) {
        //     console.log("key ::: ", key);
        //     if (data.hasOwnProperty.call(data, key)) {
        //         const element = data[key];
        //         console.log(element)
        //     }
        // }

        // setTimeout(() => {
        resolve(data); // Yay! Everything went well!
        // }, 250);
    });
    return await myFirstPromise

};

exports.inquireFabricAvilabilityTotalReportWe = async (fabric, addedData) => {
    let data = {}
    data.weFabrics = []
    data.wdFormFabrics = []
    data.wdFabrics = []
    data.wcFabrics = []
    data.wbYarns = []
    data.waYarns = []

    let isWeFabricsAdded = false
    let isWdFormFabricsAdded = false
    let isWdFabricsAdded = false
    let isWcFabricsAdded = false
    let isWbYarnsAdded = false
    let isWaYarnsAdded = false

    const myFirstPromise = new Promise(async (resolve, reject) => {
        // We call resolve(...) when what we were doing asynchronously was successful, and reject(...) when it failed.
        // In this example, we use setTimeout(...) to simulate async code.
        // In reality, you will probably be using something like XHR or an HTML API.

        let calcQuantity = parseFloat(fabric.quantity)

        let warehouseWhereCluse = {};
        warehouseWhereCluse[`${warehouseTableName}.is_stock`] = 1;
        warehouseWhereCluse[`${warehouseTableName}.is_deleted`] = 0;
        warehouseWhereCluse[`${warehouseTableName}.is_active`] = 1;

        let weFabricWhereCluse = {};
        weFabricWhereCluse[`${fabricTableName}.id`] = fabric.dyedFabricId;
        weFabricWhereCluse[`${colorTableName}.id`] = fabric.colorId;
        weFabricWhereCluse[`${weAddRequisitionDetailsTableName}.color_code`] = fabric.colorCode;
        weFabricWhereCluse[`${fabricTableName}.is_deleted`] = 0;
        weFabricWhereCluse[`${fabricTableName}.is_active`] = 1;
        weFabricWhereCluse[`${weTableName}.is_deleted`] = 0;
        weFabricWhereCluse[`${weTableName}.is_active`] = 1;

        let weReconciliationWhereCluse = {};
        weReconciliationWhereCluse[`${fabricTableName}.id`] = fabric.dyedFabricId;
        weReconciliationWhereCluse[`${colorTableName}.id`] = fabric.colorId;
        weReconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.color_code`] = fabric.colorCode;
        weReconciliationWhereCluse[`${fabricTableName}.is_deleted`] = 0;
        weReconciliationWhereCluse[`${fabricTableName}.is_active`] = 1;
        weReconciliationWhereCluse[`${weTableName}.is_deleted`] = 0;
        weReconciliationWhereCluse[`${weTableName}.is_active`] = 1;
        weReconciliationWhereCluse[`${weReconciliationRequisitionDetailsTableName}.input_output`] = 1;

        let weDyeingWhereCluse = {};
        weDyeingWhereCluse[`${fabricTableName}.id`] = fabric.dyedFabricId;
        weDyeingWhereCluse[`${anointedColorsPricesTableName}.color_id`] = fabric.colorId;
        weDyeingWhereCluse[`${anointedColorsPricesTableName}.code`] = fabric.colorCode;
        weDyeingWhereCluse[`${fabricTableName}.is_deleted`] = 0;
        weDyeingWhereCluse[`${fabricTableName}.is_active`] = 1;
        weDyeingWhereCluse[`${weTableName}.is_deleted`] = 0;
        weDyeingWhereCluse[`${weTableName}.is_active`] = 1;
        weDyeingWhereCluse[`${weTableName}.type`] = constantsPayloads.dyeingType;

        let transitionBetweenToWHWhereCluse = {};
        transitionBetweenToWHWhereCluse[`${fabricTableName}.id`] = fabric.dyedFabricId;
        transitionBetweenToWHWhereCluse[`${colorTableName}.id`] = fabric.colorId;
        transitionBetweenToWHWhereCluse[`${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`] = fabric.colorCode;
        transitionBetweenToWHWhereCluse[`${fabricTableName}.is_deleted`] = 0;
        transitionBetweenToWHWhereCluse[`${fabricTableName}.is_active`] = 1;
        transitionBetweenToWHWhereCluse[`${weTableName}.is_deleted`] = 0;
        transitionBetweenToWHWhereCluse[`${weTableName}.is_active`] = 1;
        transitionBetweenToWHWhereCluse[`${weTableName}.type`] = constantsPayloads.transportBetweenType;

        let weWhereCluseArray = [
            weFabricWhereCluse, weReconciliationWhereCluse, 
            weDyeingWhereCluse, warehouseWhereCluse,
            transitionBetweenToWHWhereCluse
        ]

        // select we fabrics 
        const weFabrics = await fabricQueries.selectStoredWeFabricsForInquireFabricAvilabilityTotal(weWhereCluseArray)
        if (weFabrics[0] != null) {
            for (let i = 0; i < weFabrics.length; i++) {
                const weFabric = weFabrics[i];

                weFabric.ordered_quantity = calcQuantity

                data.weFabrics.push(weFabric)
                isWeFabricsAdded = await this.checkFoundObjectInArray3Attr(
                    addedData.weFabrics, weFabrics, 
                    'dyed_fabric_id',
                    'color_id', 
                    'color_code')

                let getElementOf = (!isWeFabricsAdded) ?
                weFabric
                    :
                    addedData.weFabrics[await this.getIndexOfElement3Attr(addedData.weFabrics, weFabric, 'dyed_fabric_id', 'color_id', 'color_code')]

                let currentQuantity = (!isWeFabricsAdded) ?
                    weFabric.current_quantity
                    :
                    getElementOf.current_quantity

                getElementOf.current_quantity = (!isWeFabricsAdded) ?
                    (weFabric.current_quantity >= calcQuantity) ?
                        weFabric.current_quantity - calcQuantity :
                        0
                    :
                    (getElementOf.current_quantity >= calcQuantity) ?
                        getElementOf.current_quantity - calcQuantity :
                        0

                //
                weFabric.existed_quantity = (currentQuantity >= calcQuantity) ?
                    calcQuantity :
                    currentQuantity

                calcQuantity = (currentQuantity > 0) ?
                    parseFloat((calcQuantity - parseFloat((currentQuantity).toFixed(3))).toFixed(3))
                    :
                    parseFloat((calcQuantity).toFixed(3))


                if (calcQuantity > 0) {
                    weFabric.needed_quantity = (weFabrics.length - 1 == i) ? calcQuantity : 0,
                        data.weFabrics.pop()
                    data.weFabrics.push(weFabric)
                }
            }
        } else {
            // old
            // data.weFabrics = []

            // new
            data.weFabrics.push(
                {
                    id: fabric.dyed_fabric_id,
                    dyed_fabric_id: fabric.dyedFabricId,
                    dyed_fabric_name: fabric.dyed_fabric_name,
                    dyed_fabric_code: fabric.dyed_fabric_code,
                    color_id: fabric.colorId,
                    color_name: fabric.color_name,
                    color_code: fabric.colorCode,
                    existed_quantity: 0,
                    needed_quantity: calcQuantity,
                    ordered_quantity: calcQuantity,
                }
            )
        }

        if (calcQuantity > 0) {
            ////////////////////////////////////////// WD ///////////////////////////////////////
            // select wd Form fabrics 
            const wdFormFabrics = await wdReportService.inquireFabricFormAvilabilityTotalReportWd(fabric)
            if (wdFormFabrics[0] != null) {
                for (let i = 0; i < wdFormFabrics.length; i++) {
                    const wdFormFabric = wdFormFabrics[i];

                    data.wdFormFabrics.push(wdFormFabric)

                    isWdFormFabricsAdded = await this.checkFoundObjectInArray1Attr(
                        addedData.wdFormFabrics, wdFormFabric,
                        'fabric_id')

                    let getElementOf = (!isWdFormFabricsAdded) ?
                        wdFormFabric
                        :
                        addedData.wdFormFabrics[await this.getIndexOfElement1Attr(addedData.wdFormFabrics, wdFormFabric, 'fabric_id')]

                    let currentQuantity = (!isWdFormFabricsAdded) ?
                        wdFormFabric.form_current_quantity
                        :
                        getElementOf.form_current_quantity

                    getElementOf.form_current_quantity = (!isWdFormFabricsAdded) ?
                        (wdFormFabric.form_current_quantity >= calcQuantity) ?
                            wdFormFabric.form_current_quantity - calcQuantity :
                            0
                        :
                        (getElementOf.form_current_quantity >= calcQuantity) ?
                            getElementOf.form_current_quantity - calcQuantity :
                            0

                    //
                    wdFormFabric.existed_quantity = (currentQuantity >= calcQuantity) ?
                        calcQuantity :
                        currentQuantity


                    calcQuantity = (currentQuantity > 0) ?
                    parseFloat((calcQuantity - parseFloat((currentQuantity).toFixed(3))).toFixed(3)) 
                    :
                    parseFloat((calcQuantity).toFixed(3))
                }
            } else {
                data.wdFormFabrics = []
            }

            // select wd fabrics 
            const wdFabrics = await wdReportService.inquireFabricAvilabilityTotalReportWd(fabric)
            if (wdFabrics[0] != null) {
                for (let i = 0; i < wdFabrics.length; i++) {
                    const wdFabric = wdFabrics[i];

                    data.wdFabrics.push(wdFabric)

                    isWdFabricsAdded = await this.checkFoundObjectInArray1Attr(
                        addedData.wdFabrics, wdFabric,
                        'fabric_id')

                    let getElementOf = (!isWdFabricsAdded) ?
                        wdFabric
                        :
                        addedData.wdFabrics[await this.getIndexOfElement2Attr(addedData.wdFabrics, wdFabric, 'fabric_id', 'dyeing_id')]

                    let currentQuantity = (!isWdFabricsAdded) ?
                        wdFabric.current_quantity
                        :
                        getElementOf.current_quantity

                    getElementOf.current_quantity = (!isWdFabricsAdded) ?
                        (wdFabric.current_quantity >= calcQuantity) ?
                            wdFabric.current_quantity - calcQuantity :
                            0
                        :
                        (getElementOf.current_quantity >= calcQuantity) ?
                            getElementOf.current_quantity - calcQuantity :
                            0

                    //
                    wdFabric.existed_quantity = (currentQuantity >= calcQuantity) ?
                        calcQuantity :
                        currentQuantity

    
                    calcQuantity = (currentQuantity > 0) ? 
                    parseFloat((calcQuantity - parseFloat((currentQuantity).toFixed(3))).toFixed(3))
                    :
                    parseFloat((calcQuantity).toFixed(3))
                }
            } else {
                data.wdFabrics = []
            }
        }

        if (calcQuantity > 0) {
            ////////////////////////////////////////// WC ///////////////////////////////////////
            // select wc fabrics 
            const wcFabrics = await wcReportService.inquireFabricAvilabilityTotalReportWc(fabric)

            if (wcFabrics[0] != null) {
                for (let i = 0; i < wcFabrics.length; i++) {
                    const wcFabric = wcFabrics[i];
                    
                    wcFabric.ordered_quantity = (calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100)))
                    
                    data.wcFabrics.push(wcFabric)

                    isWcFabricsAdded = await this.checkFoundObjectInArray1Attr(
                        addedData.wcFabrics, wcFabric, 
                        'id')

                    let getElementOf = (!isWcFabricsAdded) ?
                    wcFabric
                        :
                        addedData.wcFabrics[await this.getIndexOfElement1Attr(addedData.wcFabrics, wcFabric, 'id')]


                    let currentQuantity = (!isWcFabricsAdded) ?
                        wcFabric.current_quantity
                        :
                        getElementOf.current_quantity

                    getElementOf.current_quantity = (!isWcFabricsAdded) ?
                        (wcFabric.current_quantity >= (calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100)))) ?
                            wcFabric.current_quantity - (calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))) :
                            0
                        :
                        (getElementOf.current_quantity >= (calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100)))) ?
                            getElementOf.current_quantity - (calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))) :
                            0

                    //
                    wcFabric.existed_quantity = (currentQuantity >= (calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100)))) ?
                        (calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))) :
                        currentQuantity

                    calcQuantity = (currentQuantity > 0) ?
                        parseFloat((((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100)))) - parseFloat((currentQuantity).toFixed(3))).toFixed(3))
                        :
                        parseFloat((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))).toFixed(3))
                    if (calcQuantity > 0) {
                        wcFabric.needed_quantity = (wcFabrics.length - 1 == i) ? calcQuantity : 0,
                            data.wcFabrics.pop()
                        data.wcFabrics.push(wcFabric)
                    }
                }

            } else {
                // old
                // data.wcFabrics = []

                // new
                data.wcFabrics.push(
                    {
                        id: fabric.fabricId,
                        name: fabric.fabric_name,
                        code: fabric.fabric_code,
                        existed_quantity: 0,
                        needed_quantity: parseFloat((((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))) ) ).toFixed(3)),
                        ordered_quantity: parseFloat((((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))) ) ).toFixed(3)),
                    }
                )
            }
        }

        if (calcQuantity > 0) {
            // console.log("if (calcQuantity > 0) { ", calcQuantity);

            ////////////////////////////////////////// WB ///////////////////////////////////////
            // select yarns of fabric
            const yarnsOfFabricResult = await fabricYarnsService.selectByFabricIdForReport(fabric.fabricId)
            if (yarnsOfFabricResult[0] != null) {

                for (let i = 0; i < yarnsOfFabricResult.length; i++) {
                    const yarnOfFabric = yarnsOfFabricResult[i];

                    // select wb yarns 
                    const wbYarns = await wbReportService.inquireYarnAvilabilityTotalReportWb(fabric, yarnOfFabric.yarn_id)
                    if (Array.isArray(wbYarns) && wbYarns.length > 0) {
                        let neededYarnQuantity = calcQuantity
                        neededYarnQuantity = parseFloat(((calcQuantity * parseFloat(yarnOfFabric.total_ratio) / 100)).toFixed(3))
                        neededYarnQuantity = (yarnOfFabric.wast_ratio != 0) ? parseFloat((neededYarnQuantity / ( 1 - (constants.notZero(yarnOfFabric.wast_ratio) / 100) )).toFixed(3)) 
                        : neededYarnQuantity
                        
                        for (let j = 0; j < wbYarns.length; j++) {
                            const wbYarn = wbYarns[j];

                            // check if yarn added before for not calc same current quantity in all records
                            isWbYarnsAdded = await this.checkFoundObjectInArray1Attr(
                                addedData.wbYarns, wbYarn, 
                                'yarn_id')

                            let getElementOf = (!isWbYarnsAdded) ?
                            wbYarn
                                :
                                addedData.wbYarns[await this.getIndexOfElement1Attr(addedData.wbYarns, wbYarn, 'yarn_id')]


                            let currentQuantity = (!isWbYarnsAdded) ?
                                wbYarn.current_quantity
                                :
                                getElementOf.current_quantity

                            getElementOf.current_quantity = (!isWbYarnsAdded) ?
                                (wbYarn.current_quantity >= neededYarnQuantity) ?
                                    wbYarn.current_quantity - neededYarnQuantity
                                    :
                                    0
                                :
                                (getElementOf.current_quantity >= neededYarnQuantity) ?
                                    getElementOf.current_quantity - neededYarnQuantity :
                                    0


                            if (parseFloat(currentQuantity) >= neededYarnQuantity) {
                                wbYarn.existed_quantity = neededYarnQuantity
                                neededYarnQuantity = 0
                            } else {
                                wbYarn.existed_quantity = currentQuantity
                                neededYarnQuantity = (currentQuantity > 0) ?
                                parseFloat((neededYarnQuantity - currentQuantity).toFixed(3)) 
                                :
                                parseFloat((neededYarnQuantity).toFixed(3))
                            }
                            // if(isWbYarnsAdded) {
                            //     wbYarn.current_quantity = wbYarn.current_quantity - getElementOf.current_quantity
                            // }

                            data.wbYarns.push(wbYarn)
                            if (neededYarnQuantity == 0) {
                                // data.waYarns.push({})
                                continue;
                            } else {
                                if (wbYarns.length - 1 == j) {
                                    const waYarns = await waReportService.inquireYarnAvilabilityTotalReportWa(yarnOfFabric.yarn_id)
                                    if (waYarns[0] != null) {

                                        // console.log("i ::: ", i);
                                        // console.log("neededYarnQuantity ::: ", neededYarnQuantity);
                                        for (let k = 0; k < waYarns.length; k++) {
                                            const waYarn = waYarns[k];

                                            waYarn.ordered_quantity = neededYarnQuantity

                                            // check if yarn added before for not calc same current quantity in all records
                                            isWaYarnsAdded = await this.checkFoundObjectInArray1Attr(
                                                addedData.waYarns, waYarn,
                                                'id')

                                            let getElementOf = (!isWaYarnsAdded) ?
                                            waYarn
                                                :
                                                addedData.waYarns[await this.getIndexOfElement1Attr(addedData.waYarns, waYarn, 'id')]

                                            let currentQuantity = (!isWaYarnsAdded) ?
                                                waYarn.current_quantity
                                                :
                                                getElementOf.current_quantity

                                            getElementOf.current_quantity = (!isWaYarnsAdded) ?
                                                (waYarn.current_quantity >= neededYarnQuantity) ?
                                                    waYarn.current_quantity - neededYarnQuantity
                                                    :
                                                    0
                                                :
                                                (getElementOf.current_quantity >= neededYarnQuantity) ?
                                                    getElementOf.current_quantity - neededYarnQuantity :
                                                    0

                                            if (parseFloat(currentQuantity) >= neededYarnQuantity) {
                                                waYarn.existed_quantity = currentQuantity
                                                // sssssssssssssssssssssssssssssssssss
                                                // waYarn.existed_quantity = neededYarnQuantity
                                                waYarn.needed_quantity = 0
                                                neededYarnQuantity = 0
                                            } else {
                                                waYarn.existed_quantity = currentQuantity
                                                neededYarnQuantity = (currentQuantity > 0) ?
                                                parseFloat((neededYarnQuantity - currentQuantity).toFixed(3)) 
                                                :
                                                parseFloat((neededYarnQuantity).toFixed(3)) 
                                            }
                                            if (neededYarnQuantity == 0) {
                                                data.waYarns.push(waYarn)
                                                continue;
                                            } else {
                                                data.waYarns.push(
                                                    {
                                                        id: yarnOfFabric.yarn_id,
                                                        name: yarnOfFabric.yarn_name,
                                                        code: yarnOfFabric.yarn_code,
                                                        existed_quantity: waYarn.existed_quantity,
                                                        needed_quantity: (waYarns.length - 1 == k) ? neededYarnQuantity : 0,
                                                        ordered_quantity: neededYarnQuantity,
                                                    }
                                                )
                                            }
                                        }
                                    } else {
                                        data.waYarns.push(
                                            {
                                                id: yarnOfFabric.yarn_id,
                                                name: yarnOfFabric.yarn_name,
                                                code: yarnOfFabric.yarn_code,
                                                existed_quantity: 0,
                                                needed_quantity: neededYarnQuantity,
                                                ordered_quantity: neededYarnQuantity,
                                            }
                                        )
                                    }
                                } else {
                                    // console.log("else => neededYarnQuantity :::: ", neededYarnQuantity);
                                    continue;
                                }
                            }
                        }
                    } else {
                        // data.wbYarns.push({})
                        const waYarns = await waReportService.inquireYarnAvilabilityTotalReportWa(yarnOfFabric.yarn_id)
                        if (waYarns[0] != null) {
                            let calcQuantityYarn = parseFloat((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))).toFixed(3))
                            for (let j = 0; j < waYarns.length; j++) {
                                const waYarn = waYarns[j];

                                let orderedYarnQuantity = 0
                                orderedYarnQuantity = parseFloat(((calcQuantityYarn * parseFloat(yarnOfFabric.total_ratio) / 100)).toFixed(3))
                                orderedYarnQuantity = (yarnOfFabric.wast_ratio != 0) ? parseFloat((orderedYarnQuantity / ( 1 - (constants.notZero(yarnOfFabric.wast_ratio) / 100) )).toFixed(3)) 
                                : orderedYarnQuantity

                                let neededYarnQuantity = 0
                                neededYarnQuantity = parseFloat(((calcQuantityYarn * parseFloat(yarnOfFabric.total_ratio) / 100)).toFixed(3))
                                neededYarnQuantity = (yarnOfFabric.wast_ratio != 0) ? parseFloat((neededYarnQuantity / ( 1 - (constants.notZero(yarnOfFabric.wast_ratio) / 100) )).toFixed(3)) 
                                : neededYarnQuantity
                                calcQuantityYarn = 0

                                waYarn.ordered_quantity = orderedYarnQuantity

                                // check if yarn added before for not calc same current quantity in all records
                                isWaYarnsAdded = await this.checkFoundObjectInArray1Attr(
                                    addedData.waYarns, waYarn, 
                                    'id')

                                let getElementOf = (!isWaYarnsAdded) ?
                                waYarn
                                    :
                                    addedData.waYarns[await this.getIndexOfElement1Attr(addedData.waYarns, waYarn, 'id')]

                                let currentQuantity = (!isWaYarnsAdded) ?
                                    waYarn.current_quantity
                                    :
                                    getElementOf.current_quantity

                                getElementOf.current_quantity = (!isWaYarnsAdded) ?
                                    (waYarn.current_quantity >= neededYarnQuantity) ?
                                        waYarn.current_quantity - neededYarnQuantity
                                        :
                                        0
                                    :
                                    (getElementOf.current_quantity >= neededYarnQuantity) ?
                                        getElementOf.current_quantity - neededYarnQuantity :
                                        0


                                if (parseFloat(currentQuantity) >= neededYarnQuantity) {
                                    waYarn.existed_quantity = currentQuantity

                                    // sssssssssssssssssssssssssssssssssss
                                    // waYarn.existed_quantity = neededYarnQuantity
                                    waYarn.needed_quantity = 0
                                    neededYarnQuantity = 0
                                } else {
                                    waYarn.existed_quantity = currentQuantity
                                    neededYarnQuantity = (currentQuantity > 0) ?
                                    parseFloat((neededYarnQuantity - currentQuantity).toFixed(3))
                                    :
                                    parseFloat((neededYarnQuantity).toFixed(3))

                                }

                                if (neededYarnQuantity == 0) {
                                    data.waYarns.push(waYarn)
                                    continue;
                                } else {
                                    data.waYarns.push(
                                        {
                                            id: yarnOfFabric.yarn_id,
                                            name: yarnOfFabric.yarn_name,
                                            code: yarnOfFabric.yarn_code,
                                            existed_quantity: waYarn.existed_quantity,
                                            needed_quantity: (waYarns.length - 1 == j) ? neededYarnQuantity : 0,
                                            ordered_quantity: (waYarns.length - 1 == j) ? orderedYarnQuantity : 0,
                                        }
                                    )
                                }
                            }
                        } else {
                            let calcQuantityYarn = parseFloat((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))).toFixed(3))
                            let orderedYarnQuantity = 0
                            orderedYarnQuantity = parseFloat(((calcQuantityYarn * parseFloat(yarnOfFabric.total_ratio) / 100)).toFixed(3))
                            orderedYarnQuantity = (yarnOfFabric.wast_ratio != 0) ? parseFloat((orderedYarnQuantity / ( 1 - (constants.notZero(yarnOfFabric.wast_ratio) / 100) )).toFixed(3)) 
                            : orderedYarnQuantity

                            data.waYarns.push(
                                {
                                    id: yarnOfFabric.yarn_id,
                                    name: yarnOfFabric.yarn_name,
                                    code: yarnOfFabric.yarn_code,
                                    existed_quantity: 0,
                                    // needed_quantity: parseFloat(((calcQuantity * parseFloat(yarnOfFabric.total_ratio)) / 100).toFixed(3)),
                                    // ordered_quantity: parseFloat(((calcQuantity * parseFloat(yarnOfFabric.total_ratio)) / 100).toFixed(3)),
                                    needed_quantity: orderedYarnQuantity,
                                    ordered_quantity: orderedYarnQuantity,
                                }
                            )
                        }
                    }
                }
            } else {
                data.waYarns = []
                data.wbYarns = []
            }
        } else {
            data.waYarns = []
            data.wbYarns = []
        }

        // for (const key in data) {
        //     console.log("key ::: ", key);
        //     if (data.hasOwnProperty.call(data, key)) {
        //         const element = data[key];
        //         console.log(element)
        //     }
        // }

        // setTimeout(() => {
        resolve(data); // Yay! Everything went well!
        // }, 250);
    });
    return await myFirstPromise

};

exports.inquireFabricAvilabilityByDyeingOrderRequisitionReportWe = async (weDyedFabricOrderRequisitionIds) => {

    let data = []
    data.weFabrics = []
    data.wdFormFabrics = []
    data.wdFabrics = []
    data.wcFabrics = []
    data.wbYarns = []
    data.waYarns = []

    let dataResult = {}
    dataResult.weFabrics = []
    dataResult.wdFormFabrics = []
    dataResult.wdFabrics = []
    dataResult.wcFabrics = []
    dataResult.wbYarns = []
    dataResult.waYarns = []

    const myFirstPromise = new Promise(async (resolve, reject) => {

        let whereCluse = {};
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

        let dyeingOrderRequisitions = await weDyedFabricOrderRequisitionDetailsQueries.selectByRequisitionIds(whereCluse, weDyedFabricOrderRequisitionIds)
        // console.log("dyeingOrderRequisitions :::::::::::::::: ", dyeingOrderRequisitions);

        for (let i = 0; i < dyeingOrderRequisitions.length; i++) {
            const weDyedFabricOrderRequisitionsRecord = dyeingOrderRequisitions[i];
            weDyedFabricOrderRequisitionsRecord.quantity = weDyedFabricOrderRequisitionsRecord.current_quantity
            data.push(await this.inquireFabricAvilabilityReportWe(weDyedFabricOrderRequisitionsRecord, await this.breakParentArrayToOneArray(data)))
        }
        // console.log("data :::::::::::::::: ", data);


        dataResult = await this.breakParentArrayToOneArray(data)
        // console.log("dataResult :::::::::: breakParentArrayToOneArray => ", dataResult);
        // get data of object data [...]
        // for (let J = 0; J < data.length; J++) {
        //     const element = data[J];
        //     console.log(" J ========== ", J);
        //     console.log(" element ========== ", element);
        dataResult = await this.filterObjectsWarehousesOfParentArray(dataResult)
        // }
        resolve(dataResult); // Yay! Everything went well!

    });

    // console.log("dataResult :::::::: ", await myFirstPromise);
    return await myFirstPromise

}

exports.inquireFabricAvilabilityByDyeingOrderRequisitionTotalReportWe = async (weDyedFabricOrderRequisitionIds) => {

    let data = []
    data.weFabrics = []
    data.wdFormFabrics = []
    data.wdFabrics = []
    data.wcFabrics = []
    data.wbYarns = []
    data.waYarns = []

    let dataResult = {}
    dataResult.weFabrics = []
    dataResult.wdFormFabrics = []
    dataResult.wdFabrics = []
    dataResult.wcFabrics = []
    dataResult.wbYarns = []
    dataResult.waYarns = []


    const myFirstPromise = new Promise(async (resolve, reject) => {

        let whereCluse = {};
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_deleted`] = 0;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_active`] = 1;
        whereCluse[`${weDyedFabricOrderRequisitionDetailsTableName}.is_order`] = 1;

        let dyeingOrderRequisitions = await weDyedFabricOrderRequisitionDetailsQueries.selectByRequisitionIds(whereCluse, weDyedFabricOrderRequisitionIds)
        // console.log("dyeingOrderRequisitions :::::::::::::::: ", dyeingOrderRequisitions);

        for (let i = 0; i < dyeingOrderRequisitions.length; i++) {
            const weDyedFabricOrderRequisitionsRecord = dyeingOrderRequisitions[i];
            weDyedFabricOrderRequisitionsRecord.quantity = weDyedFabricOrderRequisitionsRecord.current_quantity
            data.push(await this.inquireFabricAvilabilityTotalReportWe(weDyedFabricOrderRequisitionsRecord, await this.breakParentArrayToOneArray(data)))
        }
        // console.log("data :::::::::::::::: ", data);


        dataResult = await this.breakParentArrayToOneArray(data)
        // console.log("dataResult :::::::::: breakParentArrayToOneArray => ", dataResult);
        // get data of object data [...]
        // for (let J = 0; J < data.length; J++) {
        //     const element = data[J];
        //     console.log(" J ========== ", J);
        //     console.log(" element ========== ", element);
        dataResult = await this.filterObjectsWarehousesOfParentArrayTotal(dataResult)
        // }
        // console.log("dataResult ::::::::: ", dataResult);
        resolve(dataResult); // Yay! Everything went well!

    });

    // console.log("dataResult :::::::: ", await myFirstPromise);
    return await myFirstPromise

}

exports.breakParentArrayToOneArray = async (parentArray) => {
    let data = {}
    data.weFabrics = []
    data.wdFormFabrics = []
    data.wdFabrics = []
    data.wcFabrics = []
    data.wbYarns = []
    data.waYarns = []

    for (let i = 0; i < parentArray.length; i++) {
        const parentArrayElement = parentArray[i];

        for (const key in parentArrayElement) {
            if (Object.hasOwnProperty.call(parentArrayElement, key)) {
                const objectWarehouseArray = parentArrayElement[key];

                if (key == "weFabrics") {
                    data.weFabrics = [...data.weFabrics, ...objectWarehouseArray]
                }

                if (key == "wdFormFabrics") {
                    data.wdFormFabrics = [...data.wdFormFabrics, ...objectWarehouseArray]
                }

                if (key == "wdFabrics") {
                    data.wdFabrics = [...data.wdFabrics, ...objectWarehouseArray]
                }

                if (key == "wcFabrics") {
                    data.wcFabrics = [...data.wcFabrics, ...objectWarehouseArray]
                }

                if (key == "wbYarns") {
                    data.wbYarns = [...data.wbYarns, ...objectWarehouseArray]
                }

                if (key == "waYarns") {
                    data.waYarns = [...data.waYarns, ...objectWarehouseArray]
                }

            }
        }
    }
    return data
}

exports.filterObjectsWarehousesOfParentArray = async (objectsWarehouses) => {
    let data = {}
    data.weFabrics = []
    data.wdFormFabrics = []
    data.wdFabrics = []
    data.wcFabrics = []
    data.wbYarns = []
    data.waYarns = []

    const myFirstPromise = new Promise(async (resolve, reject) => {

        for (const key in objectsWarehouses) {
            if (Object.hasOwnProperty.call(objectsWarehouses, key)) {
                const objectWarehouseArray = objectsWarehouses[key];

                if (objectWarehouseArray.length > 0) {

                    // --------------------- START weFabrics-----------------
                    // Check key type
                    if (key == "weFabrics") {
                        let objectWarehouseArrayFiltered = []
                        objectWarehouseArrayFiltered.push(objectWarehouseArray[0])
                        let arrayOfFabrics = [{
                            dyed_fabric_id: objectWarehouseArray[0].dyed_fabric_id,
                            warehouse_id: objectWarehouseArray[0].warehouse_id,
                            color_id: objectWarehouseArray[0].colorId,
                            color_code: objectWarehouseArray[0].colorCode
                        }]

                        for (let q = 1; q < objectWarehouseArray.length; q++) {
                            const objectWarehouseArrayElement = objectWarehouseArray[q];

                            for (let w = 0; w < objectWarehouseArrayFiltered.length; w++) {
                                let objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[w];

                                if ( await this.checkFoundObjectInArray4Attr(
                                    arrayOfFabrics, objectWarehouseArrayElement, 
                                    'dyed_fabric_id', 'warehouse_id',
                                    'color_id', 'color_code')
                                //     arrayOfFabrics.includes({
                                //     dyed_fabric_id: objectWarehouseArrayElement.dyed_fabric_id,
                                //     warehouse_id: objectWarehouseArrayElement.warehouse_id
                                // }, 0)
                                ) {
                                    // get index of element
                                    objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[await this.getIndexOfElement4Attr(objectWarehouseArrayFiltered, objectWarehouseArrayElement, 
                                        'dyed_fabric_id', 'warehouse_id',
                                        'color_id', 'color_code',
                                        )] 
                                    objectWarehouseArrayFilteredElement.needed_quantity = objectWarehouseArrayFilteredElement.needed_quantity + objectWarehouseArrayElement.needed_quantity
                                    objectWarehouseArrayFilteredElement.current_quantity = objectWarehouseArrayFilteredElement.current_quantity + objectWarehouseArrayElement.current_quantity
                                    objectWarehouseArrayFilteredElement.ordered_quantity = objectWarehouseArrayFilteredElement.ordered_quantity + objectWarehouseArrayElement.ordered_quantity
                                    objectWarehouseArrayFilteredElement.existed_quantity = objectWarehouseArrayFilteredElement.existed_quantity + objectWarehouseArrayElement.existed_quantity
                                    break;

                                    // objectWarehouseArrayFilteredElement.needed_quantity = objectWarehouseArrayFilteredElement.needed_quantity + objectWarehouseArrayElement.needed_quantity
                                } else {
                                    objectWarehouseArrayFiltered.push(objectWarehouseArrayElement)
                                    arrayOfFabrics.push({
                                        dyed_fabric_id: objectWarehouseArrayElement.dyed_fabric_id,
                                        warehouse_id: objectWarehouseArrayElement.warehouse_id
                                    })
                                    break;
                                }
                            }


                        }

                        if (data.weFabrics.length > 0) {
                            let arrayOfFabrics = data.weFabrics.map(function (a) { return {
                                dyed_fabric_id: a.dyed_fabric_id,
                                warehouse_id: a.warehouse_id,
                                color_id: a.color_id,
                                color_code: a.color_code
                            }; });
                            for (let e = 0; e < objectWarehouseArrayFiltered.length; e++) {
                                const objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[e];

                                for (let r = 0; r < data.weFabrics.length; r++) {
                                    let weFabricsElement = data.weFabrics[r];

                                    if ( await this.checkFoundObjectInArray4Attr(
                                        arrayOfFabrics, objectWarehouseArrayFilteredElement, 
                                        'dyed_fabric_id', 'warehouse_id',
                                        'color_id', 'color_code')
                                    //     arrayOfFabrics.includes({
                                    //     dyed_fabric_id: objectWarehouseArrayFilteredElement.dyed_fabric_id,
                                    //     warehouse_id: objectWarehouseArrayFilteredElement.warehouse_id
                                    // }, 0)
                                    ) {
                                        // get index of element
                                        weFabricsElement = data.weFabrics[await this.getIndexOfElement4Attr(data.weFabrics, objectWarehouseArrayFilteredElement, 
                                            'dyed_fabric_id', 'warehouse_id',
                                            'color_id', 'color_code'
                                            )] 
                                        weFabricsElement.needed_quantity = weFabricsElement.needed_quantity + objectWarehouseArrayFiltered.needed_quantity
                                        weFabricsElement.current_quantity = weFabricsElement.current_quantity + objectWarehouseArrayFiltered.current_quantity
                                        weFabricsElement.ordered_quantity = weFabricsElement.ordered_quantity + objectWarehouseArrayFiltered.ordered_quantity
                                        weFabricsElement.existed_quantity = weFabricsElement.existed_quantity + objectWarehouseArrayFiltered.existed_quantity
                                        break;

                                        // weFabricsElement.needed_quantity = weFabricsElement.needed_quantity + objectWarehouseArrayFiltered.needed_quantity
                                    } else {
                                        data.weFabrics.push(objectWarehouseArrayFilteredElement)
                                        arrayOfFabrics.push({
                                            dyed_fabric_id: objectWarehouseArrayFilteredElement.dyed_fabric_id,
                                            warehouse_id: objectWarehouseArrayFilteredElement.warehouse_id
                                        })
                                        break;
                                    }
                                }
                            }
                        } else {
                            data.weFabrics.push(...objectWarehouseArrayFiltered)
                        }
                    }
                    // --------------------- END weFabrics-----------------

                    // --------------------- START wdFormFabrics-----------------
                    // Check key type
                    if (key == "wdFormFabrics") {
                        let objectWarehouseArrayFiltered = []
                        objectWarehouseArrayFiltered.push(objectWarehouseArray[0])
                        let arrayOfFabrics = [{
                            fabric_id: objectWarehouseArray[0].fabric_id,
                            dyeing_id: objectWarehouseArray[0].dyeing_id
                        }]

                        for (let q = 1; q < objectWarehouseArray.length; q++) {
                            const objectWarehouseArrayElement = objectWarehouseArray[q];

                            for (let w = 0; w < objectWarehouseArrayFiltered.length; w++) {
                                let objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[w];

                                if ( await this.checkFoundObjectInArray2Attr(
                                    arrayOfFabrics, objectWarehouseArrayElement, 
                                    'fabric_id',
                                    'dyeing_id')
                                //     arrayOfFabrics.includes({
                                //     id: objectWarehouseArrayElement.id,
                                //     warehouse_id: objectWarehouseArrayElement.warehouse_id
                                // }, 0)
                                ) {
                                    // get index of element
                                    objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[await this.getIndexOfElement2Attr(objectWarehouseArrayFiltered, objectWarehouseArrayElement, 'fabric_id', 'dyeing_id')] 
                                    objectWarehouseArrayFilteredElement.form_current_quantity = objectWarehouseArrayFilteredElement.form_current_quantity + objectWarehouseArrayElement.form_current_quantity
                                    objectWarehouseArrayFilteredElement.existed_quantity = objectWarehouseArrayFilteredElement.existed_quantity + objectWarehouseArrayElement.existed_quantity
                                    break;

                                } else {
                                    objectWarehouseArrayFiltered.push(objectWarehouseArrayElement)
                                    arrayOfFabrics.push({
                                        fabric_id: objectWarehouseArrayElement.fabric_id,
                                        dyeing_id: objectWarehouseArrayElement.dyeing_id,
                                    })
                                    break;
                                }
                            }
                        }

                        if (data.wdFormFabrics.length > 0) {
                            let arrayOfFabrics = data.wdFormFabrics.map(function (a) { return {
                                fabric_id: a.fabric_id,
                                dyeing_id: a.dyeing_id
                            } });
                            for (let e = 0; e < objectWarehouseArrayFiltered.length; e++) {
                                const objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[e];

                                for (let r = 0; r < data.wdFormFabrics.length; r++) {
                                    let wdFormFabricsElement = data.wdFormFabrics[r];

                                    if ( await this.checkFoundObjectInArray2Attr(
                                        arrayOfFabrics, objectWarehouseArrayFilteredElement, 
                                        'fabric_id',
                                        'dyeing_id'
                                        )
                                    //     arrayOfFabrics.includes({
                                    //     id: objectWarehouseArrayFilteredElement.id,
                                    //     warehouse_id: objectWarehouseArrayFilteredElement.warehouse_id
                                    // }, 0)
                                    ) {
                                        // get index of element
                                        wdFormFabricsElement = data.wdFormFabrics[await this.getIndexOfElement2Attr(data.wdFormFabrics, objectWarehouseArrayFilteredElement, 'fabric_id', 'dyeing_id')] 
                                        wdFormFabricsElement.form_current_quantity = wdFormFabricsElement.form_current_quantity + objectWarehouseArrayFiltered.form_current_quantity
                                        wdFormFabricsElement.existed_quantity = wdFormFabricsElement.existed_quantity + objectWarehouseArrayFiltered.existed_quantity
                                        break;

                                    } else {
                                        data.wdFormFabrics.push(objectWarehouseArrayFilteredElement)
                                        arrayOfFabrics.push({
                                            fabric_id: objectWarehouseArrayFilteredElement.fabric_id,
                                            dyeing_id: objectWarehouseArrayFilteredElement.dyeing_id,
                                        })
                                        break;
                                    }
                                }
                            }
                        } else {
                            data.wdFormFabrics.push(...objectWarehouseArrayFiltered)
                        }
                    }
                    // --------------------- END wdFormFabrics-----------------


                    // --------------------- START wdFabrics-----------------
                    // Check key type
                    if (key == "wdFabrics") {
                        let objectWarehouseArrayFiltered = []
                        objectWarehouseArrayFiltered.push(objectWarehouseArray[0])
                        let arrayOfFabrics = [{
                            fabric_id: objectWarehouseArray[0].fabric_id,
                            dyeing_id: objectWarehouseArray[0].dyeing_id
                        }]

                        for (let q = 1; q < objectWarehouseArray.length; q++) {
                            const objectWarehouseArrayElement = objectWarehouseArray[q];

                            for (let w = 0; w < objectWarehouseArrayFiltered.length; w++) {
                                let objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[w];

                                if ( await this.checkFoundObjectInArray2Attr(
                                    arrayOfFabrics, objectWarehouseArrayElement, 
                                    'fabric_id',
                                    'dyeing_id')
                                //     arrayOfFabrics.includes({
                                //     id: objectWarehouseArrayElement.id,
                                //     warehouse_id: objectWarehouseArrayElement.warehouse_id
                                // }, 0)
                                ) {
                                    // get index of element
                                    objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[await this.getIndexOfElement2Attr(objectWarehouseArrayFiltered, objectWarehouseArrayElement, 'fabric_id', 'dyeing_id')] 
                                    objectWarehouseArrayFilteredElement.current_quantity = objectWarehouseArrayFilteredElement.current_quantity + objectWarehouseArrayElement.current_quantity
                                    objectWarehouseArrayFilteredElement.existed_quantity = objectWarehouseArrayFilteredElement.existed_quantity + objectWarehouseArrayElement.existed_quantity
                                    break;

                                } else {
                                    objectWarehouseArrayFiltered.push(objectWarehouseArrayElement)
                                    arrayOfFabrics.push({
                                        fabric_id: objectWarehouseArrayElement.fabric_id,
                                        dyeing_id: objectWarehouseArrayElement.dyeing_id,
                                    })
                                    break;
                                }
                            }
                        }

                        if (data.wdFabrics.length > 0) {
                            let arrayOfFabrics = data.wdFabrics.map(function (a) { return {
                                fabric_id: a.fabric_id,
                                dyeing_id: a.dyeing_id
                            } });
                            for (let e = 0; e < objectWarehouseArrayFiltered.length; e++) {
                                const objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[e];

                                for (let r = 0; r < data.wdFabrics.length; r++) {
                                    let wdFabricsElement = data.wdFabrics[r];

                                    if ( await this.checkFoundObjectInArray2Attr(
                                        arrayOfFabrics, objectWarehouseArrayFilteredElement, 
                                        'fabric_id',
                                        'dyeing_id'
                                        )
                                    //     arrayOfFabrics.includes({
                                    //     id: objectWarehouseArrayFilteredElement.id,
                                    //     warehouse_id: objectWarehouseArrayFilteredElement.warehouse_id
                                    // }, 0)
                                    ) {
                                        // get index of element
                                        wdFabricsElement = data.wdFabrics[await this.getIndexOfElement2Attr(data.wdFabrics, objectWarehouseArrayFilteredElement, 'fabric_id', 'dyeing_id')] 
                                        wdFabricsElement.current_quantity = wdFabricsElement.current_quantity + objectWarehouseArrayFiltered.current_quantity
                                        wdFabricsElement.existed_quantity = wdFabricsElement.existed_quantity + objectWarehouseArrayFiltered.existed_quantity
                                        break;

                                    } else {
                                        data.wdFabrics.push(objectWarehouseArrayFilteredElement)
                                        arrayOfFabrics.push({
                                            fabric_id: objectWarehouseArrayFilteredElement.fabric_id,
                                            dyeing_id: objectWarehouseArrayFilteredElement.dyeing_id,
                                        })
                                        break;
                                    }
                                }
                            }
                        } else {
                            data.wdFabrics.push(...objectWarehouseArrayFiltered)
                        }
                    }
                    // --------------------- END wdFabrics-----------------

                    // --------------------- START wcFabrics-----------------
                    // Check key type
                    if (key == "wcFabrics") {
                        let objectWarehouseArrayFiltered = []
                        objectWarehouseArrayFiltered.push(objectWarehouseArray[0])
                        let arrayOfFabrics = [{
                            id: objectWarehouseArray[0].id,
                            warehouse_id: objectWarehouseArray[0].warehouse_id
                        }]

                        for (let q = 1; q < objectWarehouseArray.length; q++) {
                            const objectWarehouseArrayElement = objectWarehouseArray[q];

                            for (let w = 0; w < objectWarehouseArrayFiltered.length; w++) {
                                let objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[w];

                                if ( await this.checkFoundObjectInArray2Attr(
                                    arrayOfFabrics, objectWarehouseArrayElement, 
                                    'id', 'warehouse_id')
                                //     arrayOfFabrics.includes({
                                //     id: objectWarehouseArrayElement.id,
                                //     warehouse_id: objectWarehouseArrayElement.warehouse_id
                                // }, 0)
                                ) {
                                    // get index of element
                                    objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[await this.getIndexOfElement2Attr(objectWarehouseArrayFiltered, objectWarehouseArrayElement, 'id', 'warehouse_id')] 
                                    objectWarehouseArrayFilteredElement.needed_quantity = objectWarehouseArrayFilteredElement.needed_quantity + objectWarehouseArrayElement.needed_quantity
                                    objectWarehouseArrayFilteredElement.current_quantity = objectWarehouseArrayFilteredElement.current_quantity + objectWarehouseArrayElement.current_quantity
                                    objectWarehouseArrayFilteredElement.ordered_quantity = objectWarehouseArrayFilteredElement.ordered_quantity + objectWarehouseArrayElement.ordered_quantity
                                    objectWarehouseArrayFilteredElement.existed_quantity = objectWarehouseArrayFilteredElement.existed_quantity + objectWarehouseArrayElement.existed_quantity
                                    break;

                                    // objectWarehouseArrayFilteredElement.needed_quantity = objectWarehouseArrayFilteredElement.needed_quantity + objectWarehouseArrayElement.needed_quantity
                                } else {
                                    objectWarehouseArrayFiltered.push(objectWarehouseArrayElement)
                                    arrayOfFabrics.push({
                                        id: objectWarehouseArrayElement.id,
                                        warehouse_id: objectWarehouseArrayElement.warehouse_id
                                    })
                                    break;
                                }
                            }


                        }

                        if (data.wcFabrics.length > 0) {
                            let arrayOfFabrics = data.wcFabrics.map(function (a) { return {
                                id: a.id,
                                warehouse_id: a.warehouse_id
                            }; });
                            for (let e = 0; e < objectWarehouseArrayFiltered.length; e++) {
                                const objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[e];

                                for (let r = 0; r < data.wcFabrics.length; r++) {
                                    let wcFabricsElement = data.wcFabrics[r];

                                    if ( await this.checkFoundObjectInArray2Attr(
                                        arrayOfFabrics, objectWarehouseArrayFilteredElement, 
                                        'id', 'warehouse_id')
                                    //     arrayOfFabrics.includes({
                                    //     id: objectWarehouseArrayFilteredElement.id,
                                    //     warehouse_id: objectWarehouseArrayFilteredElement.warehouse_id
                                    // }, 0)
                                    ) {
                                        // get index of element
                                        wcFabricsElement = data.wcFabrics[await this.getIndexOfElement2Attr(data.wcFabrics, objectWarehouseArrayFilteredElement, 'id', 'warehouse_id')] 
                                        wcFabricsElement.needed_quantity = wcFabricsElement.needed_quantity + objectWarehouseArrayFiltered.needed_quantity
                                        wcFabricsElement.current_quantity = wcFabricsElement.current_quantity + objectWarehouseArrayFiltered.current_quantity
                                        wcFabricsElement.ordered_quantity = wcFabricsElement.ordered_quantity + objectWarehouseArrayFiltered.ordered_quantity
                                        wcFabricsElement.existed_quantity = wcFabricsElement.existed_quantity + objectWarehouseArrayFiltered.existed_quantity
                                        break;

                                        // wcFabricsElement.needed_quantity = wcFabricsElement.needed_quantity + objectWarehouseArrayFiltered.needed_quantity
                                    } else {
                                        data.wcFabrics.push(objectWarehouseArrayFilteredElement)
                                        arrayOfFabrics.push({
                                            id: objectWarehouseArrayFilteredElement.id,
                                            warehouse_id: objectWarehouseArrayFilteredElement.warehouse_id
                                        })
                                        break;
                                    }
                                }
                            }
                        } else {
                            data.wcFabrics.push(...objectWarehouseArrayFiltered)
                        }
                    }
                    // --------------------- END wcFabrics-----------------


                    // --------------------- START wbYarns-----------------
                    // Check key type
                    if (key == "wbYarns") {
                        let objectWarehouseArrayFiltered = []
                        objectWarehouseArrayFiltered.push(objectWarehouseArray[0])
                        let arrayOfYarns = [{
                            yarn_id: objectWarehouseArray[0].yarn_id,
                            manufacturer_id: objectWarehouseArray[0].manufacturer_id
                        }]

                        for (let q = 1; q < objectWarehouseArray.length; q++) {
                            const objectWarehouseArrayElement = objectWarehouseArray[q];

                            for (let w = 0; w < objectWarehouseArrayFiltered.length; w++) {
                                let objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[w];

                                if ( await this.checkFoundObjectInArray2Attr(arrayOfYarns, objectWarehouseArrayElement, 'yarn_id', 'manufacturer_id')
                                //     arrayOfYarns.includes({
                                //     id: objectWarehouseArrayElement.id,
                                //     warehouse_id: objectWarehouseArrayElement.warehouse_id
                                // }, 0)
                                ) {
                                    // get index of element
                                    objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[await this.getIndexOfElement2Attr(objectWarehouseArrayFiltered, objectWarehouseArrayElement, 'yarn_id', 'manufacturer_id')] 
                                    objectWarehouseArrayFilteredElement.current_quantity = objectWarehouseArrayFilteredElement.current_quantity + objectWarehouseArrayElement.current_quantity
                                    break;
                                } else {
                                    objectWarehouseArrayFiltered.push(objectWarehouseArrayElement)
                                    arrayOfYarns.push({
                                        yarn_id: objectWarehouseArrayElement.yarn_id,
                                        manufacturer_id: objectWarehouseArrayElement.manufacturer_id,
                                    })
                                    break;
                                    
                                }
                            }
                        }

                        if (data.wbYarns.length > 0) {
                            let arrayOfYarns = data.wbYarns.map(function (a) { return {
                                yarn_id: a.yarn_id,
                                manufacturer_id: a.manufacturer_id,
                            } });
                            for (let e = 0; e < objectWarehouseArrayFiltered.length; e++) {
                                const objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[e];

                                for (let r = 0; r < data.wbYarns.length; r++) {
                                    let wbYarnsElement = data.wbYarns[r];

                                    if ( await this.checkFoundObjectInArray2Attr(arrayOfYarns, objectWarehouseArrayFilteredElement, 'yarn_id', 'manufacturer_id')
                                    //     arrayOfYarns.includes({
                                    //     id: objectWarehouseArrayFilteredElement.id,
                                    //     warehouse_id: objectWarehouseArrayFilteredElement.warehouse_id
                                    // }, 0)
                                    ) {
                                        // get index of element
                                        wbYarnsElement = data.wbYarns[await this.getIndexOfElement2Attr(data.wbYarns, objectWarehouseArrayFilteredElement, 'yarn_id', 'manufacturer_id')] 
                                        // wbYarnsElement.needed_quantity = wbYarnsElement.needed_quantity + objectWarehouseArrayFiltered.needed_quantity
                                        wbYarnsElement.current_quantity = wbYarnsElement.current_quantity + objectWarehouseArrayFiltered.current_quantity
                                        break;
                                    } else {
                                        data.wbYarns.push(objectWarehouseArrayFilteredElement)
                                        arrayOfYarns.push({
                                            yarn_id: objectWarehouseArrayFilteredElement.yarn_id,
                                            manufacturer_id: objectWarehouseArrayFilteredElement.manufacturer_id,
                                        })
                                        break;
                                    }
                                }
                            }
                        } else {
                            data.wbYarns.push(...objectWarehouseArrayFiltered)
                        }
                    }
                    // --------------------- END wbYarns-----------------

                    // --------------------- START waYarns-----------------
                    // Check key type
                    if (key == "waYarns") {
                        let objectWarehouseArrayFiltered = []
                        objectWarehouseArrayFiltered.push(objectWarehouseArray[0])
                        let arrayOfYarns = [{
                            id: objectWarehouseArray[0].id,
                            warehouse_id: objectWarehouseArray[0].warehouse_id
                        }]
                        for (let q = 1; q < objectWarehouseArray.length; q++) {
                            const objectWarehouseArrayElement = objectWarehouseArray[q];

                            for (let w = 0; w < objectWarehouseArrayFiltered.length; w++) {
                                let objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[w];

                                if ( await this.checkFoundObjectInArray2Attr(arrayOfYarns, objectWarehouseArrayElement, 'id', 'warehouse_id')
                                //     arrayOfYarns.includes({
                                //     id: objectWarehouseArrayElement.id,
                                //     warehouse_id: objectWarehouseArrayElement.warehouse_id
                                // }, 0)
                                ) {
                                    // get index of element
                                    objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[await this.getIndexOfElement2Attr(objectWarehouseArrayFiltered, objectWarehouseArrayElement, 'id', 'warehouse_id')] 
                                    objectWarehouseArrayFilteredElement.needed_quantity = objectWarehouseArrayFilteredElement.needed_quantity + objectWarehouseArrayElement.needed_quantity
                                    objectWarehouseArrayFilteredElement.current_quantity = objectWarehouseArrayFilteredElement.current_quantity + objectWarehouseArrayElement.current_quantity
                                    objectWarehouseArrayFilteredElement.ordered_quantity = objectWarehouseArrayFilteredElement.ordered_quantity + objectWarehouseArrayElement.ordered_quantity
                                    break;
                                } else {
                                    objectWarehouseArrayFiltered.push(objectWarehouseArrayElement)
                                    arrayOfYarns.push({
                                        id: objectWarehouseArrayElement.id,
                                        warehouse_id: objectWarehouseArrayElement.warehouse_id
                                    })
                                    break;
                                    
                                }
                            }


                        }

                        if (data.waYarns.length > 0) {
                            let arrayOfYarns = data.waYarns.map(function (a) { return {
                                id: a.id,
                                warehouse_id: a.warehouse_id
                            } });
                            for (let e = 0; e < objectWarehouseArrayFiltered.length; e++) {
                                const objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[e];

                                for (let r = 0; r < data.waYarns.length; r++) {
                                    let waYarnsElement = data.waYarns[r];

                                    if ( await this.checkFoundObjectInArray2Attr(arrayOfYarns, objectWarehouseArrayFilteredElement, 'id', 'warehouse_id')
                                    //     arrayOfYarns.includes({
                                    //     id: objectWarehouseArrayFilteredElement.id,
                                    //     warehouse_id: objectWarehouseArrayFilteredElement.warehouse_id
                                    // }, 0)
                                    ) {
                                        // get index of element
                                        waYarnsElement = data.waYarns[await this.getIndexOfElement2Attr(data.waYarns, objectWarehouseArrayFilteredElement, 'id', 'warehouse_id')] 
                                        waYarnsElement.needed_quantity = waYarnsElement.needed_quantity + objectWarehouseArrayFiltered.needed_quantity
                                        waYarnsElement.current_quantity = waYarnsElement.current_quantity + objectWarehouseArrayFiltered.current_quantity
                                        waYarnsElement.ordered_quantity = waYarnsElement.ordered_quantity + objectWarehouseArrayFiltered.ordered_quantity
                                        break;
                                    } else {
                                        data.waYarns.push(objectWarehouseArrayFilteredElement)
                                        arrayOfYarns.push({
                                            id: objectWarehouseArrayFilteredElement.id,
                                            warehouse_id: objectWarehouseArrayFilteredElement.warehouse_id
                                        })
                                        break;
                                    }
                                }
                            }
                        } else {
                            data.waYarns.push(...objectWarehouseArrayFiltered)
                        }
                    }
                    // --------------------- END waYarns-----------------

                }
            }
        }

        resolve(data); // Yay! Everything went well!
    });

    return await myFirstPromise
};

exports.filterObjectsWarehousesOfParentArrayTotal = async (objectsWarehouses) => {
    let data = {}
    data.weFabrics = []
    data.wdFormFabrics = []
    data.wdFabrics = []
    data.wcFabrics = []
    data.wbYarns = []
    data.waYarns = []

    const myFirstPromise = new Promise(async (resolve, reject) => {

        for (const key in objectsWarehouses) {
            if (Object.hasOwnProperty.call(objectsWarehouses, key)) {
                const objectWarehouseArray = objectsWarehouses[key];

                if (objectWarehouseArray.length > 0) {

                    // --------------------- START weFabrics-----------------
                    // Check key type
                    if (key == "weFabrics") {
                        let objectWarehouseArrayFiltered = []
                        objectWarehouseArrayFiltered.push(objectWarehouseArray[0])
                        let arrayOfFabrics = [{
                            dyed_fabric_id: objectWarehouseArray[0].dyed_fabric_id,
                            color_id: objectWarehouseArray[0].colorId,
                            color_code: objectWarehouseArray[0].colorCode
                        }]

                        for (let q = 1; q < objectWarehouseArray.length; q++) {
                            const objectWarehouseArrayElement = objectWarehouseArray[q];

                            for (let w = 0; w < objectWarehouseArrayFiltered.length; w++) {
                                let objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[w];

                                if ( await this.checkFoundObjectInArray3Attr(
                                    arrayOfFabrics, objectWarehouseArrayElement, 
                                    'dyed_fabric_id',
                                    'color_id', 'color_code')
                                //     arrayOfFabrics.includes({
                                //     dyed_fabric_id: objectWarehouseArrayElement.dyed_fabric_id,
                                //     warehouse_id: objectWarehouseArrayElement.warehouse_id
                                // }, 0)
                                ) {
                                    // get index of element
                                    objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[await this.getIndexOfElement3Attr(objectWarehouseArrayFiltered, objectWarehouseArrayElement, 
                                        'dyed_fabric_id',
                                        'color_id', 'color_code',
                                        )] 
                                    objectWarehouseArrayFilteredElement.needed_quantity = objectWarehouseArrayFilteredElement.needed_quantity + objectWarehouseArrayElement.needed_quantity
                                    objectWarehouseArrayFilteredElement.current_quantity = objectWarehouseArrayFilteredElement.current_quantity + objectWarehouseArrayElement.current_quantity
                                    objectWarehouseArrayFilteredElement.ordered_quantity = objectWarehouseArrayFilteredElement.ordered_quantity + objectWarehouseArrayElement.ordered_quantity
                                    objectWarehouseArrayFilteredElement.existed_quantity = objectWarehouseArrayFilteredElement.existed_quantity + objectWarehouseArrayElement.existed_quantity
                                    break;

                                    // objectWarehouseArrayFilteredElement.needed_quantity = objectWarehouseArrayFilteredElement.needed_quantity + objectWarehouseArrayElement.needed_quantity
                                } else {
                                    objectWarehouseArrayFiltered.push(objectWarehouseArrayElement)
                                    arrayOfFabrics.push({
                                        dyed_fabric_id: objectWarehouseArrayElement.dyed_fabric_id,
                                        color_id: objectWarehouseArrayElement.colorId,
                                        color_code: objectWarehouseArrayElement.colorCode
                                    })
                                    break;
                                }
                            }


                        }

                        if (data.weFabrics.length > 0) {
                            let arrayOfFabrics = data.weFabrics.map(function (a) { return {
                                dyed_fabric_id: a.dyed_fabric_id,
                                color_id: a.color_id,
                                color_code: a.color_code
                            }; });
                            for (let e = 0; e < objectWarehouseArrayFiltered.length; e++) {
                                const objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[e];

                                for (let r = 0; r < data.weFabrics.length; r++) {
                                    let weFabricsElement = data.weFabrics[r];

                                    if ( await this.checkFoundObjectInArray3Attr(
                                        arrayOfFabrics, objectWarehouseArrayFilteredElement, 
                                        'dyed_fabric_id',
                                        'color_id', 'color_code')
                                    //     arrayOfFabrics.includes({
                                    //     dyed_fabric_id: objectWarehouseArrayFilteredElement.dyed_fabric_id
                                    // }, 0)
                                    ) {
                                        // get index of element
                                        weFabricsElement = data.weFabrics[await this.getIndexOfElement3Attr(data.weFabrics, objectWarehouseArrayFilteredElement, 
                                            'dyed_fabric_id',
                                            'color_id', 'color_code'
                                            )] 
                                        weFabricsElement.needed_quantity = weFabricsElement.needed_quantity + objectWarehouseArrayFiltered.needed_quantity
                                        weFabricsElement.current_quantity = weFabricsElement.current_quantity + objectWarehouseArrayFiltered.current_quantity
                                        weFabricsElement.ordered_quantity = weFabricsElement.ordered_quantity + objectWarehouseArrayFiltered.ordered_quantity
                                        weFabricsElement.existed_quantity = weFabricsElement.existed_quantity + objectWarehouseArrayFiltered.existed_quantity
                                        break;

                                        // weFabricsElement.needed_quantity = weFabricsElement.needed_quantity + objectWarehouseArrayFiltered.needed_quantity
                                    } else {
                                        data.weFabrics.push(objectWarehouseArrayFilteredElement)
                                        arrayOfFabrics.push({
                                            dyed_fabric_id: objectWarehouseArrayFilteredElement.dyed_fabric_id,
                                            color_id: objectWarehouseArrayFilteredElement.color_id,
                                            color_code: objectWarehouseArrayFilteredElement.color_code,
                                        })
                                        break;
                                    }
                                }
                            }
                        } else {
                            data.weFabrics.push(...objectWarehouseArrayFiltered)
                        }
                    }
                    // --------------------- END weFabrics-----------------

                    // --------------------- START wdFormFabrics-----------------
                    // Check key type
                    if (key == "wdFormFabrics") {
                        let objectWarehouseArrayFiltered = []
                        objectWarehouseArrayFiltered.push(objectWarehouseArray[0])
                        let arrayOfFabrics = [{
                            fabric_id: objectWarehouseArray[0].fabric_id
                        }]

                        for (let q = 1; q < objectWarehouseArray.length; q++) {
                            const objectWarehouseArrayElement = objectWarehouseArray[q];

                            for (let w = 0; w < objectWarehouseArrayFiltered.length; w++) {
                                let objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[w];

                                if ( await this.checkFoundObjectInArray1Attr(
                                    arrayOfFabrics, objectWarehouseArrayElement, 
                                    'fabric_id')
                                //     arrayOfFabrics.includes({
                                //     id: objectWarehouseArrayElement.id,
                                //     warehouse_id: objectWarehouseArrayElement.warehouse_id
                                // }, 0)
                                ) {
                                    // get index of element
                                    objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[await this.getIndexOfElement1Attr(objectWarehouseArrayFiltered, objectWarehouseArrayElement, 'fabric_id')] 
                                    objectWarehouseArrayFilteredElement.form_current_quantity = objectWarehouseArrayFilteredElement.form_current_quantity + objectWarehouseArrayElement.form_current_quantity
                                    objectWarehouseArrayFilteredElement.existed_quantity = objectWarehouseArrayFilteredElement.existed_quantity + objectWarehouseArrayElement.existed_quantity
                                    break;

                                } else {
                                    objectWarehouseArrayFiltered.push(objectWarehouseArrayElement)
                                    arrayOfFabrics.push({
                                        fabric_id: objectWarehouseArrayElement.fabric_id
                                    })
                                    break;
                                }
                            }
                        }

                        if (data.wdFormFabrics.length > 0) {
                            let arrayOfFabrics = data.wdFormFabrics.map(function (a) { return {
                                fabric_id: a.fabric_id
                            } });
                            for (let e = 0; e < objectWarehouseArrayFiltered.length; e++) {
                                const objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[e];

                                for (let r = 0; r < data.wdFormFabrics.length; r++) {
                                    let wdFormFabricsElement = data.wdFormFabrics[r];

                                    if ( await this.checkFoundObjectInArray1Attr(
                                        arrayOfFabrics, objectWarehouseArrayFilteredElement, 
                                        'fabric_id')
                                    //     arrayOfFabrics.includes({
                                    //     id: objectWarehouseArrayFilteredElement.id,
                                    //     warehouse_id: objectWarehouseArrayFilteredElement.warehouse_id
                                    // }, 0)
                                    ) {
                                        // get index of element
                                        wdFormFabricsElement = data.wdFormFabrics[await this.getIndexOfElement1Attr(data.wdFormFabrics, objectWarehouseArrayFilteredElement, 'fabric_id')] 
                                        wdFormFabricsElement.form_current_quantity = wdFormFabricsElement.form_current_quantity + objectWarehouseArrayFiltered.form_current_quantity
                                        wdFormFabricsElement.existed_quantity = wdFormFabricsElement.existed_quantity + objectWarehouseArrayFiltered.existed_quantity
                                        break;

                                    } else {
                                        data.wdFormFabrics.push(objectWarehouseArrayFilteredElement)
                                        arrayOfFabrics.push({
                                            fabric_id: objectWarehouseArrayFilteredElement.fabric_id
                                        })
                                        break;
                                    }
                                }
                            }
                        } else {
                            data.wdFormFabrics.push(...objectWarehouseArrayFiltered)
                        }
                    }
                    // --------------------- END wdFormFabrics-----------------


                    // --------------------- START wdFabrics-----------------
                    // Check key type
                    if (key == "wdFabrics") {
                        let objectWarehouseArrayFiltered = []
                        objectWarehouseArrayFiltered.push(objectWarehouseArray[0])
                        let arrayOfFabrics = [{
                            fabric_id: objectWarehouseArray[0].fabric_id
                        }]

                        for (let q = 1; q < objectWarehouseArray.length; q++) {
                            const objectWarehouseArrayElement = objectWarehouseArray[q];

                            for (let w = 0; w < objectWarehouseArrayFiltered.length; w++) {
                                let objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[w];

                                if ( await this.checkFoundObjectInArray1Attr(
                                    arrayOfFabrics, objectWarehouseArrayElement, 
                                    'fabric_id')
                                //     arrayOfFabrics.includes({
                                //     id: objectWarehouseArrayElement.id,
                                //     warehouse_id: objectWarehouseArrayElement.warehouse_id
                                // }, 0)
                                ) {
                                    // get index of element
                                    objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[await this.getIndexOfElement1Attr(objectWarehouseArrayFiltered, objectWarehouseArrayElement, 'fabric_id')] 
                                    objectWarehouseArrayFilteredElement.current_quantity = objectWarehouseArrayFilteredElement.current_quantity + objectWarehouseArrayElement.current_quantity
                                    objectWarehouseArrayFilteredElement.existed_quantity = objectWarehouseArrayFilteredElement.existed_quantity + objectWarehouseArrayElement.existed_quantity
                                    break;

                                } else {
                                    objectWarehouseArrayFiltered.push(objectWarehouseArrayElement)
                                    arrayOfFabrics.push({
                                        fabric_id: objectWarehouseArrayElement.fabric_id
                                    })
                                    break;
                                }
                            }
                        }

                        if (data.wdFabrics.length > 0) {
                            let arrayOfFabrics = data.wdFabrics.map(function (a) { return {
                                fabric_id: a.fabric_id
                            } });
                            for (let e = 0; e < objectWarehouseArrayFiltered.length; e++) {
                                const objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[e];

                                for (let r = 0; r < data.wdFabrics.length; r++) {
                                    let wdFabricsElement = data.wdFabrics[r];

                                    if ( await this.checkFoundObjectInArray1Attr(
                                        arrayOfFabrics, objectWarehouseArrayFilteredElement, 
                                        'fabric_id')
                                    //     arrayOfFabrics.includes({
                                    //     id: objectWarehouseArrayFilteredElement.id,
                                    //     warehouse_id: objectWarehouseArrayFilteredElement.warehouse_id
                                    // }, 0)
                                    ) {
                                        // get index of element
                                        wdFabricsElement = data.wdFabrics[await this.getIndexOfElement1Attr(data.wdFabrics, objectWarehouseArrayFilteredElement, 'fabric_id')] 
                                        wdFabricsElement.current_quantity = wdFabricsElement.current_quantity + objectWarehouseArrayFiltered.current_quantity
                                        wdFabricsElement.existed_quantity = wdFabricsElement.existed_quantity + objectWarehouseArrayFiltered.existed_quantity
                                        break;

                                    } else {
                                        data.wdFabrics.push(objectWarehouseArrayFilteredElement)
                                        arrayOfFabrics.push({
                                            fabric_id: objectWarehouseArrayFilteredElement.fabric_id
                                        })
                                        break;
                                    }
                                }
                            }
                        } else {
                            data.wdFabrics.push(...objectWarehouseArrayFiltered)
                        }
                    }
                    // --------------------- END wdFabrics-----------------

                    // --------------------- START wcFabrics-----------------
                    // Check key type
                    if (key == "wcFabrics") {
                        let objectWarehouseArrayFiltered = []
                        objectWarehouseArrayFiltered.push(objectWarehouseArray[0])
                        let arrayOfFabrics = [{
                            id: objectWarehouseArray[0].id
                        }]

                        for (let q = 1; q < objectWarehouseArray.length; q++) {
                            const objectWarehouseArrayElement = objectWarehouseArray[q];

                            for (let w = 0; w < objectWarehouseArrayFiltered.length; w++) {
                                let objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[w];

                                if ( await this.checkFoundObjectInArray1Attr(
                                    arrayOfFabrics, objectWarehouseArrayElement, 
                                    'id')
                                //     arrayOfFabrics.includes({
                                //     id: objectWarehouseArrayElement.id,
                                //     warehouse_id: objectWarehouseArrayElement.warehouse_id
                                // }, 0)
                                ) {
                                    // get index of element
                                    objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[await this.getIndexOfElement1Attr(objectWarehouseArrayFiltered, objectWarehouseArrayElement, 'id')] 
                                    objectWarehouseArrayFilteredElement.needed_quantity = objectWarehouseArrayFilteredElement.needed_quantity + objectWarehouseArrayElement.needed_quantity
                                    objectWarehouseArrayFilteredElement.current_quantity = objectWarehouseArrayFilteredElement.current_quantity + objectWarehouseArrayElement.current_quantity
                                    objectWarehouseArrayFilteredElement.ordered_quantity = objectWarehouseArrayFilteredElement.ordered_quantity + objectWarehouseArrayElement.ordered_quantity
                                    objectWarehouseArrayFilteredElement.existed_quantity = objectWarehouseArrayFilteredElement.existed_quantity + objectWarehouseArrayElement.existed_quantity
                                    break;

                                    // objectWarehouseArrayFilteredElement.needed_quantity = objectWarehouseArrayFilteredElement.needed_quantity + objectWarehouseArrayElement.needed_quantity
                                } else {
                                    objectWarehouseArrayFiltered.push(objectWarehouseArrayElement)
                                    arrayOfFabrics.push({
                                        id: objectWarehouseArrayElement.id
                                    })
                                    break;
                                }
                            }


                        }

                        if (data.wcFabrics.length > 0) {
                            let arrayOfFabrics = data.wcFabrics.map(function (a) { return {
                                id: a.id
                            }; });
                            for (let e = 0; e < objectWarehouseArrayFiltered.length; e++) {
                                const objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[e];

                                for (let r = 0; r < data.wcFabrics.length; r++) {
                                    let wcFabricsElement = data.wcFabrics[r];

                                    if ( await this.checkFoundObjectInArray1Attr(
                                        arrayOfFabrics, objectWarehouseArrayFilteredElement, 
                                        'id')
                                    //     arrayOfFabrics.includes({
                                    //     id: objectWarehouseArrayFilteredElement.id,
                                    //     warehouse_id: objectWarehouseArrayFilteredElement.warehouse_id
                                    // }, 0)
                                    ) {
                                        // get index of element
                                        wcFabricsElement = data.wcFabrics[await this.getIndexOfElement1Attr(data.wcFabrics, objectWarehouseArrayFilteredElement, 'id')] 
                                        wcFabricsElement.needed_quantity = wcFabricsElement.needed_quantity + objectWarehouseArrayFiltered.needed_quantity
                                        wcFabricsElement.current_quantity = wcFabricsElement.current_quantity + objectWarehouseArrayFiltered.current_quantity
                                        wcFabricsElement.ordered_quantity = wcFabricsElement.ordered_quantity + objectWarehouseArrayFiltered.ordered_quantity
                                        wcFabricsElement.existed_quantity = wcFabricsElement.existed_quantity + objectWarehouseArrayFiltered.existed_quantity
                                        break;

                                        // wcFabricsElement.needed_quantity = wcFabricsElement.needed_quantity + objectWarehouseArrayFiltered.needed_quantity
                                    } else {
                                        data.wcFabrics.push(objectWarehouseArrayFilteredElement)
                                        arrayOfFabrics.push({
                                            id: objectWarehouseArrayFilteredElement.id
                                        })
                                        break;
                                    }
                                }
                            }
                        } else {
                            data.wcFabrics.push(...objectWarehouseArrayFiltered)
                        }
                    }
                    // --------------------- END wcFabrics-----------------


                    // --------------------- START wbYarns-----------------
                    // Check key type
                    if (key == "wbYarns") {
                        let objectWarehouseArrayFiltered = []
                        objectWarehouseArrayFiltered.push(objectWarehouseArray[0])
                        let arrayOfYarns = [{
                            yarn_id: objectWarehouseArray[0].yarn_id
                        }]

                        for (let q = 1; q < objectWarehouseArray.length; q++) {
                            const objectWarehouseArrayElement = objectWarehouseArray[q];

                            for (let w = 0; w < objectWarehouseArrayFiltered.length; w++) {
                                let objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[w];

                                if ( await this.checkFoundObjectInArray1Attr(arrayOfYarns, objectWarehouseArrayElement, 'yarn_id')
                                //     arrayOfYarns.includes({
                                //     id: objectWarehouseArrayElement.id,
                                //     warehouse_id: objectWarehouseArrayElement.warehouse_id
                                // }, 0)
                                ) {
                                    // get index of element
                                    objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[await this.getIndexOfElement1Attr(objectWarehouseArrayFiltered, objectWarehouseArrayElement, 'yarn_id')] 
                                    objectWarehouseArrayFilteredElement.current_quantity = objectWarehouseArrayFilteredElement.current_quantity + objectWarehouseArrayElement.current_quantity
                                    break;
                                } else {
                                    objectWarehouseArrayFiltered.push(objectWarehouseArrayElement)
                                    arrayOfYarns.push({
                                        yarn_id: objectWarehouseArrayElement.yarn_id
                                    })
                                    break;
                                    
                                }
                            }
                        }

                        if (data.wbYarns.length > 0) {
                            let arrayOfYarns = data.wbYarns.map(function (a) { return {
                                yarn_id: a.yarn_id
                            } });
                            for (let e = 0; e < objectWarehouseArrayFiltered.length; e++) {
                                const objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[e];

                                for (let r = 0; r < data.wbYarns.length; r++) {
                                    let wbYarnsElement = data.wbYarns[r];

                                    if ( await this.checkFoundObjectInArray1Attr(arrayOfYarns, objectWarehouseArrayFilteredElement, 'yarn_id')
                                    //     arrayOfYarns.includes({
                                    //     id: objectWarehouseArrayFilteredElement.id,
                                    //     warehouse_id: objectWarehouseArrayFilteredElement.warehouse_id
                                    // }, 0)
                                    ) {
                                        // get index of element
                                        wbYarnsElement = data.wbYarns[await this.getIndexOfElement1Attr(data.wbYarns, objectWarehouseArrayFilteredElement, 'yarn_id')] 
                                        // wbYarnsElement.needed_quantity = wbYarnsElement.needed_quantity + objectWarehouseArrayFiltered.needed_quantity
                                        wbYarnsElement.current_quantity = wbYarnsElement.current_quantity + objectWarehouseArrayFiltered.current_quantity
                                        break;
                                    } else {
                                        data.wbYarns.push(objectWarehouseArrayFilteredElement)
                                        arrayOfYarns.push({
                                            yarn_id: objectWarehouseArrayFilteredElement.yarn_id
                                        })
                                        break;
                                    }
                                }
                            }
                        } else {
                            data.wbYarns.push(...objectWarehouseArrayFiltered)
                        }
                    }
                    // --------------------- END wbYarns-----------------

                    // --------------------- START waYarns-----------------
                    // Check key type
                    if (key == "waYarns") {
                        // console.log("objectWarehouseArray ::::::::::::::: ", objectWarehouseArray);
                        let objectWarehouseArrayFiltered = []
                        objectWarehouseArrayFiltered.push(objectWarehouseArray[0])
                        let arrayOfYarns = [{
                            id: objectWarehouseArray[0].id
                        }]
                        for (let q = 1; q < objectWarehouseArray.length; q++) {
                            const objectWarehouseArrayElement = objectWarehouseArray[q];

                            for (let w = 0; w < objectWarehouseArrayFiltered.length; w++) {
                                let objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[w];

                                if ( await this.checkFoundObjectInArray1Attr(arrayOfYarns, objectWarehouseArrayElement, 'id')
                                //     arrayOfYarns.includes({
                                //     id: objectWarehouseArrayElement.id,
                                //     warehouse_id: objectWarehouseArrayElement.warehouse_id
                                // }, 0)
                                ) {
                                    // get index of element
                                    objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[await this.getIndexOfElement1Attr(objectWarehouseArrayFiltered, objectWarehouseArrayElement, 'id')] 
                                    objectWarehouseArrayFilteredElement.needed_quantity = objectWarehouseArrayFilteredElement.needed_quantity + objectWarehouseArrayElement.needed_quantity
                                    objectWarehouseArrayFilteredElement.current_quantity = objectWarehouseArrayFilteredElement.current_quantity + objectWarehouseArrayElement.current_quantity
                                    objectWarehouseArrayFilteredElement.ordered_quantity = objectWarehouseArrayFilteredElement.ordered_quantity + objectWarehouseArrayElement.ordered_quantity
                                    break;
                                } else {
                                    objectWarehouseArrayFiltered.push(objectWarehouseArrayElement)
                                    arrayOfYarns.push({
                                        id: objectWarehouseArrayElement.id
                                    })
                                    break;
                                    
                                }
                            }


                        }

                        if (data.waYarns.length > 0) {
                            let arrayOfYarns = data.waYarns.map(function (a) { return {
                                id: a.id
                            } });
                            for (let e = 0; e < objectWarehouseArrayFiltered.length; e++) {
                                const objectWarehouseArrayFilteredElement = objectWarehouseArrayFiltered[e];

                                for (let r = 0; r < data.waYarns.length; r++) {
                                    let waYarnsElement = data.waYarns[r];

                                    if ( await this.checkFoundObjectInArray1Attr(arrayOfYarns, objectWarehouseArrayFilteredElement, 'id')
                                    //     arrayOfYarns.includes({
                                    //     id: objectWarehouseArrayFilteredElement.id,
                                    //     warehouse_id: objectWarehouseArrayFilteredElement.warehouse_id
                                    // }, 0)
                                    ) {
                                        // get index of element
                                        waYarnsElement = data.waYarns[await this.getIndexOfElement1Attr(data.waYarns, objectWarehouseArrayFilteredElement, 'id')] 
                                        waYarnsElement.needed_quantity = waYarnsElement.needed_quantity + objectWarehouseArrayFiltered.needed_quantity
                                        waYarnsElement.current_quantity = waYarnsElement.current_quantity + objectWarehouseArrayFiltered.current_quantity
                                        waYarnsElement.ordered_quantity = waYarnsElement.ordered_quantity + objectWarehouseArrayFiltered.ordered_quantity
                                        break;
                                    } else {
                                        data.waYarns.push(objectWarehouseArrayFilteredElement)
                                        arrayOfYarns.push({
                                            id: objectWarehouseArrayFilteredElement.id
                                        })
                                        break;
                                    }
                                }
                            }
                        } else {
                            data.waYarns.push(...objectWarehouseArrayFiltered)
                        }
                    }
                    // --------------------- END waYarns-----------------

                }
            }
        }

        resolve(data); // Yay! Everything went well!
    });

    return await myFirstPromise
};


exports.checkFoundObjectInArray1Attr = async (array, object, attr1) => {
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        
        if(element[attr1] == object[attr1] ) {
            return true
        }
    }
    return false

}

exports.checkFoundObjectInArray2Attr = async (array, object, attr1, attr2) => {
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        
        if(element[attr1] == object[attr1] && element[attr2] == object[attr2]) {
            return true
        }
    }
    return false

}

exports.checkFoundObjectInArray4Attr = async (array, object, attr1, attr2, attr3, attr4) => {
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        
        if(element[attr1] == object[attr1] && element[attr2] == object[attr2] 
            && element[attr3] == object[attr3] && element[attr4] == object[attr4]) {
            return true
        }
    }
    return false

}

exports.checkFoundObjectInArray3Attr = async (array, object, attr1, attr2, attr3) => {
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        
        if(element[attr1] == object[attr1] && element[attr2] == object[attr2] 
            && element[attr3] == object[attr3] ) {
            return true
        }
    }
    return false

}

exports.getIndexOfElement1Attr = async (searchArray, goalObject, attr1) => {
    for (let i = 0; i < searchArray.length; i++) {
        const element = searchArray[i];
        
        if(element[attr1] == goalObject[attr1]) {
            return i
        }
    }
    return 0
}

exports.getIndexOfElement2Attr = async (searchArray, goalObject, attr1, attr2) => {
    for (let i = 0; i < searchArray.length; i++) {
        const element = searchArray[i];
        
        if(element[attr1] == goalObject[attr1] && element[attr2] == goalObject[attr2]) {
            return i
        }
    }
    return 0
}

exports.getIndexOfElement3Attr = async (searchArray, goalObject, attr1, attr2, attr3) => {
    for (let i = 0; i < searchArray.length; i++) {
        const element = searchArray[i];
        
        if(element[attr1] == goalObject[attr1] && element[attr2] == goalObject[attr2] &&
            element[attr3] == goalObject[attr3] 
            ) {
            return i
        }
    }
    return 0
}

exports.getIndexOfElement4Attr = async (searchArray, goalObject, attr1, attr2, attr3, attr4) => {
    for (let i = 0; i < searchArray.length; i++) {
        const element = searchArray[i];
        
        if(element[attr1] == goalObject[attr1] && element[attr2] == goalObject[attr2] &&
            element[attr3] == goalObject[attr3] && element[attr4] == goalObject[attr4]
            ) {
            return i
        }
    }
    return 0
}

