const moment = require("moment")

// Service
const waService = require("../../services/wa/wa");
const waReportQueries = require("../../db/queries/wa/wa-report");

// Queries
const yarnQueries = require("../../db/queries/general/yarn");
const waQueries = require("../../db/queries/wa/wa");
const generalQueries = require("../../db/queries/general/general");
const waAddRequisitionDetailsQueries = require("../../db/queries/wa/wa-add-requisition-details");
const waSellRequisitionDetailsQueries = require("../../db/queries/wa/wa-sell-requisition-details");
const waReturnRequisitionDetailsQueries = require("../../db/queries/wa/wa-return-requisition-details");
const waReconciliationRequisitionDetailsQueries = require("../../db/queries/wa/wa-reconciliation-requisition-details");
const wbTransportWaWbDetailsQueries = require("../../db/queries/wb/wb-transport-wa-wb-details");
const wbTransportRequisitionWbWaDetailsQueries = require("../../db/queries/wb/wb-transport-requisition-wb-wa-details");
const bussinessmanService = require("../../services/general/bussinessman");

// Util
const constantsPayloads = require("../../util/constants-payloads");
const { warehouseTableName } = require("../../util/database-tables-name");
const yarnTableName = require("../../util/database-tables-name").yarnTableName;
const waTableName = require("../../util/database-tables-name").waTableName;
const waReconciliationRequisitionDetailsTableName = require("../../util/database-tables-name").waReconciliationRequisitionDetailsTableName;
const waAddRequisitionTableName = require("../../util/database-tables-name").waAddRequisitionTableName;
const waAddRequisitionDetailsTableName = require("../../util/database-tables-name").waAddRequisitionDetailsTableName;

exports.selectInventoryTotal = async (yarnReport) => {
    let data = []

    let yarnWhereCluse = {};
    yarnWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    yarnWhereCluse[`${yarnTableName}.is_active`] = 1;
    yarnWhereCluse[`${waTableName}.is_deleted`] = 0;
    yarnWhereCluse[`${waTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${yarnTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transportWbWaWhereCluse = {};
    transportWbWaWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${yarnTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${waTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.type`] = constantsPayloads.transportFromBToAType;

    let whereCluseArray = [yarnWhereCluse, reconciliationWhereCluse, transportWbWaWhereCluse]

    // select yarns 
    const yarns = (yarnReport.isShowClosedBalances == 1) ? await yarnQueries.selectStoredWaYarnsAndWarehouses(whereCluseArray, 0) : await yarnQueries.selectStoredWaYarnsAndWarehouses(whereCluseArray)
    if (yarns[0] != null) {
        for (let i = 0; i < yarns.length; i++) {
            let yarn = yarns[i];
            let callArray = []

            // Select Max Added Date
            let maxDateWhereCluse = {};
            maxDateWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarn.id;
            const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(waAddRequisitionTableName,
                { date: 'date' }, maxDateWhereCluse,
                waAddRequisitionDetailsTableName,
                `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`,
                `${waAddRequisitionTableName}.id`)
            if (selectMaxDate[0] != null) {
                // Select Latest Price
                let waAddRequisitionDetailsWhereCluse = {};
                waAddRequisitionDetailsWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarn.id;
                waAddRequisitionDetailsWhereCluse[`${waAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
                const latestPrice = await waAddRequisitionDetailsQueries.selectLatestPrice(waAddRequisitionDetailsWhereCluse)
                yarn.latest_price = latestPrice[0]?.price
            } else {
                yarn.latest_price = 0
            }
            // Get Sum Current Quantity Of yarn 
            // const sumCurrentQuantity = await waService.selectSumCurrentQuantityByYarnWa(yarn.id)
            // yarn.current_quantity = sumCurrentQuantity[0].current_quantity

            data.push(yarn)

            callArray.push(waAddRequisitionDetailsQueries.selectTotalByYarnByWarehouseId(yarn.id, yarn.warehouse_id))
            callArray.push(waSellRequisitionDetailsQueries.selectTotalByYarnByWarehouseId(yarn.id, yarn.warehouse_id))
            callArray.push(waReturnRequisitionDetailsQueries.selectTotalByYarnByWarehouseId(yarn.id, yarn.warehouse_id))
            callArray.push(waReconciliationRequisitionDetailsQueries.selectTotalByYarnByWarehouseId(yarn.id, yarn.warehouse_id))
            callArray.push(wbTransportWaWbDetailsQueries.selectTotalByYarnByWarehouseId(yarn.id, yarn.warehouse_id))
            callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectTotalByYarnByWarehouseId(yarn.id, yarn.warehouse_id))
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

exports.selectInventoryTotalByYarnByWarehouse = async (yarnId, warehouseId) => {
    let callArray = []

    callArray.push(waAddRequisitionDetailsQueries.selectTotalDetailsByYarnIdByWarehouseId(yarnId, warehouseId))
    callArray.push(waSellRequisitionDetailsQueries.selectTotalDetailsByYarnIdByWarehouseId(yarnId, warehouseId))
    callArray.push(waReturnRequisitionDetailsQueries.selectTotalDetailsByYarnIdByWarehouseId(yarnId, warehouseId))
    callArray.push(waReconciliationRequisitionDetailsQueries.selectTotalDetailsByYarnIdByWarehouseId(yarnId, warehouseId))
    callArray.push(wbTransportWaWbDetailsQueries.selectTotalDetailsByYarnIdByWarehouseId(yarnId, warehouseId))
    callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectTotalDetailsByYarnIdByWarehouseId(yarnId, warehouseId))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5]].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
    maxDateWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
    const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(waAddRequisitionTableName,
        { date: 'date' }, maxDateWhereCluse,
        waAddRequisitionDetailsTableName,
        `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`,
        `${waAddRequisitionTableName}.id`)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let waAddRequisitionDetailsWhereCluse = {};
        waAddRequisitionDetailsWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
        waAddRequisitionDetailsWhereCluse[`${waAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await waAddRequisitionDetailsQueries.selectLatestPrice(waAddRequisitionDetailsWhereCluse)
        if (latestPrice[0] != null) {
            sortedAsc[0].latest_price = latestPrice[0]?.price
        } else {
            sortedAsc[0].latest_price = 0
        }
    } else {
        sortedAsc[0].latest_price = 0
    }
    return sortedAsc;
};

exports.selectInventoryDetails = async (yarnReport) => {
    let data = []

    let yarnWhereCluse = {};
    yarnWhereCluse[`${waTableName}.is_deleted`] = 0;
    yarnWhereCluse[`${waTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transportWbWaWhereCluse = {};
    transportWbWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${waTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.type`] = constantsPayloads.transportFromBToAType;

    let whereCluseArray = [yarnWhereCluse, reconciliationWhereCluse, transportWbWaWhereCluse]

    // select warehousesYarnsLots 
    const warehousesYarnsLots = (yarnReport.isShowClosedBalances == 1) ? await waQueries.selectStoredWarehouseAndYarnAndYarnLot(whereCluseArray, 0) : await waQueries.selectStoredWarehouseAndYarnAndYarnLot(whereCluseArray)
    if (warehousesYarnsLots[0] != null) {
        for (let i = 0; i < warehousesYarnsLots.length; i++) {
            let warehouseYarnLot = warehousesYarnsLots[i];
            let callArray = []

            // Select Max Added Date
            let maxDateWhereCluse = {};
            maxDateWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = warehouseYarnLot.yarn_id;
            maxDateWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_lot_id`] = warehouseYarnLot.yarn_lot_id;
            const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(waAddRequisitionTableName,
                { date: 'date' }, maxDateWhereCluse,
                waAddRequisitionDetailsTableName,
                `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`,
                `${waAddRequisitionTableName}.id`)
            if (selectMaxDate[0] != null) {
                // Select Latest Price
                let waAddRequisitionDetailsWhereCluse = {};
                waAddRequisitionDetailsWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = warehouseYarnLot.yarn_id;
                waAddRequisitionDetailsWhereCluse[`${waAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
                const latestPrice = await waAddRequisitionDetailsQueries.selectLatestPrice(waAddRequisitionDetailsWhereCluse)
                warehouseYarnLot.latest_price = latestPrice[0]?.price
            } else {
                warehouseYarnLot.latest_price = 0
            }
            // Get Sum Current Quantity Of warehouseYarnLot 
            // const sumCurrentQuantity = await waService.selectSumCurrentQuantityByYarnWa(warehouseYarnLot.id)
            // warehouseYarnLot.current_quantity = sumCurrentQuantity[0].current_quantity

            data.push(warehouseYarnLot)

            callArray.push(waAddRequisitionDetailsQueries.selectDetailsByWarehouseByYarnByLot(
                warehouseYarnLot.warehouse_id, warehouseYarnLot.yarn_id, warehouseYarnLot.yarn_lot_id, warehouseYarnLot.consigment_yarn_id
            ))
            callArray.push(waSellRequisitionDetailsQueries.selectDetailsByWarehouseByYarnByLot(
                warehouseYarnLot.warehouse_id, warehouseYarnLot.yarn_id, warehouseYarnLot.yarn_lot_id, warehouseYarnLot.consigment_yarn_id
            ))
            callArray.push(waReturnRequisitionDetailsQueries.selectDetailsByWarehouseByYarnByLot(
                warehouseYarnLot.warehouse_id, warehouseYarnLot.yarn_id, warehouseYarnLot.yarn_lot_id, warehouseYarnLot.consigment_yarn_id
            ))
            callArray.push(waReconciliationRequisitionDetailsQueries.selectDetailsByWarehouseByYarnByLot(
                warehouseYarnLot.warehouse_id, warehouseYarnLot.yarn_id, warehouseYarnLot.yarn_lot_id, warehouseYarnLot.consigment_yarn_id
            ))
            callArray.push(wbTransportWaWbDetailsQueries.selectDetailsByWarehouseByYarnByLot(
                warehouseYarnLot.warehouse_id, warehouseYarnLot.yarn_id, warehouseYarnLot.yarn_lot_id, warehouseYarnLot.consigment_yarn_id
            ))
            callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectDetailsByWarehouseByYarnByLot(
                warehouseYarnLot.warehouse_id, warehouseYarnLot.yarn_id, warehouseYarnLot.yarn_lot_id, warehouseYarnLot.consigment_yarn_id
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

exports.selectInventoryDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId) => {
    let callArray = []

    callArray.push(waAddRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByYarnByLot(warehouseId, yarnId, yarnLotId, consigmentYarnId))
    callArray.push(waSellRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByYarnByLot(warehouseId, yarnId, yarnLotId, consigmentYarnId))
    callArray.push(waReturnRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByYarnByLot(warehouseId, yarnId, yarnLotId, consigmentYarnId))
    callArray.push(waReconciliationRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByYarnByLot(warehouseId, yarnId, yarnLotId, consigmentYarnId))
    callArray.push(wbTransportWaWbDetailsQueries.selectDetailsDetailsByWarehouseByYarnByLot(warehouseId, yarnId, yarnLotId, consigmentYarnId))
    callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectDetailsDetailsByWarehouseByYarnByLot(warehouseId, yarnId, yarnLotId, consigmentYarnId))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4], 
    ...requisitions[5]].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
    maxDateWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
    maxDateWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_lot_id`] = yarnLotId;
    const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(waAddRequisitionTableName,
        { date: 'date' }, maxDateWhereCluse,
        waAddRequisitionDetailsTableName,
        `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`,
        `${waAddRequisitionTableName}.id`)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let waAddRequisitionDetailsWhereCluse = {};
        waAddRequisitionDetailsWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
        waAddRequisitionDetailsWhereCluse[`${waAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await waAddRequisitionDetailsQueries.selectLatestPrice(waAddRequisitionDetailsWhereCluse)
        sortedAsc[0].latest_price = latestPrice[0]?.price
    } else {
        sortedAsc[0].latest_price = 0
    }
    return sortedAsc;
};

exports.selectPriceWa = async (yarnId, consigmentYarnId) => {
    let callArray = []

    callArray.push(waAddRequisitionDetailsQueries.selectPriceByYarnId(yarnId))
    callArray.push(waSellRequisitionDetailsQueries.selectPriceByYarnId(yarnId))
    callArray.push(waReturnRequisitionDetailsQueries.selectPriceByYarnId(yarnId))
    callArray.push(waReconciliationRequisitionDetailsQueries.selectPriceByYarnId(yarnId))
    callArray.push(wbTransportWaWbDetailsQueries.selectPriceByYarnId(yarnId))
    callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectPriceByYarnId(yarnId))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4], 
    ...requisitions[5]].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
    maxDateWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
    const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(waAddRequisitionTableName,
        { date: 'date' }, maxDateWhereCluse,
        waAddRequisitionDetailsTableName,
        `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`,
        `${waAddRequisitionTableName}.id`)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let waAddRequisitionDetailsWhereCluse = {};
        waAddRequisitionDetailsWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
        waAddRequisitionDetailsWhereCluse[`${waAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await waAddRequisitionDetailsQueries.selectLatestPrice(waAddRequisitionDetailsWhereCluse)
        if (latestPrice[0] != null) {
            sortedAsc[0].latest_price = latestPrice[0]?.price
        } else {
            sortedAsc[0].latest_price = 0
        }

        // Select Latest Consignment Price
        let waAddRequisitionDetailsByConsigmentWhereCluse = {};
        waAddRequisitionDetailsByConsigmentWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
        waAddRequisitionDetailsByConsigmentWhereCluse[`${waAddRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
        waAddRequisitionDetailsByConsigmentWhereCluse[`${waAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
        const latestConsigmentPrice = await waAddRequisitionDetailsQueries.selectLatestPrice(waAddRequisitionDetailsByConsigmentWhereCluse)
        if (latestConsigmentPrice[0] != null) {
            sortedAsc[0].latest_consigment_price = latestConsigmentPrice[0]?.price
        } else {
            sortedAsc[0].latest_consigment_price = 0
        }
    } else {
        sortedAsc[0].latest_price = 0
        sortedAsc[0].latest_consigment_price = 0
    }
    return sortedAsc;
};

exports.purchasesByYarn = async (yarnId) => {
    let whereCluse = {};
    whereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
    const results = await waReportQueries.purchasesYarns(whereCluse, "date");
    return results;
};

exports.purchasesBySupplier = async (supplierId) => {
    let whereCluse = {};
    whereCluse[`${waAddRequisitionTableName}.supplier_id`] = supplierId;
    const results = await waReportQueries.purchasesYarns(whereCluse, "yarn_id");
    return results;
};

exports.purchasesBySuppliers = async () => {

    const suppliers = await bussinessmanService.selectSuppliersBoughtFromWa()
    for (let i = 0; i < suppliers.length; i++) {
        const supplier = suppliers[i];

        let whereCluse = {};
        whereCluse[`${waAddRequisitionTableName}.supplier_id`] = supplier.id;
        const results = await waReportQueries.purchasesBySuppliers(whereCluse);

        if (results[0] != null) {
            let data = Object.assign(suppliers[i], results[0]);
            suppliers[i] = data
        }
    }
    suppliers.sort(function (a, b) { return b.quantity - a.quantity });
    return suppliers
};

exports.selectInventoryTotalByDate = async (bodyPalod) => {
    let callArray = []

    callArray.push(waAddRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPalod))
    callArray.push(waSellRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPalod))
    callArray.push(waReturnRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPalod))
    callArray.push(waReconciliationRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPalod))
    callArray.push(wbTransportWaWbDetailsQueries.selectTotalDetailsByDate(bodyPalod))
    callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectTotalDetailsByDate(bodyPalod))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4], 
    ...requisitions[5]].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    return sortedAsc;
};

exports.inquireYarnAvilabilityReportWa = async (yarnId) => {

    let warehouseWhereCluse = {};
    warehouseWhereCluse[`${warehouseTableName}.is_stock`] = 1;
    warehouseWhereCluse[`${warehouseTableName}.is_deleted`] = 0;
    warehouseWhereCluse[`${warehouseTableName}.is_active`] = 1;

    let yarnWhereCluse = {};
    yarnWhereCluse[`${yarnTableName}.id`] = yarnId;
    yarnWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    yarnWhereCluse[`${yarnTableName}.is_active`] = 1;
    yarnWhereCluse[`${waTableName}.is_deleted`] = 0;
    yarnWhereCluse[`${waTableName}.is_active`] = 1;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${yarnTableName}.id`] = yarnId;
    reconciliationWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${yarnTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;

    let transportWbWaWhereCluse = {};
    transportWbWaWhereCluse[`${yarnTableName}.id`] = yarnId;
    transportWbWaWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${yarnTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${waTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.type`] = constantsPayloads.transportFromBToAType;

    let waWhereCluseArray = [
        yarnWhereCluse, reconciliationWhereCluse, 
        transportWbWaWhereCluse, warehouseWhereCluse
    ]

    // select wa Yarn 
    let waYarns = await yarnQueries.selectStoredWaYarnsAndWarehousesForInquireFabricAvilability(waWhereCluseArray)
    return waYarns
};