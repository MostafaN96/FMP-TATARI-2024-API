const moment = require("moment")

// Service
const waReportQueries = require("../../db/queries/wa/wa-report");
const bussinessmanService = require("../../services/general/bussinessman");
const fabricYarnsService = require("../../services/general/fabric-yarns");
const weReportService = require("../../services/we/we-report");

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
const waExecuteOrderRequisitionDetailsQueries = require("../../db/queries/wa/wa-execute-order-requisition-details");
const waTransitionBetweenWHRequisitionDetailsQueries = require("../../db/queries/wa/wa-transition-between-wh-requisition-details");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { warehouseTableName, 
    yarnTableName,
    waTableName,
    waReconciliationRequisitionDetailsTableName,
    waAddRequisitionTableName,
    waAddRequisitionDetailsTableName,
    wbTransportWaWbDetailsTableName

} = require("../../util/database-tables-name");

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
    reconciliationWhereCluse[`${waTableName}.type`] = constantsPayloads.reconcilitionType;

    let transportWbWaWhereCluse = {};
    transportWbWaWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${yarnTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${waTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.type`] = constantsPayloads.transportFromBToAType;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${yarnTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${waTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${waTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${waTableName}.type`] = constantsPayloads.transportBetweenType;

    let whereCluseArray = [
        yarnWhereCluse, 
        reconciliationWhereCluse, 
        transportWbWaWhereCluse, 
        transitionBetweenWhWhereCluse
    ]

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
                yarn.latest_price_dollar = latestPrice[0]?.price_dollar
            } else {
                yarn.latest_price = 0
                yarn.latest_price_dollar = 0
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
            // callArray.push(waExecuteOrderRequisitionDetailsQueries.selectFromWarehouseTotalByYarnIdByWarehouseId(yarn.id, yarn.warehouse_id))
            // callArray.push(waExecuteOrderRequisitionDetailsQueries.selectToWarehouseTotalByYarnIdByWarehouseId(yarn.id, yarn.warehouse_id))
            callArray.push(waTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseTotalByYarnIdByWarehouseId(yarn.id, yarn.warehouse_id))
            callArray.push(waTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseTotalByYarnIdByWarehouseId(yarn.id, yarn.warehouse_id))

            const requisitions = await Promise.all(callArray)
            const sortedAsc = [...requisitions[0], ...requisitions[1],
            ...requisitions[2], ...requisitions[3], ...requisitions[4],
            ...requisitions[5], ...requisitions[6], ...requisitions[7]
        ].sort(
                (objA, objB) => moment(objA.date) - moment(objB.date)
            );

                        // ✅ حساب إجمالي الإدخال والإخراج لكل Yarn
            const totalInput = sortedAsc
            .filter(d => d.input_output == 1) // الإدخالات فقط
            .reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

            const totalOutput = sortedAsc
            .filter(d => d.input_output == 0) // الإخراجات فقط
            .reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

            // ✅ حفظ القيم داخل الكائن الأساسي
            data[i].input_quantity = parseFloat((totalInput).toFixed(2));
            data[i].output_quantity = parseFloat((totalOutput).toFixed(2));

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
    // callArray.push(waExecuteOrderRequisitionDetailsQueries.selectFromWarehouseTotalDetailsByYarnIdByWarehouseId(yarnId, warehouseId))
    // callArray.push(waExecuteOrderRequisitionDetailsQueries.selectToWarehouseTotalDetailsByYarnIdByWarehouseId(yarnId, warehouseId))
    callArray.push(waTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseTotalDetailsByYarnIdByWarehouseId(yarnId, warehouseId))
    callArray.push(waTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseTotalDetailsByYarnIdByWarehouseId(yarnId, warehouseId))
    const requisitions = await Promise.all(callArray)
    let sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5], ...requisitions[6], ...requisitions[7]
].sort(
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
         if (!sortedAsc || sortedAsc.length === 0) {
            // إذا فاضية، أنشئ عنصر واحد لتخزين السعر
            sortedAsc = [{
            latest_price: latestPrice?.[0]?.price || 0,
            latest_price_dollar: latestPrice?.[0]?.price_dollar || 0
            }];
        } else {
            sortedAsc[0].latest_price = latestPrice?.[0]?.price || 0;
            sortedAsc[0].latest_price_dollar = latestPrice?.[0]?.price_dollar || 0;
        }
    } else {
        // 🟢 إذا ما في تاريخ، خليه 0 بأمان
  if (!sortedAsc || sortedAsc.length === 0) {
    sortedAsc = [{ latest_price: 0, latest_price_dollar: 0 }];
  } else {
    sortedAsc[0].latest_price = 0;
    sortedAsc[0].latest_price_dollar = 0;
  }
    }
    return sortedAsc;
};

exports.selectInventoryDetails = async (yarnReport) => {
    let data = []

    let yarnWhereCluse = {};
    yarnWhereCluse[`${waTableName}.is_deleted`] = 0;
    yarnWhereCluse[`${waTableName}.is_active`] = 1;
    yarnWhereCluse[`${waTableName}.type`] = constantsPayloads.addType;

    let reconciliationWhereCluse = {};
    reconciliationWhereCluse[`${waTableName}.is_deleted`] = 0;
    reconciliationWhereCluse[`${waTableName}.is_active`] = 1;
    reconciliationWhereCluse[`${waReconciliationRequisitionDetailsTableName}.input_output`] = 1;
    reconciliationWhereCluse[`${waTableName}.type`] = constantsPayloads.reconcilitionType;

    let transportWbWaWhereCluse = {};
    transportWbWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    transportWbWaWhereCluse[`${waTableName}.is_active`] = 1;
    transportWbWaWhereCluse[`${waTableName}.type`] = constantsPayloads.transportFromBToAType;

    // let executeOrderRequisitionWbWaWhereCluse = {};
    // executeOrderRequisitionWbWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    // executeOrderRequisitionWbWaWhereCluse[`${waTableName}.is_active`] = 1;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${waTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${waTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${waTableName}.type`] = constantsPayloads.transportBetweenType;

    let whereCluseArray = [yarnWhereCluse, reconciliationWhereCluse, 
        transportWbWaWhereCluse,
        transitionBetweenWhWhereCluse]

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
                warehouseYarnLot.latest_price_dollar = latestPrice[0]?.price_dollar
            } else {
                warehouseYarnLot.latest_price = 0
                warehouseYarnLot.latest_price_dollar = 0
            }
            // Get Sum Current Quantity Of warehouseYarnLot 
            // const sumCurrentQuantity = await waService.selectSumCurrentQuantityByYarnWa(warehouseYarnLot.id)
            // warehouseYarnLot.current_quantity = sumCurrentQuantity[0].current_quantity

            data.push(warehouseYarnLot)

            callArray.push(waAddRequisitionDetailsQueries.selectDetailsByWarehouseByYarnByLot(
                warehouseYarnLot.warehouse_id, warehouseYarnLot.yarn_id, 
                warehouseYarnLot.yarn_lot_id, warehouseYarnLot.consigment_yarn_id,
                warehouseYarnLot.wa_yarn_order_requisition_id,
                warehouseYarnLot.supplier_id
            ))
            callArray.push(waSellRequisitionDetailsQueries.selectDetailsByWarehouseByYarnByLot(
                warehouseYarnLot.warehouse_id, warehouseYarnLot.yarn_id, 
                warehouseYarnLot.yarn_lot_id, warehouseYarnLot.consigment_yarn_id, 
                warehouseYarnLot.wa_yarn_order_requisition_id,
                warehouseYarnLot.supplier_id
            ))
            callArray.push(waReturnRequisitionDetailsQueries.selectDetailsByWarehouseByYarnByLot(
                warehouseYarnLot.warehouse_id, warehouseYarnLot.yarn_id, 
                warehouseYarnLot.yarn_lot_id, warehouseYarnLot.consigment_yarn_id,
                warehouseYarnLot.wa_yarn_order_requisition_id,
                warehouseYarnLot.supplier_id
            ))
            callArray.push(waReconciliationRequisitionDetailsQueries.selectDetailsByWarehouseByYarnByLot(
                warehouseYarnLot.warehouse_id, warehouseYarnLot.yarn_id, 
                warehouseYarnLot.yarn_lot_id, warehouseYarnLot.consigment_yarn_id,
                warehouseYarnLot.wa_yarn_order_requisition_id,
                warehouseYarnLot.supplier_id
            ))
            callArray.push(wbTransportWaWbDetailsQueries.selectDetailsByWarehouseByYarnByLot(
                warehouseYarnLot.warehouse_id, warehouseYarnLot.yarn_id, 
                warehouseYarnLot.yarn_lot_id, warehouseYarnLot.consigment_yarn_id,
                warehouseYarnLot.wa_yarn_order_requisition_id,
                warehouseYarnLot.supplier_id
            ))
            callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectDetailsByWarehouseByYarnByLot(
                warehouseYarnLot.warehouse_id, warehouseYarnLot.yarn_id, 
                warehouseYarnLot.yarn_lot_id, warehouseYarnLot.consigment_yarn_id,
                warehouseYarnLot.wa_yarn_order_requisition_id,
                warehouseYarnLot.supplier_id
            ))
            callArray.push(waTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseDetailsByWarehouseByYarnByLot(
                warehouseYarnLot.warehouse_id, warehouseYarnLot.yarn_id, 
                warehouseYarnLot.yarn_lot_id, warehouseYarnLot.consigment_yarn_id,
                warehouseYarnLot.wa_yarn_order_requisition_id,
                warehouseYarnLot.supplier_id
            ))
            callArray.push(waTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseDetailsByWarehouseByYarnByLot(
                warehouseYarnLot.warehouse_id, warehouseYarnLot.yarn_id, 
                warehouseYarnLot.yarn_lot_id, warehouseYarnLot.consigment_yarn_id,
                warehouseYarnLot.wa_yarn_order_requisition_id,
                warehouseYarnLot.supplier_id
            ))
            const requisitions = await Promise.all(callArray)
            const sortedAsc = [...requisitions[0], ...requisitions[1],
            ...requisitions[2], ...requisitions[3], ...requisitions[4],
            ...requisitions[5], ...requisitions[6], ...requisitions[7]
        ].sort(
                (objA, objB) => moment(objA.date) - moment(objB.date)
            );

            // ✅ حساب إجمالي الإدخال والإخراج لكل Yarn
            const totalInput = sortedAsc
            .filter(d => d.input_output == 1) // الإدخالات فقط
            .reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

            const totalOutput = sortedAsc
            .filter(d => d.input_output == 0) // الإخراجات فقط
            .reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

            // ✅ حفظ القيم داخل الكائن الأساسي
            data[i].input_quantity = parseFloat((totalInput).toFixed(2));
            data[i].output_quantity = parseFloat((totalOutput).toFixed(2));
            data[i].details = sortedAsc

        }
    }

    return data;
};

exports.selectInventoryDetailsByWarehouseByYarnByLot = async (warehouseId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId) => {
    let callArray = []

    callArray.push(waAddRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByYarnByLot(warehouseId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId))
    callArray.push(waSellRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByYarnByLot(warehouseId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId))
    callArray.push(waReturnRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByYarnByLot(warehouseId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId))
    callArray.push(waReconciliationRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByYarnByLot(warehouseId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId))
    callArray.push(wbTransportWaWbDetailsQueries.selectDetailsDetailsByWarehouseByYarnByLot(warehouseId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId))
    callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectDetailsDetailsByWarehouseByYarnByLot(warehouseId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId))
    callArray.push(waTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseDetailsDetailsByWarehouseByYarnByLot(warehouseId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId))
    callArray.push(waTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseDetailsDetailsByWarehouseByYarnByLot(warehouseId, yarnId, yarnLotId, consigmentYarnId, yarnOrderId))
    const requisitions = await Promise.all(callArray)
    let sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5], ...requisitions[6], ...requisitions[7]
].sort(
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
        if (!sortedAsc || sortedAsc.length === 0) {
            // إذا فاضية، أنشئ عنصر واحد لتخزين السعر
            sortedAsc = [{
            latest_price: latestPrice?.[0]?.price || 0,
            latest_price_dollar: latestPrice?.[0]?.price_dollar || 0
            }];
        } else {
            sortedAsc[0].latest_price = latestPrice?.[0]?.price || 0;
            sortedAsc[0].latest_price_dollar = latestPrice?.[0]?.price_dollar || 0;
        }
    } else {
        // 🟢 إذا ما في تاريخ، خليه 0 بأمان
  if (!sortedAsc || sortedAsc.length === 0) {
    sortedAsc = [{ latest_price: 0, latest_price_dollar: 0 }];
  } else {
    sortedAsc[0].latest_price = 0;
    sortedAsc[0].latest_price_dollar = 0;
  }
    }
    return sortedAsc;
};

exports.selectPriceWa = async (yarnId, consigmentYarnId) => {
    let callArray = []

    callArray.push(waAddRequisitionDetailsQueries.selectPriceByYarnId(yarnId, consigmentYarnId))
    callArray.push(waSellRequisitionDetailsQueries.selectPriceByYarnId(yarnId, consigmentYarnId))
    callArray.push(waReturnRequisitionDetailsQueries.selectPriceByYarnId(yarnId, consigmentYarnId))
    callArray.push(waReconciliationRequisitionDetailsQueries.selectPriceByYarnId(yarnId, consigmentYarnId))
    callArray.push(wbTransportWaWbDetailsQueries.selectPriceByYarnId(yarnId, consigmentYarnId))
    callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectPriceByYarnId(yarnId, consigmentYarnId))
    callArray.push(waTransitionBetweenWHRequisitionDetailsQueries.selectToPriceByYarnId(yarnId, consigmentYarnId))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5], ...requisitions[6]].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    // Select Max Added Date
    let maxDateWhereCluse = {};
    maxDateWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
    maxDateWhereCluse[`${waAddRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
    const selectMaxDate = await generalQueries.selectMaxValueWithJoinCondition(waAddRequisitionTableName,
        { date: 'date' }, maxDateWhereCluse,
        waAddRequisitionDetailsTableName,
        `${waAddRequisitionDetailsTableName}.wa_add_requisition_id`,
        `${waAddRequisitionTableName}.id`)
    if (selectMaxDate[0] != null) {
        // Select Latest Price
        let waAddRequisitionDetailsWhereCluse = {};
        waAddRequisitionDetailsWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
        waAddRequisitionDetailsWhereCluse[`${waAddRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
        waAddRequisitionDetailsWhereCluse[`${waAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await waAddRequisitionDetailsQueries.selectLatestPrice(waAddRequisitionDetailsWhereCluse)
        if (latestPrice[0] != null) {
            sortedAsc[0].latest_price = latestPrice[0]?.price 
            sortedAsc[0].latest_price_dollar = latestPrice[0]?.price_dollar 
        } else {
            sortedAsc[0].latest_price = 0
            sortedAsc[0].latest_price_dollar = 0
        }

        // Select Latest Consignment Price
        let waAddRequisitionDetailsByConsigmentWhereCluse = {};
        waAddRequisitionDetailsByConsigmentWhereCluse[`${waAddRequisitionDetailsTableName}.yarn_id`] = yarnId;
        waAddRequisitionDetailsByConsigmentWhereCluse[`${waAddRequisitionDetailsTableName}.consigment_yarn_id`] = consigmentYarnId;
        waAddRequisitionDetailsByConsigmentWhereCluse[`${waAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
        const latestConsigmentPrice = await waAddRequisitionDetailsQueries.selectLatestPrice(waAddRequisitionDetailsByConsigmentWhereCluse)
        if (latestConsigmentPrice[0] != null) {
            sortedAsc[0].latest_consigment_price = latestConsigmentPrice[0]?.price
            sortedAsc[0].latest_consigment_price_dollar = latestConsigmentPrice[0]?.price_dollar
        } else {
            sortedAsc[0].latest_consigment_price = 0
            sortedAsc[0].latest_consigment_price_dollar = 0
        }
    } else {
        sortedAsc[0].latest_price = 0
        sortedAsc[0].latest_consigment_price = 0
        sortedAsc[0].latest_consigment_price_dollar = 0
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

exports.yarnOrdersReport = async () => {
    
    let whereCluse = {};
    whereCluse[`wa_yarn_order_requisition_is_order`] = 1;
    whereCluse[`wa_yarn_order_requisition_details_is_order`] = 1;

    const salesReportResult = await waReportQueries.yarnOrdersReport(whereCluse)
    return salesReportResult
};

exports.selectInventoryTotalByDate = async (bodyPalod) => {
    let callArray = []

    callArray.push(waAddRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPalod))
    callArray.push(waSellRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPalod))
    callArray.push(waReturnRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPalod))
    callArray.push(waReconciliationRequisitionDetailsQueries.selectTotalDetailsByDate(bodyPalod))
    callArray.push(wbTransportWaWbDetailsQueries.selectTotalDetailsByDate(bodyPalod))
    callArray.push(wbTransportRequisitionWbWaDetailsQueries.selectTotalDetailsByDate(bodyPalod))
    callArray.push(waExecuteOrderRequisitionDetailsQueries.selectFromWarehouseTotalDetailsByDate(bodyPalod))
    callArray.push(waExecuteOrderRequisitionDetailsQueries.selectToWarehouseTotalDetailsByDate(bodyPalod))
    callArray.push(waTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseTotalDetailsByDate(bodyPalod))
    callArray.push(waTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseTotalDetailsByDate(bodyPalod))
    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0], ...requisitions[1],
    ...requisitions[2], ...requisitions[3], ...requisitions[4],
    ...requisitions[5], ...requisitions[6], ...requisitions[7],
    ...requisitions[8], ...requisitions[9]
].sort(
        (objA, objB) => moment(objA.date) - moment(objB.date)
    );

    return sortedAsc;
};

exports.selectInventoryByConsigmentsYarn = async (consigmentsYarn) => {
    let callArray = []

    let wbTransportWaWbWhereCluse = {};
    wbTransportWaWbWhereCluse[`${wbTransportWaWbDetailsTableName}.is_deleted`] = 0;
    wbTransportWaWbWhereCluse[`${wbTransportWaWbDetailsTableName}.is_active`] = 1;
    callArray.push(wbTransportWaWbDetailsQueries.selectbyConsigmentYarnForDyedFabricOrder(wbTransportWaWbWhereCluse, consigmentsYarn))

    const requisitions = await Promise.all(callArray)
    const sortedAsc = [...requisitions[0]
].sort(
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

    let executeOrderWaWhereCluse = {};
    executeOrderWaWhereCluse[`${yarnTableName}.id`] = yarnId;
    executeOrderWaWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    executeOrderWaWhereCluse[`${yarnTableName}.is_active`] = 1;
    executeOrderWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    executeOrderWaWhereCluse[`${waTableName}.is_active`] = 1;
    executeOrderWaWhereCluse[`${waTableName}.type`] = constantsPayloads.executeOrderType;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${yarnTableName}.id`] = yarnId;
    transitionBetweenWhWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${yarnTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${waTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${waTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${waTableName}.type`] = constantsPayloads.transportBetweenType;

    let waWhereCluseArray = [
        yarnWhereCluse, reconciliationWhereCluse,
        transportWbWaWhereCluse, warehouseWhereCluse,
        executeOrderWaWhereCluse, transitionBetweenWhWhereCluse
    ]

    // select wa Yarn 
    let waYarns = await yarnQueries.selectStoredWaYarnsAndWarehousesForInquireFabricAvilability(waWhereCluseArray)
    return waYarns
};

exports.inquireYarnAvilabilityTotalReportWa = async (yarnId) => {

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

    let executeOrderWaWhereCluse = {};
    executeOrderWaWhereCluse[`${yarnTableName}.id`] = yarnId;
    executeOrderWaWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    executeOrderWaWhereCluse[`${yarnTableName}.is_active`] = 1;
    executeOrderWaWhereCluse[`${waTableName}.is_deleted`] = 0;
    executeOrderWaWhereCluse[`${waTableName}.is_active`] = 1;
    executeOrderWaWhereCluse[`${waTableName}.type`] = constantsPayloads.executeOrderType;

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${yarnTableName}.id`] = yarnId;
    transitionBetweenWhWhereCluse[`${yarnTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${yarnTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${waTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${waTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${waTableName}.type`] = constantsPayloads.transportBetweenType;

    let waWhereCluseArray = [
        yarnWhereCluse, reconciliationWhereCluse,
        transportWbWaWhereCluse, warehouseWhereCluse,
        executeOrderWaWhereCluse, transitionBetweenWhWhereCluse
    ]

    // select wa Yarn 
    let waYarns = await yarnQueries.selectStoredWaYarnsForInquireFabricAvilabilityTotal(waWhereCluseArray)
    return waYarns
};

exports.inquireYarnsOfFabricForOrderWa = async (fabric, addedData) => {
    let data = []
    let calcQuantity = fabric.current_quantity
    let isWaYarnsAdded = false

    const myFirstPromise = new Promise(async (resolve, reject) => {
        // select yarns of fabric
        const yarnsOfFabricResult = await fabricYarnsService.selectByFabricIdForReport(fabric.fabricId)
        if (yarnsOfFabricResult[0] != null) {

            for (let i = 0; i < yarnsOfFabricResult.length; i++) {
                const yarnOfFabric = yarnsOfFabricResult[i];

                const waYarns = await this.inquireYarnAvilabilityReportWa(yarnOfFabric.yarn_id)                
                if (waYarns[0] != null) {
                    let calcQuantityYarn = calcQuantity
                    // let calcQuantityYarn = parseFloat((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))).toFixed(3))
                    
                    for (let j = 0; j < waYarns.length; j++) {
                        const waYarn = waYarns[j];

                        let neededYarnQuantity = 0
                        neededYarnQuantity = parseFloat((((calcQuantityYarn / (1 - (constants.notZero(fabric.wasteRatio) / 100))) * parseFloat(yarnOfFabric.total_ratio) / 100)).toFixed(3))
                        neededYarnQuantity = (yarnOfFabric.wast_ratio != 0) ? parseFloat((neededYarnQuantity / ( 1 - (constants.notZero(yarnOfFabric.wast_ratio) / 100) )).toFixed(3)) 
                        : neededYarnQuantity
                        calcQuantityYarn = 0

                        // let neededYarnQuantity = 0
                        // neededYarnQuantity = parseFloat(((calcQuantityYarn * parseFloat(yarnOfFabric.total_ratio) / 100)).toFixed(3))
                        // neededYarnQuantity = (yarnOfFabric.wast_ratio != 0) ? parseFloat((neededYarnQuantity / (1 - (constants.notZero(yarnOfFabric.wast_ratio) / 100))).toFixed(3))
                        //     : neededYarnQuantity
                        // calcQuantityYarn = 0

                        // check if yarn added before for not calc same current quantity in all records
                        isWaYarnsAdded = await weReportService.checkFoundObjectInArray1Attr(
                            addedData, waYarn,
                            'id')

                        let getElementOf = (!isWaYarnsAdded) ?
                            waYarn
                            :
                            addedData[await weReportService.getIndexOfElement1Attr(addedData, waYarn, 'id')]

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
                            waYarn.existed_quantity = neededYarnQuantity
                            waYarn.needed_quantity = 0
                            neededYarnQuantity = 0
                        } else {
                            waYarn.existed_quantity = currentQuantity
                            
                            neededYarnQuantity = (currentQuantity > 0) ?
                                    parseFloat((neededYarnQuantity - currentQuantity).toFixed(3))
                                    :
                                    parseFloat((neededYarnQuantity).toFixed(3))
                            // data.push(waYarn)
                        }

                        if (neededYarnQuantity == 0) {
                            // data.push(waYarn)
                            continue;
                        } else {
                            data.push({
                                    id: yarnOfFabric.yarn_id,
                                    warehouse_id: '000',
                                    warehouse_name: waYarn.warehouse_name,
                                    name: yarnOfFabric.yarn_name,
                                    code: yarnOfFabric.yarn_code,
                                    existed_quantity: waYarn.existed_quantity,
                                    needed_quantity: (waYarns.length - 1 == j) ? neededYarnQuantity : 0,
                                })
                        }
                    }
                } else {

                    let neededYarnQuantity = 0
                        neededYarnQuantity = parseFloat((((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))) * parseFloat(yarnOfFabric.total_ratio) / 100)).toFixed(3))
                        neededYarnQuantity = (yarnOfFabric.wast_ratio != 0) ? parseFloat((neededYarnQuantity / ( 1 - (constants.notZero(yarnOfFabric.wast_ratio) / 100) )).toFixed(3)) 
                        : neededYarnQuantity

                    // let calcQuantityYarn = parseFloat((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))).toFixed(3))
                    // let neededYarnQuantity = 0
                    // neededYarnQuantity = parseFloat(((calcQuantityYarn * parseFloat(yarnOfFabric.total_ratio) / 100)).toFixed(3))
                    // neededYarnQuantity = (yarnOfFabric.wast_ratio != 0) ? parseFloat((neededYarnQuantity / (1 - (constants.notZero(yarnOfFabric.wast_ratio) / 100))).toFixed(3))
                    //     : neededYarnQuantity

                    data.push(
                        {
                            id: yarnOfFabric.yarn_id,
                            warehouse_id: '000',
                            warehouse_name: '',
                            name: yarnOfFabric.yarn_name,
                            code: yarnOfFabric.yarn_code,
                            existed_quantity: 0,
                            // needed_quantity: parseFloat(((calcQuantity * parseFloat(yarnOfFabric.total_ratio)) / 100).toFixed(3)),
                            needed_quantity: neededYarnQuantity,
                        }
                    )
                }
            }
        }

        resolve(data); // Yay! Everything went well!

    })
    return await myFirstPromise

}

exports.yarnsOfFabricForOrderWa = async (fabric) => {
    let data = []
    let calcQuantity = fabric.quantity

    const myFirstPromise = new Promise(async (resolve, reject) => {
        // select yarns of fabric
        const yarnsOfFabricResult = await fabricYarnsService.selectByFabricIdForReport(fabric.fabricId)
        if (yarnsOfFabricResult[0] != null) {

            for (let i = 0; i < yarnsOfFabricResult.length; i++) {
                const yarnOfFabric = yarnsOfFabricResult[i];

                neededYarnQuantity = parseFloat((((calcQuantity / (1 - (constants.notZero(fabric.wasteRatio) / 100))) * parseFloat(yarnOfFabric.total_ratio) / 100)).toFixed(3))
                neededYarnQuantity = (yarnOfFabric.wast_ratio != 0) ? parseFloat((neededYarnQuantity / ( 1 - (constants.notZero(yarnOfFabric.wast_ratio) / 100) )).toFixed(3)) 
                : neededYarnQuantity
                
                data.push({
                    id: yarnOfFabric.yarn_id,
                    name: yarnOfFabric.yarn_name,
                    code: yarnOfFabric.yarn_code,
                    needed_quantity: neededYarnQuantity,
                })
            }
        }

        resolve(data); // Yay! Everything went well!

    })
    return await myFirstPromise

}

exports.getCurrentNeededYarnQuantityOfFabricForOrder = async (fabric) => {
    let data = []
    let calcQuantity = fabric.current_quantity

    const myFirstPromise = new Promise(async (resolve, reject) => {
        // select yarns of fabric
        const yarnsOfFabricResult = await fabricYarnsService.selectByFabricIdByYarnId(fabric.fabric_id, fabric.yarn_id)
        if (yarnsOfFabricResult[0] != null) {

            neededYarnQuantity = parseFloat(((calcQuantity * parseFloat(yarnsOfFabricResult[0].ratio) / 100)).toFixed(3))
            neededYarnQuantity = (yarnsOfFabricResult[0].wast_ratio != 0) ? parseFloat((neededYarnQuantity / (1 - (constants.notZero(yarnsOfFabricResult[0].wast_ratio) / 100))).toFixed(3))
                : neededYarnQuantity

            data.push({
                needed_quantity: neededYarnQuantity,
            })
        }

        resolve(data); // Yay! Everything went well!

    })
    return await myFirstPromise

}