
// Config
const knex = require("../../config/connection").getConnection();

// Util
const { wdDyeingRequisitionDetailsTableName, wdDyeingRequisitionTableName, weSellRequisitionDetailsTableName, fabricTableName, colorCategoryTableName, colorTableName, weAddRequisitionDetailsTableName, weSellRequisitionTableName, bussinessmanTableName, weTableName, weSellRequisitionDetailsWeTableName, anointedColorsPricesTableName, weReconciliationRequisitionDetailsTableName, weReconciliationRequisitionDetailsWeTableName, wdFormDyeingRequisitionDetailsTableName, weReturnSellRequisitionDetailsTableName, weReturnSellRequisitionDetailsReturnDetailsTableName, weReturnSellRequisitionTableName, weTransitionBetweenWHRequisitionDetailsTableName, weTransitionBetweenWHRequisitionDetailsWeTableName, weExecuteOrderRequisitionDetailsWeTableName, weExecuteOrderRequisitionDetailsTableName, weDyedFabricOrderRequisitionTableName, weDyedFabricOrderRequisitionDetailsTableName } = require("../../../util/database-tables-name");


exports.dyeingReportByFabric = async (dyedFabricId) => {
    let queryResults = [];
    let columns = ["id", "quantity", "date", "requisition_id"]

    let whereCluse = {};
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`] = dyedFabricId;
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_deleted`] = 0;
    whereCluse[`${wdDyeingRequisitionDetailsTableName}.is_active`] = 1;

    await knex.select(columns).from(function () {
        this.select([
            `${wdDyeingRequisitionDetailsTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.quantity`,
            `${wdDyeingRequisitionTableName}.date`,
            `${wdDyeingRequisitionTableName}.id as requisition_id`
        ])
            .from(wdDyeingRequisitionDetailsTableName)
            .innerJoin(`${wdDyeingRequisitionTableName}`,
                `${wdDyeingRequisitionTableName}.id`,
                `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
            .where(whereCluse)
            .as('t1')
    }).as('temp')
        .sum("quantity as quantity")
        .where("quantity", ">", "0")
        .then(data => {
            queryResults = data
        })
        .catch(error => {
            console.log(error);
        })
    return queryResults;
};

exports.dyedFabricOrdersReport = async (whereCluse) => {

    var queryResults = []
    let columns = [
        "we_dyed_fabric_order_requisition_id",
        "we_dyed_fabric_order_requisition_name",
        "we_dyed_fabric_order_requisition_is_order",
        "we_dyed_fabric_order_requisition_details_is_order",
        "bussiness_man_name",
        "dyed_fabric_name",
        "dyed_fabric_code",
        "needed_quantity",
        // "executed_quantity",
        "current_quantity"
    ]

    await knex.select(columns).from(function () {
        this.select(
            [
                `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
                `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
                `${weDyedFabricOrderRequisitionTableName}.is_order as we_dyed_fabric_order_requisition_is_order`,
                `${weDyedFabricOrderRequisitionDetailsTableName}.is_order as we_dyed_fabric_order_requisition_details_is_order`,
                `${bussinessmanTableName}.name as bussiness_man_name`,
                `${fabricTableName}.name as dyed_fabric_name`,
                `${fabricTableName}.code as dyed_fabric_code`,
                `${weDyedFabricOrderRequisitionDetailsTableName}.initial_quantity  as needed_quantity`,
                // knex.raw(
                //   `CASE WHEN ${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity > ${0}
                //   THEN coalesce( ${weDyedFabricOrderRequisitionDetailsTableName}.initial_quantity - ${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity )
                //   ELSE ${0}
                //   END as executed_quantity`),
                  knex.raw(
                    `CASE WHEN ${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity > ${0}
                    THEN coalesce( ${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity )
                    ELSE ${0}
                    END as current_quantity`)
            ])
            .from(`${weDyedFabricOrderRequisitionTableName}`)
            .innerJoin(`${weDyedFabricOrderRequisitionDetailsTableName}`,
                `${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`,
                `${weDyedFabricOrderRequisitionTableName}.id`)
            .innerJoin(`${bussinessmanTableName}`,
                `${bussinessmanTableName}.id`,
                `${weDyedFabricOrderRequisitionTableName}.seller_id`)
            .innerJoin(`${fabricTableName}`,
                `${fabricTableName}.id`,
                `${weDyedFabricOrderRequisitionDetailsTableName}.dyed_fabric_id`)
            .where(`${weDyedFabricOrderRequisitionDetailsTableName}.initial_quantity`, ">", 0)
            .as('t1')              
    }).as('temp')
    .where(whereCluse)
        .sum("needed_quantity as needed_quantity")
        // .sum("executed_quantity as executed_quantity")
        .sum("current_quantity as current_quantity")
        .groupBy("bussiness_man_name", "we_dyed_fabric_order_requisition_id", 
        "dyed_fabric_name")
        .then(data => {
            queryResults = data
        })
        .catch(error => {
            console.log(error);
        })
    return queryResults
}

exports.salesReport = async () => {

    var queryResults = []
    let columns = [
        "requisition_id",
        "number",
        "date",
        "we_dyed_fabric_order_requisition_id",
        "we_dyed_fabric_order_requisition_name",
        "dyed_fabric_name",
        "dyed_fabric_code",
        "dyeing_code",
        "price",
        "color_category_name",
        "color_name",
        "color_code",
        "bussiness_man_name",
        "type_of_requisition",
        "is_return_type",
        "input_output",
        "sign",
        "sell_quantity",
        "return_quantity",
        "quantity"
    ]

    await knex.select(columns).from(function () {
        this.select(
            [
                `${weSellRequisitionTableName}.id as requisition_id`,
                `${weSellRequisitionTableName}.number`,
                `${weSellRequisitionTableName}.date`,
                `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
                `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
                `${fabricTableName}.name as dyed_fabric_name`,
                `${fabricTableName}.code as dyed_fabric_code`,
                `${fabricTableName}.dyeing_code`,
                `${weSellRequisitionDetailsTableName}.price`,
                `${colorCategoryTableName}.name as color_category_name`,
                `${colorTableName}.name as color_name`,
                `${weAddRequisitionDetailsTableName}.color_code`,
                `${bussinessmanTableName}.name as bussiness_man_name`,
                knex.raw('? as type_of_requisition', 'اذن بيع'),
                knex.raw('? as is_return_type', 'sell_warning'),
                knex.raw('? as input_output', '1'),
                knex.raw('? as sign', ''),
                `${weSellRequisitionDetailsTableName}.quantity as sell_quantity`,
                knex.raw('? as return_quantity', 0),
                `${weSellRequisitionDetailsTableName}.quantity`,
            ])
            .from(`${weSellRequisitionDetailsTableName}`)
            .innerJoin(`${weSellRequisitionTableName}`,
                `${weSellRequisitionTableName}.id`,
                `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
                .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
                    `${weDyedFabricOrderRequisitionTableName}.id`,
                    `${weSellRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
            .innerJoin(`${bussinessmanTableName}`,
                `${bussinessmanTableName}.id`,
                `${weSellRequisitionTableName}.seller_id`)
            .innerJoin(`${fabricTableName}`,
                `${fabricTableName}.id`,
                `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
            .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
                `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
                `${weSellRequisitionDetailsTableName}.id`)
            .innerJoin(`${weTableName}`,
                `${weTableName}.id`,
                `${weSellRequisitionDetailsWeTableName}.we_id`)
            .innerJoin(`${weAddRequisitionDetailsTableName}`,
                `${weAddRequisitionDetailsTableName}.id`,
                `${weTableName}.we_add_requisition_details_id`)
            .innerJoin(`${colorCategoryTableName}`,
                `${colorCategoryTableName}.id`,
                `${weAddRequisitionDetailsTableName}.color_category_id`)
            .innerJoin(`${colorTableName}`,
                `${colorTableName}.id`,
                `${weAddRequisitionDetailsTableName}.color_id`)
            .where(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
            .as('t1')
            .union(function () {
                this.select([
                    `${weSellRequisitionTableName}.id as requisition_id`,
                    `${weSellRequisitionTableName}.number`,
                    `${weSellRequisitionTableName}.date`,
                    `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
                    `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
                    `${fabricTableName}.name as dyed_fabric_name`,
                    `${fabricTableName}.code as dyed_fabric_code`,
                    `${fabricTableName}.dyeing_code`,
                    `${weSellRequisitionDetailsTableName}.price`,
                    `${colorCategoryTableName}.name as color_category_name`,
                    `${colorTableName}.name as color_name`,
                    `${weReconciliationRequisitionDetailsTableName}.color_code`,
                    `${bussinessmanTableName}.name as bussiness_man_name`,
                    knex.raw('? as type_of_requisition', 'اذن بيع'),
                    knex.raw('? as is_return_type', 'sell_warning'),
                    knex.raw('? as input_output', '1'),
                    knex.raw('? as sign', ''),
                    `${weSellRequisitionDetailsTableName}.quantity as sell_quantity`,
                knex.raw('? as return_quantity', 0),
                `${weSellRequisitionDetailsTableName}.quantity`,
                ])
                    .from(`${weSellRequisitionDetailsTableName}`)
                    .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
                    .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
                        `${weDyedFabricOrderRequisitionTableName}.id`,
                        `${weSellRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
                    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
                    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
                    .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
                        `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
                        `${weSellRequisitionDetailsTableName}.id`)
                    .innerJoin(`${weTableName}`,
                        `${weTableName}.id`,
                        `${weSellRequisitionDetailsWeTableName}.we_id`)
                    .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`,
                        `${weReconciliationRequisitionDetailsWeTableName}.we_id`,
                        `${weTableName}.id`)
                    .innerJoin(`${weReconciliationRequisitionDetailsTableName}`,
                        `${weReconciliationRequisitionDetailsTableName}.id`,
                        `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`)
                    .innerJoin(`${colorCategoryTableName}`,
                        `${colorCategoryTableName}.id`,
                        `${weReconciliationRequisitionDetailsTableName}.color_category_id`)
                    .innerJoin(`${colorTableName}`,
                        `${colorTableName}.id`,
                        `${weReconciliationRequisitionDetailsTableName}.color_id`)
                    .where(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
            })
            .union(function () {
                this.select([
                    `${weSellRequisitionTableName}.id as requisition_id`,
                    `${weSellRequisitionTableName}.number`,
                    `${weSellRequisitionTableName}.date`,
                    `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
                    `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
                    `${fabricTableName}.name as dyed_fabric_name`,
                    `${fabricTableName}.code as dyed_fabric_code`,
                    `${fabricTableName}.dyeing_code`,
                    `${weSellRequisitionDetailsTableName}.price`,
                    `${colorCategoryTableName}.name as color_category_name`,
                    `${colorTableName}.name as color_name`,
                    `${anointedColorsPricesTableName}.code as color_code`,
                    `${bussinessmanTableName}.name as bussiness_man_name`,
                    knex.raw('? as type_of_requisition', 'اذن بيع'),
                    knex.raw('? as is_return_type', 'sell_warning'),
                    knex.raw('? as input_output', '1'),
                    knex.raw('? as sign', ''),
                    `${weSellRequisitionDetailsTableName}.quantity as sell_quantity`,
                knex.raw('? as return_quantity', 0),
                `${weSellRequisitionDetailsTableName}.quantity`,
                ])
                    .from(`${weSellRequisitionDetailsTableName}`)
                    .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
                    .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
                        `${weDyedFabricOrderRequisitionTableName}.id`,
                        `${weSellRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
                    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
                    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
                    .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
                        `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
                        `${weSellRequisitionDetailsTableName}.id`)
                    .innerJoin(`${weTableName}`,
                        `${weTableName}.id`,
                        `${weSellRequisitionDetailsWeTableName}.we_id`)
                    .innerJoin(`${wdDyeingRequisitionDetailsTableName}`,
                        `${wdDyeingRequisitionDetailsTableName}.id`,
                        `${weTableName}.wd_dyeing_requisition_details_id`)
                    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
                        `${wdFormDyeingRequisitionDetailsTableName}.id`,
                        `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
                    .innerJoin(`${anointedColorsPricesTableName}`,
                        `${anointedColorsPricesTableName}.id`,
                        `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
                    .innerJoin(`${colorCategoryTableName}`,
                        `${colorCategoryTableName}.id`,
                        `${anointedColorsPricesTableName}.color_category_id`)
                    .innerJoin(`${colorTableName}`,
                        `${colorTableName}.id`,
                        `${anointedColorsPricesTableName}.color_id`)
                    .where(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
            })
            .union(function () {
                this.select([
                    `${weReturnSellRequisitionTableName}.id as requisition_id`,
                    `${weReturnSellRequisitionTableName}.number`,
                    `${weReturnSellRequisitionTableName}.date`,
                    `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
                    `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
                    `${fabricTableName}.name as dyed_fabric_name`,
                    `${fabricTableName}.code as dyed_fabric_code`,
                    `${fabricTableName}.dyeing_code`,
                    `${weReturnSellRequisitionDetailsTableName}.price`,
                    `${colorCategoryTableName}.name as color_category_name`,
                    `${colorTableName}.name as color_name`,
                    `${weAddRequisitionDetailsTableName}.color_code`,
                    `${bussinessmanTableName}.name as bussiness_man_name`,
                    knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
                    knex.raw('? as is_return_type', 'return_warning'),
                    knex.raw('? as input_output', '0'),
                    knex.raw('? as sign', '-'),
                    knex.raw('? as sell_quantity', 0),
                    `${weReturnSellRequisitionDetailsTableName}.quantity as return_quantity`,
                    `${weReturnSellRequisitionDetailsTableName}.quantity`,
                ])
                    .from(`${weReturnSellRequisitionDetailsTableName}`)
                    .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
                    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnSellRequisitionTableName}.seller_id`)
                    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
                    .innerJoin(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`,
                        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`,
                        `${weReturnSellRequisitionDetailsTableName}.id`)
                    .innerJoin(`${weSellRequisitionDetailsTableName}`,
                        `${weSellRequisitionDetailsTableName}.id`,
                        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`)
                    .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
                        `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
                        `${weSellRequisitionDetailsTableName}.id`)
                    .innerJoin(`${weTableName}`,
                        `${weTableName}.id`,
                        `${weSellRequisitionDetailsWeTableName}.we_id`)
                        .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
                            `${weDyedFabricOrderRequisitionTableName}.id`,
                            `${weSellRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
                    .innerJoin(`${weAddRequisitionDetailsTableName}`,
                        `${weAddRequisitionDetailsTableName}.id`,
                        `${weTableName}.we_add_requisition_details_id`)
                    .innerJoin(`${colorCategoryTableName}`,
                        `${colorCategoryTableName}.id`,
                        `${weAddRequisitionDetailsTableName}.color_category_id`)
                    .innerJoin(`${colorTableName}`,
                        `${colorTableName}.id`,
                        `${weAddRequisitionDetailsTableName}.color_id`)
                    .where(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
            })
            .union(function () {
                this.select([
                    `${weReturnSellRequisitionTableName}.id as requisition_id`,
                    `${weReturnSellRequisitionTableName}.number`,
                    `${weReturnSellRequisitionTableName}.date`,
                    `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
                    `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
                    `${fabricTableName}.name as dyed_fabric_name`,
                    `${fabricTableName}.code as dyed_fabric_code`,
                    `${fabricTableName}.dyeing_code`,
                    `${weReturnSellRequisitionDetailsTableName}.price`,
                    `${colorCategoryTableName}.name as color_category_name`,
                    `${colorTableName}.name as color_name`,
                    `${weReconciliationRequisitionDetailsTableName}.color_code`,
                    `${bussinessmanTableName}.name as bussiness_man_name`,
                    knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
                    knex.raw('? as is_return_type', 'return_warning'),
                    knex.raw('? as input_output', '0'),
                    knex.raw('? as sign', '-'),
                    knex.raw('? as sell_quantity', 0),
                    `${weReturnSellRequisitionDetailsTableName}.quantity as return_quantity`,
                    `${weReturnSellRequisitionDetailsTableName}.quantity`,
                ])
                    .from(`${weReturnSellRequisitionDetailsTableName}`)
                    .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
                    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnSellRequisitionTableName}.seller_id`)
                    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
                    .innerJoin(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`,
                        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`,
                        `${weReturnSellRequisitionDetailsTableName}.id`)
                    .innerJoin(`${weSellRequisitionDetailsTableName}`,
                        `${weSellRequisitionDetailsTableName}.id`,
                        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`)
                    .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
                        `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
                        `${weSellRequisitionDetailsTableName}.id`)
                    .innerJoin(`${weTableName}`,
                        `${weTableName}.id`,
                        `${weSellRequisitionDetailsWeTableName}.we_id`)
                        .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
                            `${weDyedFabricOrderRequisitionTableName}.id`,
                            `${weSellRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
                    .innerJoin(`${weReconciliationRequisitionDetailsWeTableName}`,
                        `${weReconciliationRequisitionDetailsWeTableName}.we_id`,
                        `${weTableName}.id`)
                    .innerJoin(`${weReconciliationRequisitionDetailsTableName}`,
                        `${weReconciliationRequisitionDetailsTableName}.id`,
                        `${weReconciliationRequisitionDetailsWeTableName}.we_reconcilition_requisition_details_id`)
                    .innerJoin(`${colorCategoryTableName}`,
                        `${colorCategoryTableName}.id`,
                        `${weReconciliationRequisitionDetailsTableName}.color_category_id`)
                    .innerJoin(`${colorTableName}`,
                        `${colorTableName}.id`,
                        `${weReconciliationRequisitionDetailsTableName}.color_id`)
                    .where(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
            })
            .union(function () {
                this.select([
                    `${weReturnSellRequisitionTableName}.id as requisition_id`,
                    `${weReturnSellRequisitionTableName}.number`,
                    `${weReturnSellRequisitionTableName}.date`,
                    `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
                    `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
                    `${fabricTableName}.name as dyed_fabric_name`,
                    `${fabricTableName}.code as dyed_fabric_code`,
                    `${fabricTableName}.dyeing_code`,
                    `${weReturnSellRequisitionDetailsTableName}.price`,
                    `${colorCategoryTableName}.name as color_category_name`,
                    `${colorTableName}.name as color_name`,
                    `${anointedColorsPricesTableName}.code as color_code`,
                    `${bussinessmanTableName}.name as bussiness_man_name`,
                    knex.raw('? as type_of_requisition', 'اذن مرتجع صرف'),
                    knex.raw('? as is_return_type', 'return_warning'),
                    knex.raw('? as input_output', '0'),
                    knex.raw('? as sign', '-'),
                    knex.raw('? as sell_quantity', 0),
                    `${weReturnSellRequisitionDetailsTableName}.quantity as return_quantity`,
                    `${weReturnSellRequisitionDetailsTableName}.quantity`,
                ])
                    .from(`${weReturnSellRequisitionDetailsTableName}`)
                    .innerJoin(`${weReturnSellRequisitionTableName}`, `${weReturnSellRequisitionTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.we_return_sell_requisition_id`)
                    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weReturnSellRequisitionTableName}.seller_id`)
                    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weReturnSellRequisitionDetailsTableName}.dyed_fabric_id`)
                    .innerJoin(`${weReturnSellRequisitionDetailsReturnDetailsTableName}`,
                        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_return_sell_requisition_details_id`,
                        `${weReturnSellRequisitionDetailsTableName}.id`)
                    .innerJoin(`${weSellRequisitionDetailsTableName}`,
                        `${weSellRequisitionDetailsTableName}.id`,
                        `${weReturnSellRequisitionDetailsReturnDetailsTableName}.we_sell_requisition_details_id`)
                        .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
                            `${weDyedFabricOrderRequisitionTableName}.id`,
                            `${weSellRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
                    .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
                        `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
                        `${weSellRequisitionDetailsTableName}.id`)
                    .innerJoin(`${weTableName}`,
                        `${weTableName}.id`,
                        `${weSellRequisitionDetailsWeTableName}.we_id`)
                    .innerJoin(`${wdDyeingRequisitionDetailsTableName}`,
                        `${wdDyeingRequisitionDetailsTableName}.id`,
                        `${weTableName}.wd_dyeing_requisition_details_id`)
                    .innerJoin(`${wdFormDyeingRequisitionDetailsTableName}`,
                        `${wdFormDyeingRequisitionDetailsTableName}.id`,
                        `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
                    .innerJoin(`${anointedColorsPricesTableName}`,
                        `${anointedColorsPricesTableName}.id`,
                        `${wdFormDyeingRequisitionDetailsTableName}.dyeing_colors_prices_id`)
                    .innerJoin(`${colorCategoryTableName}`,
                        `${colorCategoryTableName}.id`,
                        `${anointedColorsPricesTableName}.color_category_id`)
                    .innerJoin(`${colorTableName}`,
                        `${colorTableName}.id`,
                        `${anointedColorsPricesTableName}.color_id`)
                    .where(`${weReturnSellRequisitionDetailsTableName}.quantity`, ">", 0)
            })
            .union(function () {
                this.select([
                    `${weSellRequisitionTableName}.id as requisition_id`,
                    `${weSellRequisitionTableName}.number`,
                    `${weSellRequisitionTableName}.date`,
                    `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
                    `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
                    `${fabricTableName}.name as dyed_fabric_name`,
                    `${fabricTableName}.code as dyed_fabric_code`,
                    `${fabricTableName}.dyeing_code`,
                    `${weSellRequisitionDetailsTableName}.price`,
                    `${colorCategoryTableName}.name as color_category_name`,
                    `${colorTableName}.name as color_name`,
                    `${weTransitionBetweenWHRequisitionDetailsTableName}.color_code`,
                    `${bussinessmanTableName}.name as bussiness_man_name`,
                    knex.raw('? as type_of_requisition', 'اذن بيع'),
                    knex.raw('? as is_return_type', 'sell_warning'),
                    knex.raw('? as input_output', '1'),
                    knex.raw('? as sign', ''),
                    `${weSellRequisitionDetailsTableName}.quantity as sell_quantity`,
                knex.raw('? as return_quantity', 0),
                `${weSellRequisitionDetailsTableName}.quantity`,
                ])
                    .from(`${weSellRequisitionDetailsTableName}`)
                    .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
                    .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
                        `${weDyedFabricOrderRequisitionTableName}.id`,
                        `${weSellRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
                    .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
                    .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
                    .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
                        `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
                        `${weSellRequisitionDetailsTableName}.id`)
                        .innerJoin(`${weTableName}`,
                        `${weTableName}.id`,
                        `${weSellRequisitionDetailsWeTableName}.we_id`)
                    .innerJoin(`${weTransitionBetweenWHRequisitionDetailsTableName}`,
                        `${weTransitionBetweenWHRequisitionDetailsTableName}.id`,
                        `${weTableName}.we_transition_between_wh_requisitions_details_id`)
                    .innerJoin(`${colorCategoryTableName}`,
                        `${colorCategoryTableName}.id`,
                        `${weTransitionBetweenWHRequisitionDetailsTableName}.color_category_id`)
                    .innerJoin(`${colorTableName}`,
                        `${colorTableName}.id`,
                        `${weTransitionBetweenWHRequisitionDetailsTableName}.color_id`)
                    .where(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
            })
            // .union(function () {
            //     this.select([
            //         `${weSellRequisitionTableName}.id as requisition_id`,
            //         `${weSellRequisitionTableName}.number`,
            //         `${weSellRequisitionTableName}.date`,
            //         `${weDyedFabricOrderRequisitionTableName}.id as we_dyed_fabric_order_requisition_id`,
            //         `${weDyedFabricOrderRequisitionTableName}.name as we_dyed_fabric_order_requisition_name`,
            //         `${fabricTableName}.name as dyed_fabric_name`,
            //         `${fabricTableName}.code as dyed_fabric_code`,
            //         `${fabricTableName}.dyeing_code`,
            //         `${weSellRequisitionDetailsTableName}.price`,
            //         `${colorCategoryTableName}.name as color_category_name`,
            //         `${colorTableName}.name as color_name`,
            //         `${weExecuteOrderRequisitionDetailsTableName}.color_code`,
            //         `${bussinessmanTableName}.name as bussiness_man_name`,
            //         knex.raw('? as type_of_requisition', 'اذن بيع'),
            //         knex.raw('? as is_return_type', 'sell_warning'),
            //         knex.raw('? as input_output', '1'),
            //         knex.raw('? as sign', ''),
            //         `${weSellRequisitionDetailsTableName}.quantity as sell_quantity`,
            //     knex.raw('? as return_quantity', 0),
            //     `${weSellRequisitionDetailsTableName}.quantity`,
            //     ])
            //         .from(`${weSellRequisitionDetailsTableName}`)
            //         .innerJoin(`${weSellRequisitionTableName}`, `${weSellRequisitionTableName}.id`, `${weSellRequisitionDetailsTableName}.we_sell_requisition_id`)
            //         .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
            //             `${weDyedFabricOrderRequisitionTableName}.id`,
            //             `${weSellRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
            //         .innerJoin(`${bussinessmanTableName}`, `${bussinessmanTableName}.id`, `${weSellRequisitionTableName}.seller_id`)
            //         .innerJoin(`${fabricTableName}`, `${fabricTableName}.id`, `${weSellRequisitionDetailsTableName}.dyed_fabric_id`)
            //         .innerJoin(`${weSellRequisitionDetailsWeTableName}`,
            //             `${weSellRequisitionDetailsWeTableName}.we_sell_requisition_details_id`,
            //             `${weSellRequisitionDetailsTableName}.id`)
            //             .innerJoin(`${weTableName}`,
            //             `${weTableName}.id`,
            //             `${weSellRequisitionDetailsWeTableName}.we_id`)
            //         .innerJoin(`${weExecuteOrderRequisitionDetailsTableName}`,
            //             `${weExecuteOrderRequisitionDetailsTableName}.id`,
            //             `${weTableName}.we_execute_order_requisition_details_id`)
            //         .innerJoin(`${colorCategoryTableName}`,
            //             `${colorCategoryTableName}.id`,
            //             `${weExecuteOrderRequisitionDetailsTableName}.color_category_id`)
            //         .innerJoin(`${colorTableName}`,
            //             `${colorTableName}.id`,
            //             `${weExecuteOrderRequisitionDetailsTableName}.color_id`)
            //         .where(`${weSellRequisitionDetailsTableName}.quantity`, ">", 0)
            // })
    }).as('temp')
        .sum("sell_quantity as sell_quantity")
        .sum("return_quantity as return_quantity")
        .sum("quantity as quantity")
        .groupBy("we_dyed_fabric_order_requisition_id",
            "type_of_requisition", "requisition_id", 
        "dyed_fabric_name", "color_category_name", 
        "color_code", "price")
        .then(data => {
            queryResults = data
        })
        .catch(error => {
            console.log(error);
        })
    return queryResults
}