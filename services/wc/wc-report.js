const moment = require("moment")

// Config
const knex = require("../../db/config/connection").getConnection();

// Service
const wcReportQueries = require("../../db/queries/wc/wc-report");
const fabricYarnsService = require("../general/fabric-yarns");

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
const wcTransitionBetweenOrdersRequisitionDetailsQueries = require("../../db/queries/wc/wc-transition-between-orders-requisition-details");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { wbManufacturingOutputTableName, wbManufacturingRequisitionTableName, 
    wbManufacturingInputOutputTableName, warehouseTableName,
    fabricTableName, wcTableName, wcReconciliationRequisitionDetailsTableName,
    wcAddRequisitionTableName, wcAddRequisitionDetailsTableName,
    wcSellRequisitionDetailsTableName,
    wcReturnRequisitionDetailsTableName,
    wdTransportWcWdDetailsTableName,
    wdTransportRequisitionWdWcDetailsTableName,
    wcExecuteOrderRequisitionDetailsTableName,
    wcTransitionBetweenWHRequisitionDetailsTableName

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

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${fabricTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${wcTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportBetweenType;

    let transitionBetweenOrdersWhereCluse = {};
    transitionBetweenOrdersWhereCluse[`${fabricTableName}.is_deleted`] = 0;
    transitionBetweenOrdersWhereCluse[`${fabricTableName}.is_active`] = 1;
    transitionBetweenOrdersWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transitionBetweenOrdersWhereCluse[`${wcTableName}.is_active`] = 1;
    transitionBetweenOrdersWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportBetweenOrdersType;

    let whereCluseArray = [
        fabricWhereCluse, reconciliationWhereCluse, 
        transportWdWcWhereCluse, manufacturingOutputWhereCluse,
        transitionBetweenWhWhereCluse, transitionBetweenOrdersWhereCluse,
    ]

    // select fabrics 
    const fabrics = (fabricReport.isShowClosedBalances == 1) ? await fabricQueries.selectStoredWcFabrics(whereCluseArray, 0) : await fabricQueries.selectStoredWcFabrics(whereCluseArray)
    if (fabrics[0] != null) {
        
        // 🚀 استدعاء جميع السعار والتواريخ بـ Parallel
        const pricePromises = fabrics.map(fabric => {
            let maxDateWhereCluse = {};
            maxDateWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabric.id;
            
            const addReqPromise = generalQueries.selectMaxValueWithJoinCondition(wcAddRequisitionTableName,
                { date: 'date' }, maxDateWhereCluse,
                wcAddRequisitionDetailsTableName,
                `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`,
                `${wcAddRequisitionTableName}.id`)
                .then(selectMaxDate => {
                    if (selectMaxDate?.[0] != null) {
                        let wcAddRequisitionDetailsWhereCluse = {};
                        wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = fabric.id;
                        wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
                        return wcAddRequisitionDetailsQueries.selectLatestPrice(wcAddRequisitionDetailsWhereCluse)
                            .then(latestPrice => ({
                                fabricId: fabric.id,
                                addPrice: latestPrice[0]?.price || 0,
                                addPriceDollar: latestPrice[0]?.price_dollar || 0
                            }));
                    }
                    return { fabricId: fabric.id, addPrice: 0, addPriceDollar: 0 };
                });

            let manufacturingMaxDateWhereCluse = {};
            manufacturingMaxDateWhereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabric.id;
            const manufacturingPromise = knex(wbManufacturingOutputTableName)
                .max({ date: 'date' })
                .innerJoin(wbManufacturingInputOutputTableName,
                    `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`,
                    `${wbManufacturingOutputTableName}.id`)
                .innerJoin(wbManufacturingRequisitionTableName,
                    `${wbManufacturingRequisitionTableName}.id`,
                    `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
                .where(manufacturingMaxDateWhereCluse)
                .then(selectManufacturingMaxDate => {
                    if (selectManufacturingMaxDate?.[0]?.date != null) {
                        let wbManufacturingOutputWhereCluse = {};
                        wbManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabric.id;
                        wbManufacturingOutputWhereCluse[`${wbManufacturingRequisitionTableName}.date`] = selectManufacturingMaxDate[0]?.date;
                        return wbManufacturingOutputQueries.selectLatestPrice(wbManufacturingOutputWhereCluse)
                            .then(latestManufacturingPrice => ({
                                mfgPrice: (latestManufacturingPrice[0] == undefined) ? 0 : latestManufacturingPrice[0]?.price,
                                mfgPriceDollar: (latestManufacturingPrice[0] == undefined) ? 0 : latestManufacturingPrice[0]?.price_dollar
                            }));
                    }
                    return { mfgPrice: 0, mfgPriceDollar: 0 };
                });

            return Promise.all([addReqPromise, manufacturingPromise])
                .then(([addData, mfgData]) => ({ ...addData, ...mfgData }));
        });
        
        const prices = await Promise.all(pricePromises);
        const priceMap = new Map(prices.map(p => [p.fabricId, {
            addPrice: p.addPrice,
            addPriceDollar: p.addPriceDollar,
            mfgPrice: p.mfgPrice,
            mfgPriceDollar: p.mfgPriceDollar
        }]));

        // 🚀 حلقة واحدة - استدعاء جميع details queries بـ parallel
        const allDetailPromises = [];
        
        for (let i = 0; i < fabrics.length; i++) {
            let fabric = fabrics[i];
            
            // تحديث الأسعار من الـ map
            const priceData = priceMap.get(fabric.id);
            fabric.latest_price = priceData?.addPrice || 0;
            fabric.latest_price_dollar = priceData?.addPriceDollar || 0;
            fabric.latest_manufacturing_price = priceData?.mfgPrice || 0;
            fabric.latest_manufacturing_price_dollar = priceData?.mfgPriceDollar || 0;
            
            fabric.yarns = await fabricYarnsService.selectByFabricId(fabric.id);
            fabric.yarns_flat = (fabric.yarns || []).map((y) => y.yarn_name).filter(Boolean);
            
            data.push(fabric);
            
            // تجميع جميع promises
            allDetailPromises.push(wcAddRequisitionDetailsQueries.selectTotalByFabricId(fabric.id));
            allDetailPromises.push(wcSellRequisitionDetailsQueries.selectTotalByFabricId(fabric.id));
            allDetailPromises.push(wcReturnRequisitionDetailsQueries.selectTotalByFabricId(fabric.id));
            allDetailPromises.push(wcReconciliationRequisitionDetailsQueries.selectTotalByFabricId(fabric.id));
            allDetailPromises.push(wdTransportWcWdDetailsQueries.selectTotalByFabricId(fabric.id));
            allDetailPromises.push(wdTransportRequisitionWdWcDetailsQueries.selectTotalByFabricIdForInput(fabric.id));
            allDetailPromises.push(wbManufacturingOutputQueries.selectTotalByFabricId(fabric.id));
            allDetailPromises.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectFromTotalByFabricId(fabric.id));
            allDetailPromises.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectToTotalByFabricId(fabric.id));
            allDetailPromises.push(wcTransitionBetweenOrdersRequisitionDetailsQueries.selectFromTotalByFabricId(fabric.id));
            allDetailPromises.push(wcTransitionBetweenOrdersRequisitionDetailsQueries.selectToTotalByFabricId(fabric.id));
        }
        
        // استدعاء جميع queries مرة واحدة
        const allResults = await Promise.all(allDetailPromises);
        
        // معالجة النتائج
        let resultIndex = 0;
        for (let i = 0; i < fabrics.length; i++) {
            const requisitions = [
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++]
            ];
            
            const sortedAsc = [...requisitions[0], ...requisitions[1],
                ...requisitions[2], ...requisitions[3], ...requisitions[4],
                ...requisitions[5], ...requisitions[6], ...requisitions[7],
                ...requisitions[8], ...requisitions[9], ...requisitions[10]
            ].sort((objA, objB) => moment(objA.date) - moment(objB.date));

            const totalInput = sortedAsc
                .filter(d => d.input_output == 1)
                .reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

            const totalOutput = sortedAsc
                .filter(d => d.input_output == 0)
                .reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

            data[i].input_quantity = parseFloat((totalInput).toFixed(2));
            data[i].output_quantity = parseFloat((totalOutput).toFixed(2));
            data[i].details = sortedAsc;
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
    callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectFromTotalDetailsByFabricId(fabricId))
    callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectToTotalDetailsByFabricId(fabricId))
    callArray.push(wcTransitionBetweenOrdersRequisitionDetailsQueries.selectFromTotalDetailsByFabricId(fabricId))
    callArray.push(wcTransitionBetweenOrdersRequisitionDetailsQueries.selectToTotalDetailsByFabricId(fabricId))
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

    let transitionBetweenWhWhereCluse = {};
    transitionBetweenWhWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transitionBetweenWhWhereCluse[`${wcTableName}.is_active`] = 1;
    transitionBetweenWhWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportBetweenType;

    let transitionBetweenOrdersWhereCluse = {};
    transitionBetweenOrdersWhereCluse[`${wcTableName}.is_deleted`] = 0;
    transitionBetweenOrdersWhereCluse[`${wcTableName}.is_active`] = 1;
    transitionBetweenOrdersWhereCluse[`${wcTableName}.type`] = constantsPayloads.transportBetweenOrdersType;

    let whereCluseArray = [
        fabricWhereCluse, reconciliationWhereCluse, 
        transportWdWcWhereCluse, manufacturingOutputWhereCluse,
        transitionBetweenWhWhereCluse, transitionBetweenOrdersWhereCluse
    ]

    // select warehousesFabricsConsigmentsManufacturing 
    const warehousesFabricsConsigmentsManufacturing = (fabricReport.isShowClosedBalances == 1) ? await wcQueries.selectStoredWarehouseAndFabricAndConsigmentManufacturing(whereCluseArray, 0) : await wcQueries.selectStoredWarehouseAndFabricAndConsigmentManufacturing(whereCluseArray)
    if (warehousesFabricsConsigmentsManufacturing[0] != null) {
        let manufaturingOutputId = ['0'];
        
        // 🚀 استدعاء جميع الأسعار والمعلومات الإضافية بـ Parallel
        const pricePromises = warehousesFabricsConsigmentsManufacturing.map(item => {
            let maxDateWhereCluse = {};
            maxDateWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = item.fabric_id;
            maxDateWhereCluse[`${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`] = item.consigment_manufacturing_id;
            
            const addReqPromise = generalQueries.selectMaxValueWithJoinCondition(wcAddRequisitionTableName,
                { date: 'date' }, maxDateWhereCluse,
                wcAddRequisitionDetailsTableName,
                `${wcAddRequisitionDetailsTableName}.wc_add_requisition_id`,
                `${wcAddRequisitionTableName}.id`)
                .then(selectMaxDate => {
                    if (selectMaxDate[0] != null) {
                        let wcAddRequisitionDetailsWhereCluse = {};
                        wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionDetailsTableName}.fabric_id`] = item.fabric_id;
                        wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
                        return wcAddRequisitionDetailsQueries.selectLatestPrice(wcAddRequisitionDetailsWhereCluse)
                            .then(latestPrice => ({
                                price: latestPrice[0]?.price || 0,
                                price_dollar: latestPrice[0]?.price_dollar || 0
                            }));
                    }
                    return { price: 0, price_dollar: 0 };
                });

            let manufacturingMaxDateWhereCluse = {};
            manufacturingMaxDateWhereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = item.fabric_id;
            const manufacturingPromise = knex(wbManufacturingOutputTableName)
                .max({ date: 'date' })
                .innerJoin(wbManufacturingInputOutputTableName,
                    `${wbManufacturingInputOutputTableName}.wb_manufacturing_output_id`,
                    `${wbManufacturingOutputTableName}.id`)
                .innerJoin(wbManufacturingRequisitionTableName,
                    `${wbManufacturingRequisitionTableName}.id`,
                    `${wbManufacturingInputOutputTableName}.wb_manufacturing_requisition_id`)
                .where(manufacturingMaxDateWhereCluse)
                .then(selectManufacturingMaxDate => {
                    if (selectManufacturingMaxDate[0].date != null) {
                        let wbManufacturingOutputWhereCluse = {};
                        wbManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = item.fabric_id;
                        wbManufacturingOutputWhereCluse[`${wbManufacturingRequisitionTableName}.date`] = selectManufacturingMaxDate[0]?.date;
                        return wbManufacturingOutputQueries.selectLatestPrice(wbManufacturingOutputWhereCluse)
                            .then(latestManufacturingPrice => ({
                                mfgPrice: (latestManufacturingPrice[0] == undefined) ? 0 : latestManufacturingPrice[0]?.price,
                                mfgPriceDollar: (latestManufacturingPrice[0] == undefined) ? 0 : latestManufacturingPrice[0]?.price_dollar
                            }));
                    }
                    return { mfgPrice: 0, mfgPriceDollar: 0 };
                });

            return Promise.all([addReqPromise, manufacturingPromise])
                .then(([addData, mfgData]) => ({ 
                    consigmentId: item.consigment_manufacturing_id, 
                    fabricId: item.fabric_id,
                    warehouseId: item.warehouse_id,
                    mfgOutputId: item.manufaturing_output_id,
                    ...addData, 
                    ...mfgData 
                }));
        });

        const prices = await Promise.all(pricePromises);
        const priceMap = new Map(prices.map(p => [p.consigmentId, {
            price: p.price,
            price_dollar: p.price_dollar,
            mfgPrice: p.mfgPrice,
            mfgPriceDollar: p.mfgPriceDollar
        }]));

        // 🚀 استدعاء جميع manufacturing details بـ Parallel
        const manufacturingSelectPromises = warehousesFabricsConsigmentsManufacturing
            .filter((item, idx, arr) => !arr.slice(0, idx).some(x => x.manufaturing_output_id === item.manufaturing_output_id))
            .map(item => {
                let wbManufacturingOutput2WhereCluse = {};
                wbManufacturingOutput2WhereCluse[`${wbManufacturingOutputTableName}.id`] = item.manufaturing_output_id;
                wbManufacturingOutput2WhereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = item.fabric_id;
                wbManufacturingOutput2WhereCluse[`${wbManufacturingOutputTableName}.warehouse_id`] = item.warehouse_id;
                return wbManufacturingOutputQueries.select2(wbManufacturingOutput2WhereCluse)
                    .then(result => ({ mfgOutputId: item.manufaturing_output_id, details: result || [] }));
            });

        const manufacturingData = await Promise.all(manufacturingSelectPromises);
        const mfgDataMap = new Map(manufacturingData.map(m => [m.mfgOutputId, m.details]));

        // 🚀 حلقة واحدة - استدعاء جميع detail queries بـ parallel
        const allDetailPromises = [];
        
        for (let i = 0; i < warehousesFabricsConsigmentsManufacturing.length; i++) {
            let item = warehousesFabricsConsigmentsManufacturing[i];
            
            allDetailPromises.push(wcAddRequisitionDetailsQueries.selectDetailsByWarehouseByFabricByConsigmentManufacturing(
                item.warehouse_id, item.fabric_id, item.consigment_manufacturing_id, item.wc_fabric_order_requisition_id));
            allDetailPromises.push(wcSellRequisitionDetailsQueries.selectDetailsByWarehouseByFabricByConsigmentManufacturing(
                item.warehouse_id, item.fabric_id, item.consigment_manufacturing_id, item.wc_fabric_order_requisition_id));
            allDetailPromises.push(wcReturnRequisitionDetailsQueries.selectDetailsByWarehouseByFabricByConsigmentManufacturing(
                item.warehouse_id, item.fabric_id, item.consigment_manufacturing_id, item.wc_fabric_order_requisition_id));
            allDetailPromises.push(wcReconciliationRequisitionDetailsQueries.selectDetailsByWarehouseByFabricByConsigmentManufacturing(
                item.warehouse_id, item.fabric_id, item.consigment_manufacturing_id, item.wc_fabric_order_requisition_id));
            allDetailPromises.push(wdTransportWcWdDetailsQueries.selectDetailsByWarehouseByFabricByConsigmentManufacturing(
                item.warehouse_id, item.fabric_id, item.consigment_manufacturing_id, item.wc_fabric_order_requisition_id));
            allDetailPromises.push(wdTransportRequisitionWdWcDetailsQueries.selectDetailsByWarehouseByFabricByConsigmentManufacturing(
                item.warehouse_id, item.fabric_id, item.consigment_manufacturing_id, item.wc_fabric_order_requisition_id));
            allDetailPromises.push(wbManufacturingOutputQueries.selectDetailsByWarehouseByFabricByConsigmentManufacturing(
                item.warehouse_id, item.fabric_id, item.consigment_manufacturing_id, item.wc_fabric_order_requisition_id));
            allDetailPromises.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing(
                item.warehouse_id, item.fabric_id, item.consigment_manufacturing_id, item.wc_fabric_order_requisition_id));
            allDetailPromises.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing(
                item.warehouse_id, item.fabric_id, item.consigment_manufacturing_id, item.wc_fabric_order_requisition_id));
            allDetailPromises.push(wcTransitionBetweenOrdersRequisitionDetailsQueries.selectFromWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(
                item.warehouse_id, item.fabric_id, item.consigment_manufacturing_id, item.wc_fabric_order_requisition_id));
            allDetailPromises.push(wcTransitionBetweenOrdersRequisitionDetailsQueries.selectToWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(
                item.warehouse_id, item.fabric_id, item.consigment_manufacturing_id, item.wc_fabric_order_requisition_id));
        }

        // استدعاء جميع queries مرة واحدة
        const allResults = await Promise.all(allDetailPromises);

        // معالجة النتائج
        let resultIndex = 0;
        for (let i = 0; i < warehousesFabricsConsigmentsManufacturing.length; i++) {
            let item = warehousesFabricsConsigmentsManufacturing[i];

            // تحديث الأسعار من الـ map
            const priceData = priceMap.get(item.consigment_manufacturing_id);
            item.latest_price = priceData?.price || 0;
            item.latest_price_dollar = priceData?.price_dollar || 0;
            item.latest_manufacturing_price = priceData?.mfgPrice || 0;
            item.latest_manufacturing_price_dollar = priceData?.mfgPriceDollar || 0;

            // إضافة manufacturing details إذا كانت جديدة
            if (!manufaturingOutputId.includes(item.manufaturing_output_id)) {
                manufaturingOutputId.push(item.manufaturing_output_id);
                const selectDetailsResult = mfgDataMap.get(item.manufaturing_output_id) || [];
                
                item.documents = (selectDetailsResult || []).map((y) => y.document).filter(Boolean);
                item.status_grade = (selectDetailsResult || []).map((y) => y.status_name).filter(Boolean);
                item.statement = (selectDetailsResult || []).map((y) => y.statement).filter(Boolean);
                item.storage_place = (selectDetailsResult || []).map((y) => y.storage_place).filter(Boolean);
                item.manufacturing_quantity = (selectDetailsResult || []).map((y) => y.quantity || 0).filter(Boolean);
                item.output_current_quantity = (selectDetailsResult || []).map((y) => y.output_current_quantity || 0).filter(Boolean);
                item.manufacturing_current_quantity = (selectDetailsResult || []).map((y) => y.manufacturing_current_quantity || 0).filter(Boolean);
            }

            data.push(item);

            // استخراج النتائج الـ 11
            const requisitions = [
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++],
                allResults[resultIndex++]
            ];

            const sortedAsc = [...requisitions[0], ...requisitions[1],
                ...requisitions[2], ...requisitions[3], ...requisitions[4],
                ...requisitions[5], ...requisitions[6], ...requisitions[7],
                ...requisitions[8], ...requisitions[9], ...requisitions[10]
            ].sort((objA, objB) => moment(objA.date) - moment(objB.date));

            const totalInput = sortedAsc
                .filter(d => d.input_output == 1)
                .reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

            const totalOutput = sortedAsc
                .filter(d => d.input_output == 0)
                .reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

            data[i].input_quantity = parseFloat((totalInput).toFixed(2));
            data[i].output_quantity = parseFloat((totalOutput).toFixed(2));
            data[i].details = sortedAsc;
        }
    }

    return data;
};

exports.selectInventoryDetailsByWarehouseByFabricByConsigmentManufacturing = async (fabricId, warehouseId, consigmentManufacturingId, fabricOrderId) => {
    let callArray = []

    callArray.push(wcAddRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId, fabricOrderId))
    callArray.push(wcSellRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId, fabricOrderId))
    callArray.push(wcReturnRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId, fabricOrderId))
    callArray.push(wcReconciliationRequisitionDetailsQueries.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId, fabricOrderId))
    callArray.push(wdTransportWcWdDetailsQueries.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId, fabricOrderId))
    callArray.push(wdTransportRequisitionWdWcDetailsQueries.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId, fabricOrderId))
    callArray.push(wbManufacturingOutputQueries.selectDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId, fabricOrderId))
    callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectFromWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId, fabricOrderId))
    callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectToWarehouseDetailsDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId, fabricOrderId))
    callArray.push(wcTransitionBetweenOrdersRequisitionDetailsQueries.selectFromWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId, fabricOrderId))
    callArray.push(wcTransitionBetweenOrdersRequisitionDetailsQueries.selectToWarehouseDetailsByWarehouseByFabricByConsigmentManufacturing(warehouseId, fabricId, consigmentManufacturingId, fabricOrderId))

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
        wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionDetailsTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
        wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionTableName}.date`] = selectMaxDate[0]?.date;
        const latestPrice = await wcAddRequisitionDetailsQueries.selectLatestPrice(wcAddRequisitionDetailsWhereCluse)
        if(latestPrice[0] != null ) {
            // sortedAsc[0].latest_price = latestPrice[0].price
            sortedAsc = [...[{latest_price: latestPrice[0].price, latest_price_dollar: latestPrice[0].price_dollar}], ...sortedAsc] 
        } else {
            sortedAsc = [...[{latest_price: 0, latest_price_dollar: 0}], ...sortedAsc] 
        }

        // Select Max Added Date
    let maxDateManufacturingOutputWhereCluse = {};
    maxDateManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.fabric_id`] = fabricId;
    maxDateManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
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
        wbManufacturingOutputWhereCluse[`${wbManufacturingOutputTableName}.consigment_manufacturing_id`] = consigmentManufacturingId;
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

exports.fabricOrdersReport = async () => {
    
    let whereCluse = {};
    whereCluse[`wc_fabric_order_requisition_is_order`] = 1;
    whereCluse[`wc_fabric_order_requisition_details_is_order`] = 1;

    const salesReportResult = await wcReportQueries.fabricOrdersReport(whereCluse)
    return salesReportResult
};

exports.selectInventoryByConsigmentsManufacturing = async (consigmentsManufacturing) => {
    let callArray = []

    let wcAddRequisitionDetailsWhereCluse = {};
    wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionDetailsTableName}.is_deleted`] = 0;
    wcAddRequisitionDetailsWhereCluse[`${wcAddRequisitionDetailsTableName}.is_active`] = 1;
    callArray.push(wcAddRequisitionDetailsQueries.selectByConsigmentManufacturingForDyedFabricOrder(wcAddRequisitionDetailsWhereCluse, consigmentsManufacturing))
    
    let wcSellRequisitionDetailsWhereCluse = {};
    wcSellRequisitionDetailsWhereCluse[`${wcSellRequisitionDetailsTableName}.is_deleted`] = 0;
    wcSellRequisitionDetailsWhereCluse[`${wcSellRequisitionDetailsTableName}.is_active`] = 1;
    callArray.push(wcSellRequisitionDetailsQueries.selectByConsigmentManufacturingForDyedFabricOrder(wcSellRequisitionDetailsWhereCluse, consigmentsManufacturing))
    
    let wcReturnRequisitionDetailsWhereCluse = {};
    wcReturnRequisitionDetailsWhereCluse[`${wcReturnRequisitionDetailsTableName}.is_deleted`] = 0;
    wcReturnRequisitionDetailsWhereCluse[`${wcReturnRequisitionDetailsTableName}.is_active`] = 1;
    callArray.push(wcReturnRequisitionDetailsQueries.selectByConsigmentManufacturingForDyedFabricOrder(wcReturnRequisitionDetailsWhereCluse, consigmentsManufacturing))
    
    let wcReconciliationRequisitionDetailsWhereCluse = {};
    wcReconciliationRequisitionDetailsWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_deleted`] = 0;
    wcReconciliationRequisitionDetailsWhereCluse[`${wcReconciliationRequisitionDetailsTableName}.is_active`] = 1;
    callArray.push(wcReconciliationRequisitionDetailsQueries.selectByConsigmentManufacturingForDyedFabricOrder(wcReconciliationRequisitionDetailsWhereCluse, consigmentsManufacturing))
    
    let wdTransportWcWdDetailsWhereCluse = {};
    wdTransportWcWdDetailsWhereCluse[`${wdTransportWcWdDetailsTableName}.is_deleted`] = 0;
    wdTransportWcWdDetailsWhereCluse[`${wdTransportWcWdDetailsTableName}.is_active`] = 1;
    callArray.push(wdTransportWcWdDetailsQueries.selectByConsigmentManufacturingForDyedFabricOrder(wdTransportWcWdDetailsWhereCluse, consigmentsManufacturing))
    
    let wdTransportRequisitionWdWcDetailsWhereCluse = {};
    wdTransportRequisitionWdWcDetailsWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_deleted`] = 0;
    wdTransportRequisitionWdWcDetailsWhereCluse[`${wdTransportRequisitionWdWcDetailsTableName}.is_active`] = 1;
    callArray.push(wdTransportRequisitionWdWcDetailsQueries.selectByConsigmentManufacturingForDyedFabricOrder(wdTransportRequisitionWdWcDetailsWhereCluse, consigmentsManufacturing))
    
    let wcExecuteOrderRequisitionDetailsFromWhereCluse = {};
    wcExecuteOrderRequisitionDetailsFromWhereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    wcExecuteOrderRequisitionDetailsFromWhereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;
    callArray.push(wcExecuteOrderRequisitionDetailsQueries.selectFromByConsigmentManufacturingForDyedFabricOrder(wcExecuteOrderRequisitionDetailsFromWhereCluse, consigmentsManufacturing))
    
    let wcExecuteOrderRequisitionDetailsToWhereCluse = {};
    wcExecuteOrderRequisitionDetailsToWhereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_deleted`] = 0;
    wcExecuteOrderRequisitionDetailsToWhereCluse[`${wcExecuteOrderRequisitionDetailsTableName}.is_active`] = 1;
    callArray.push(wcExecuteOrderRequisitionDetailsQueries.selectToByConsigmentManufacturingForDyedFabricOrder(wcExecuteOrderRequisitionDetailsToWhereCluse, consigmentsManufacturing))
    
    let wcTransitionBetweenWHRequisitionDetailsFromWhereCluse = {};
    wcTransitionBetweenWHRequisitionDetailsFromWhereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
    wcTransitionBetweenWHRequisitionDetailsFromWhereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;
    callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectFromByConsigmentManufacturingForDyedFabricOrder(wcTransitionBetweenWHRequisitionDetailsFromWhereCluse, consigmentsManufacturing))
    
    let wcTransitionBetweenWHRequisitionDetailsToWhereCluse = {};
    wcTransitionBetweenWHRequisitionDetailsToWhereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_deleted`] = 0;
    wcTransitionBetweenWHRequisitionDetailsToWhereCluse[`${wcTransitionBetweenWHRequisitionDetailsTableName}.is_active`] = 1;
    callArray.push(wcTransitionBetweenWHRequisitionDetailsQueries.selectToByConsigmentManufacturingForDyedFabricOrder(wcTransitionBetweenWHRequisitionDetailsToWhereCluse, consigmentsManufacturing))
    
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

exports.updateReportStoragePlace = async (wcIds, storagePlace) => {
    const results = await wcReportQueries.updateStoragePlace(wcIds, storagePlace);
    
    if (results) {
        return constants.updateSuccess;
    } else {
        return constants.updateError;
    }
};