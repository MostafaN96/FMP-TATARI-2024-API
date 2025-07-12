const userTableName = 'user'
const bussinessmanTableName = 'bussiness_man'
const yarnTableName = 'yarn'
const yarnLotTableName = 'yarn_lot'
const warehouseTableName = 'warehouse'
const fabricTableName = 'fabric'
const fabricYarnsTableName = 'fabric_yarns'
const circularKnittingMachineTableName = 'circular_knitting_machine'
const circularKnittingMachineBussinessmanTableName = 'circular_knitting_machine_bussiness_man'
const consigmentManufacturingTableName = 'consigment_manufacturing'
const consigmentDyeingTableName = 'consigment_dyeing'
const consigmentYarnTableName = 'consigment_yarn'
const deliveryCarTableName = 'delivery_car'
const colorCategoryTableName = 'color_category'
const colorTableName = 'color'
const anointedColorsPricesTableName = 'anointed_colors_prices'
const anointedServicesPricesTableName = 'anointed_services_prices'
const dyeingServicesTableName = 'anointed_services'
const dyeingServicesDetailsTableName = 'dyeing_services_details'
const logsTableName = 'logs'
const exchangeRateTableName = 'exchange_rate'
const exchangeRateLogTableName = 'exchange_rate_log'
const gradeItemTableName = 'grade_item'

const modulesTableName = 'modules'
const componentsTableName = 'components'
const pagesTableName = 'pages'
const functionsTableName = 'functions'
const privilegesTableName = 'privileges'

const ordersRequisitionsTableName = 'orders_requisitions'

const waTableName = 'wa'
const waAddRequisitionTableName = 'wa_add_requisition'
const waAddRequisitionDetailsTableName = 'wa_add_requisition_details'

const waSellRequisitionTableName = 'wa_sell_requisition'
const waSellRequisitionDetailsTableName = 'wa_sell_requisition_details'
const waSellRequisitionDetailsWaTableName = 'wa_sell_requisition_details_wa'

const waReturnRequisitionTableName = 'wa_return_requisition'
const waReturnRequisitionDetailsTableName = 'wa_return_requisition_details'
const waReturnRequisitionDetailsWaTableName = 'wa_return_requisition_details_wa'

const waReconciliationRequisitionTableName = 'wa_reconcilition_requisition'
const waReconciliationRequisitionDetailsTableName = 'wa_reconcilition_requisition_details'
const waReconciliationRequisitionDetailsWaTableName = 'wa_reconciliation_requisition_details_wa'

const waTransportWaWbRequisitionTableName = 'wa_transport_wa_wb_requisition'
const waTransportWaWbRequisitionDetailsTableName = 'wa_transport_wa_wb_requisition_details'

const waYarnOrderRequisitionTableName = 'wa_yarn_order_requisition'
const waYarnOrderRequisitionDetailsTableName = 'wa_yarn_order_requisition_details'
const waAddRequisitionDetailsYarnOrderTableName = 'wa_add_requisition_details_yarn_order'

const waPurchaseOrderTableName = 'wa_add_purchase_order'
const waPurchaseOrderDetailsTableName = 'wa_add_purchase_order_details'
const waAddRequisitionDetailsPurchaseOrderTableName = 'wa_add_requisition_details_purchase_order'

const waExecuteOrderRequisitionTableName = 'wa_execute_order_requisition'
const waExecuteOrderRequisitionDetailsTableName = 'wa_execute_order_requisition_details'
const waExecuteOrderRequisitionDetailsWaTableName = 'wa_execute_order_requisition_details_wa'

const waTransitionBetweenWHRequisitionTableName = 'wa_transition_between_wh_requisitions'
const waTransitionBetweenWHRequisitionDetailsTableName = 'wa_transition_between_wh_requisitions_details'
const waTransitionBetweenWHRequisitionDetailsWaTableName = 'wa_transition_between_wh_req_details_wa'

const wbTableName = 'wb'

const wbTransportWaWbTableName = 'wb_transport_wa_wb'
const wbTransportWaWbDetailsTableName = 'wb_transport_wa_wb_details'
const wbTransportWaWbDetailsWaTableName = 'wb_transport_wa_wb_details_wa'
const wbTransportRequisitionWbWaTableName = 'wb_transport_requisition_wb_wa'
const wbTransportRequisitionWbWaDetailsTableName = 'wb_transport_requisition_wb_wa_details'
const wbTransportRequisitionWbWaDetailsWbTableName = 'wb_transport_requisition_wb_wa_details_wb'
const wbReconciliationRequisitionTableName = 'wb_reconcilition_requisition'
const wbReconciliationRequisitionDetailsTableName = 'wb_reconcilition_requisition_details'
const wbReconciliationRequisitionDetailsWbTableName = 'wb_reconciliation_requisition_details_wb'
const wbManufacturingOrderRequisitionTableName = 'wb_manufacturing_order_requisition'
const wbManufacturingOrderRequisitionDetailsTableName = 'wb_manufacturing_order_requisition_details'
const wbManufacturingRequisitionTableName = 'wb_manufacturing_requisition'
const wbManufacturingInputTableName = 'wb_manufacturing_input'
const wbManufacturingInputWbTableName = 'wb_manufacture_input_wb'
const wbManufacturingOutputTableName = 'wb_manufacturing_output'
const wbManufacturingInputOutputTableName = 'wb_manufacturing_input_output'
const wbManufacturingOutputOrderTableName = 'wb_manufacturing_output_order'
const wbTransitionBetweenIndustriesRequisitionTableName = 'wb_transition_between_industries_requisition'
const wbTransitionBetweenIndustriesRequisitionDetailsTableName = 'wb_transition_between_industries_requisition_details'
const wbTransitionBetweenIndustriesRequisitionDetailsWbTableName = 'wb_transition_between_industries_requisition_details_wb'

const wcTableName = 'wc'
const wcAddRequisitionTableName = 'wc_add_requisition'
const wcAddRequisitionDetailsTableName = 'wc_add_requisition_details'

const wcSellRequisitionTableName = 'wc_sell_requisition'
const wcSellRequisitionDetailsTableName = 'wc_sell_requisition_details'
const wcSellRequisitionDetailsWcTableName = 'wc_sell_requisition_details_wc'

const wcReturnRequisitionTableName = 'wc_return_requisition'
const wcReturnRequisitionDetailsTableName = 'wc_return_requisition_details'
const wcReturnRequisitionDetailsWcTableName = 'wc_return_requisition_details_wc'

const wcReconciliationRequisitionTableName = 'wc_reconcilition_requisition'
const wcReconciliationRequisitionDetailsTableName = 'wc_reconcilition_requisition_details'
const wcReconciliationRequisitionDetailsWcTableName = 'wc_reconcilition_requisition_details_wc'

const wcFabricOrderRequisitionTableName = 'wc_fabric_order_requisition'
const wcFabricOrderRequisitionDetailsTableName = 'wc_fabric_order_requisition_details'

const wcExecuteOrderRequisitionTableName = 'wc_execute_order_requisition'
const wcExecuteOrderRequisitionDetailsTableName = 'wc_execute_order_requisition_details'
const wcExecuteOrderRequisitionDetailsWcTableName = 'wc_execute_order_requisition_details_wc'

const wcTransitionBetweenWHRequisitionTableName = 'wc_transition_between_wh_requisitions'
const wcTransitionBetweenWHRequisitionDetailsTableName = 'wc_transition_between_wh_requisitions_details'
const wcTransitionBetweenWHRequisitionDetailsWcTableName = 'wc_transition_between_wh_req_details_wc'

const wcTransitionBetweenOrdersRequisitionTableName = 'wc_transition_between_orders_requisitions'
const wcTransitionBetweenOrdersRequisitionDetailsTableName = 'wc_transition_between_orders_requisitions_details'
const wcTransitionBetweenOrdersRequisitionDetailsWcTableName = 'wc_transition_between_orders_req_details_wc'

const wcAddRequisitionDetailsFabricOrderTableName = 'wc_add_requisition_details_fabric_order'

const wdTableName = 'wd'
const wdTransportWcWdTableName = 'wd_transport_wc_wd'
const wdTransportWcWdDetailsTableName = 'wd_transport_wc_wd_details'
const wdTransportWcWdDetailsWcTableName = 'wd_transport_wc_wd_details_wc'
const wdDyeingRequisitionTableName = 'wd_dyeing_requisition'
const wdDyeingRequisitionDetailsTableName = 'wd_dyeing_requisition_details'
const wdFormDyeingOrderDetailsTableName = 'wd_form_dyeing_order_details'
const wdTransportRequisitionWdWcTableName = 'wd_transport_requisition_wd_wc'
const wdTransportRequisitionWdWcDetailsTableName = 'wd_transport_requisition_wd_wc_details'
const wdTransportRequisitionWdWcDetailsWdTableName = 'wd_transport_requisition_wd_wc_details_wd'

const wdReconciliationRequisitionTableName = 'wd_reconcilition_requisition'
const wdReconciliationRequisitionDetailsTableName = 'wd_reconcilition_requisition_details'
const wdReconciliationRequisitionDetailsWdTableName = 'wd_reconcilition_requisition_details_wd'

const wdTransitionBetweenDyersRequisitionTableName = 'wd_transition_between_dyers_requisition'
const wdTransitionBetweenDyersRequisitionDetailsTableName = 'wd_transition_between_dyers_requisition_details'
const wdTransitionBetweenDyersRequisitionDetailsWdTableName = 'wd_transition_between_dyers_requisition_details_wd'

const wdDyeingOrderRequisitionTableName = 'wd_form_dyeing_order_requisition'
const wdDyeingOrderRequisitionDetailsTableName = 'wd_form_dyeing_order_requisition_details'
const wdDyeingOrderDetailsWdFormDyeingDetailsTableName = 'wd_form_order_details_wd_form_details'

const wdFormDyeingRequisitionTableName = 'wd_form_dyeing_requisition'
const wdFormDyeingRequisitionDetailsTableName = 'wd_form_dyeing_requisition_details'
const wdFormDyeingRequisitionDetailsWdTableName = 'wd_form_dyeing_requisition_details_wd'

const wdFormDyeingRequisitionDetailsDyeingServicesTableName = 'wd_form_dyeing_requisition_details_dyeing_services'

const wdFormOrderDetailsWdFormDetailsTableName = 'wd_form_order_details_wd_form_details'

const weTableName = 'we'
const weAddRequisitionTableName = 'we_add_requisition'
const weAddRequisitionDetailsTableName = 'we_add_requisition_details'
const weAddRequisitionDetailsDyedFabricOrderTableName = 'we_add_requisition_details_dyed_fabric_order'

const weSellRequisitionTableName = 'we_sell_requisition'
const weSellRequisitionDetailsTableName = 'we_sell_requisition_details'
const weSellRequisitionDetailsWeTableName = 'we_sell_requisition_details_we'

const weSellRequisitionDirectDetailsTableName = 'we_sell_requisition_direct_details'

const weReconciliationRequisitionTableName = 'we_reconcilition_requisition'
const weReconciliationRequisitionDetailsTableName = 'we_reconcilition_requisition_details'
const weReconciliationRequisitionDetailsWeTableName = 'we_reconcilition_requisition_details_we'

const weReturnRequisitionTableName = 'we_return_requisition'
const weReturnRequisitionDetailsTableName = 'we_return_requisition_details'
const weReturnRequisitionDetailsWeTableName = 'we_return_requisition_details_we'

const weReturnSellRequisitionTableName = 'we_return_sell_requisition'
const weReturnSellRequisitionDetailsTableName = 'we_return_sell_requisition_details'
const weReturnSellRequisitionDetailsReturnDetailsTableName = 'we_return_sell_requisition_details_return_details'
const weReturnSellRequisitionDetailsWeTableName = 'we_return_sell_requisition_details_we'

const weDyedFabricOrderRequisitionTableName = 'we_dyed_fabric_order_requisition'
const weDyedFabricOrderRequisitionDetailsTableName = 'we_dyed_fabric_order_requisition_details'

const weExecuteOrderRequisitionTableName = 'we_execute_order_requisition'
const weExecuteOrderRequisitionDetailsTableName = 'we_execute_order_requisition_details'
const weExecuteOrderRequisitionDetailsWeTableName = 'we_execute_order_requisition_details_we'

const weTransitionBetweenWHRequisitionTableName = 'we_transition_between_wh_requisitions'
const weTransitionBetweenWHRequisitionDetailsTableName = 'we_transition_between_wh_requisitions_details'
const weTransitionBetweenWHRequisitionDetailsWeTableName = 'we_transition_between_wh_req_details_we'

const weTransitionBetweenOrdersRequisitionTableName = 'we_transition_between_orders_requisitions'
const weTransitionBetweenOrdersRequisitionDetailsTableName = 'we_transition_between_orders_requisitions_details'
const weTransitionBetweenOrdersRequisitionDetailsWeTableName = 'we_transition_between_orders_req_details_we'


module.exports = {
    userTableName,
    bussinessmanTableName,
    yarnTableName,
    yarnLotTableName,
    warehouseTableName,
    fabricTableName,
    fabricYarnsTableName,
    circularKnittingMachineTableName,
    circularKnittingMachineBussinessmanTableName,
    consigmentManufacturingTableName,
    consigmentDyeingTableName,
    consigmentYarnTableName,
    deliveryCarTableName,
    colorCategoryTableName,
    colorTableName,
    anointedColorsPricesTableName,
    anointedServicesPricesTableName,
    dyeingServicesTableName,
    dyeingServicesDetailsTableName,
    logsTableName,
    exchangeRateTableName,
    exchangeRateLogTableName,
    gradeItemTableName,

    modulesTableName,
    componentsTableName,
    pagesTableName,
    functionsTableName,
    privilegesTableName,

    ordersRequisitionsTableName,

    wdDyeingRequisitionDetailsTableName,
    wdFormDyeingOrderDetailsTableName,

    waTableName,
    waAddRequisitionTableName,
    waAddRequisitionDetailsTableName,
    waSellRequisitionTableName,
    waSellRequisitionDetailsTableName,
    waSellRequisitionDetailsWaTableName,
    waReturnRequisitionTableName,
    waReturnRequisitionDetailsTableName,
    waReturnRequisitionDetailsWaTableName,
    waReconciliationRequisitionTableName,
    waReconciliationRequisitionDetailsTableName,
    waReconciliationRequisitionDetailsWaTableName,

    waTransportWaWbRequisitionTableName,
    waTransportWaWbRequisitionDetailsTableName,

    waYarnOrderRequisitionTableName,
    waYarnOrderRequisitionDetailsTableName,
    waAddRequisitionDetailsYarnOrderTableName,

    waExecuteOrderRequisitionTableName,
    waExecuteOrderRequisitionDetailsTableName,
    waExecuteOrderRequisitionDetailsWaTableName,

    waTransitionBetweenWHRequisitionTableName,
    waTransitionBetweenWHRequisitionDetailsTableName,
    waTransitionBetweenWHRequisitionDetailsWaTableName,

    waPurchaseOrderTableName,
    waPurchaseOrderDetailsTableName,
    waAddRequisitionDetailsPurchaseOrderTableName,

    wbTableName,
    wbTransportWaWbTableName,
    wbTransportWaWbDetailsTableName,
    wbTransportWaWbDetailsWaTableName,
    wbTransportRequisitionWbWaTableName,
    wbTransportRequisitionWbWaDetailsTableName,
    wbTransportRequisitionWbWaDetailsWbTableName,
    wbReconciliationRequisitionTableName,
    wbReconciliationRequisitionDetailsTableName,
    wbReconciliationRequisitionDetailsWbTableName,
    wbManufacturingOrderRequisitionTableName,
    wbManufacturingOrderRequisitionDetailsTableName,
    wbManufacturingRequisitionTableName,
    wbManufacturingInputTableName,
    wbManufacturingInputWbTableName,
    wbManufacturingOutputTableName,
    wbManufacturingInputOutputTableName,
    wbManufacturingOutputOrderTableName,
    wbTransitionBetweenIndustriesRequisitionTableName,
    wbTransitionBetweenIndustriesRequisitionDetailsTableName,
    wbTransitionBetweenIndustriesRequisitionDetailsWbTableName,

    wcTableName,
    wcAddRequisitionTableName,
    wcAddRequisitionDetailsTableName,
    wcSellRequisitionTableName,
    wcSellRequisitionDetailsTableName,
    wcSellRequisitionDetailsWcTableName,
    wcReturnRequisitionTableName,
    wcReturnRequisitionDetailsTableName,
    wcReturnRequisitionDetailsWcTableName,
    wcReconciliationRequisitionTableName,
    wcReconciliationRequisitionDetailsTableName,
    wcReconciliationRequisitionDetailsWcTableName,

    wcFabricOrderRequisitionTableName,
    wcFabricOrderRequisitionDetailsTableName,
    wcExecuteOrderRequisitionTableName,
    wcExecuteOrderRequisitionDetailsTableName,
    wcExecuteOrderRequisitionDetailsWcTableName,

    wcTransitionBetweenWHRequisitionTableName,
    wcTransitionBetweenWHRequisitionDetailsTableName,
    wcTransitionBetweenWHRequisitionDetailsWcTableName,

    wcTransitionBetweenOrdersRequisitionTableName,
    wcTransitionBetweenOrdersRequisitionDetailsTableName,
    wcTransitionBetweenOrdersRequisitionDetailsWcTableName,
    
    wcAddRequisitionDetailsFabricOrderTableName,

    wdTableName,
    wdTransportWcWdTableName,
    wdTransportWcWdDetailsTableName,
    wdTransportWcWdDetailsWcTableName,
    wdDyeingRequisitionTableName,
    wdTransportRequisitionWdWcTableName,
    wdTransportRequisitionWdWcDetailsTableName,
    wdTransportRequisitionWdWcDetailsWdTableName,
    wdReconciliationRequisitionTableName,
    wdReconciliationRequisitionDetailsTableName,
    wdReconciliationRequisitionDetailsWdTableName,
    wdTransitionBetweenDyersRequisitionTableName,
    wdTransitionBetweenDyersRequisitionDetailsTableName,
    wdTransitionBetweenDyersRequisitionDetailsWdTableName,
    wdDyeingOrderRequisitionTableName,
    wdDyeingOrderRequisitionDetailsTableName,
    wdDyeingOrderDetailsWdFormDyeingDetailsTableName,
    wdFormDyeingRequisitionTableName,
    wdFormDyeingRequisitionDetailsTableName,
    wdFormDyeingRequisitionDetailsWdTableName,
    wdFormDyeingRequisitionDetailsDyeingServicesTableName,
    wdFormOrderDetailsWdFormDetailsTableName,

    weTableName,
    weAddRequisitionTableName,
    weAddRequisitionDetailsTableName,
    weAddRequisitionDetailsDyedFabricOrderTableName,
    
    weSellRequisitionTableName,
    weSellRequisitionDetailsTableName,
    weSellRequisitionDetailsWeTableName,
    
    weSellRequisitionDirectDetailsTableName,

    weReconciliationRequisitionTableName,
    weReconciliationRequisitionDetailsTableName,
    weReconciliationRequisitionDetailsWeTableName,

    weReturnRequisitionTableName,
    weReturnRequisitionDetailsTableName,
    weReturnRequisitionDetailsWeTableName,

    weReturnSellRequisitionTableName,
    weReturnSellRequisitionDetailsTableName,
    weReturnSellRequisitionDetailsReturnDetailsTableName,
    weReturnSellRequisitionDetailsWeTableName,

    weDyedFabricOrderRequisitionTableName,
    weDyedFabricOrderRequisitionDetailsTableName,

    weExecuteOrderRequisitionTableName,
    weExecuteOrderRequisitionDetailsTableName,
    weExecuteOrderRequisitionDetailsWeTableName,

    weTransitionBetweenWHRequisitionTableName,
    weTransitionBetweenWHRequisitionDetailsTableName,
    weTransitionBetweenWHRequisitionDetailsWeTableName,

    weTransitionBetweenOrdersRequisitionTableName,
    weTransitionBetweenOrdersRequisitionDetailsTableName,
    weTransitionBetweenOrdersRequisitionDetailsWeTableName,
}