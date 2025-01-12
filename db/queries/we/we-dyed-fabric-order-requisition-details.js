// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { weDyedFabricOrderRequisitionTableName, weDyedFabricOrderRequisitionDetailsTableName,
    fabricTableName, bussinessmanTableName, 
    colorCategoryTableName, colorTableName,warehouseTableName, weExecuteOrderRequisitionDetailsTableName, weExecuteOrderRequisitionTableName, 
    ordersRequisitionsTableName} = require("../../../util/database-tables-name");

exports.insert = async (weDyedFabricOrderRequisitionDetails, items) => {
    let queryResults = false;
    await sqlFun
        .insert(weDyedFabricOrderRequisitionDetailsTableName, {
            id: items.weDyedFabricOrderRequisitionDetailsId,
            we_dyed_fabric_order_requisition_id: weDyedFabricOrderRequisitionDetails.id,
            orders_requisitions_id: weDyedFabricOrderRequisitionDetails.ordersRequisitionsId,
            color_category_id: items.colorCategoryId,
            color_id: items.colorId,
            dyed_fabric_id: items.dyedFabricId,
            color_code: items.colorCode,
            initial_quantity: items.quantity,
            current_quantity: items.quantity,
            waste_ratio: items.wasteRatio,
            fabric_width: items.fabricWidth,
            fabric_quantity_m2: items.fabricQuantityM2,
            price: items.price,
            price_dollar: items.priceDollar,
            note: items.note,
            creator_id: weDyedFabricOrderRequisitionDetails.personid,
            ip_address: weDyedFabricOrderRequisitionDetails.ipaddress,
        })
        .then((data) => {
            queryResults = true;
        })
        .catch((error) => {
            console.log(error);
        });
    return queryResults;
};

exports.selectByRequisitionId = async (whereCluse) => {
    let queryResults = [];

    await knex.select([
        `${ordersRequisitionsTableName}.name as order_name`,
        `${weDyedFabricOrderRequisitionTableName}.id as requisition_id`,
        `${weDyedFabricOrderRequisitionTableName}.orders_requisitions_id`,
        `${weDyedFabricOrderRequisitionTableName}.date`,
        `${weDyedFabricOrderRequisitionTableName}.number`,
        `${weDyedFabricOrderRequisitionTableName}.note`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.id`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.note as details_note`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.initial_quantity  as quantity`,
        // `${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity`,
        knex.raw(
            `CASE WHEN ${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity < ${0}
            THEN ${0}
            ELSE ${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity
            END as current_quantity`),
          knex.raw(
            `CASE WHEN ${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity < ${0}
            THEN coalesce( ${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity * -1 )
            ELSE ${0}
            END as over_current_quantity`),
        `${weDyedFabricOrderRequisitionDetailsTableName}.color_code`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.waste_ratio`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.fabric_width`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.fabric_quantity_m2`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.price`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.price_dollar`,
        `${fabricTableName}.id as dyed_fabric_id`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${bussinessmanTableName}.id as seller_id`,
        `${bussinessmanTableName}.name as seller_name`,
        `${bussinessmanTableName}.phone as seller_phone`,
        `${colorCategoryTableName}.id as color_category_id`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.id as color_id`,
        `${colorTableName}.name as color_name`,
        knex.raw(`CONCAT(${colorTableName}.name, ' (كود: ', ${weDyedFabricOrderRequisitionDetailsTableName}.color_code, ')' ) as "color_name_code"`),
    ])
        .from(`${weDyedFabricOrderRequisitionDetailsTableName}`)
        .innerJoin(`${ordersRequisitionsTableName}`,
            `${ordersRequisitionsTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`)
        .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
            `${weDyedFabricOrderRequisitionTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
        .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${weDyedFabricOrderRequisitionTableName}.seller_id`)
        .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.color_category_id`)
        .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.color_id`)
        .where(whereCluse)
        .andWhere(`${weDyedFabricOrderRequisitionDetailsTableName}.initial_quantity`, ">", 0)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.selectByRequisitionIds = async (whereCluse, requisitionsIds) => {
    let queryResults = [];
    
    await knex.select([
        `${weDyedFabricOrderRequisitionDetailsTableName}.id`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.note as details_note`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.initial_quantity  as quantity`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.color_code as colorCode`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.waste_ratio`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.waste_ratio as wasteRatio`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.fabric_width`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.fabric_quantity_m2`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.price`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.price_dollar`,
        `${ordersRequisitionsTableName}.name as order_name`,
        `${fabricTableName}.fabric_id as fabricId`,
        `${fabricTableName}.id as dyedFabricId`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        // `${fabricTableName}.waste_ratio`,
        // `${fabricTableName}.waste_ratio as wasteRatio`,
        `row_fabric.name as fabric_name`,
        `row_fabric.code as fabric_code`,
        `${bussinessmanTableName}.id as seller_id`,
        `${bussinessmanTableName}.name as seller_name`,
        `${bussinessmanTableName}.phone as seller_phone`,
        `${colorCategoryTableName}.id as color_category_id`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.id as colorId`,
        `${colorTableName}.name as color_name`,
    ])
    .sum(`${weDyedFabricOrderRequisitionDetailsTableName}.initial_quantity  as quantity`)
    .sum(`${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity as current_quantity`)
        .from(`${weDyedFabricOrderRequisitionDetailsTableName}`)
        .innerJoin(`${ordersRequisitionsTableName}`,
            `${ordersRequisitionsTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.orders_requisitions_id`)
        .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
            `${weDyedFabricOrderRequisitionTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
        .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${weDyedFabricOrderRequisitionTableName}.seller_id`)
        .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.color_category_id`)
        .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.color_id`)
            .innerJoin(`${fabricTableName} as row_fabric`,
            `row_fabric.id`,
            `${fabricTableName}.fabric_id`)
        .where(whereCluse)
        .whereIn(`${weDyedFabricOrderRequisitionTableName}.id`, requisitionsIds)
        .andWhere(`${weDyedFabricOrderRequisitionDetailsTableName}.initial_quantity`, ">", 0)
        .groupBy(
            `${weDyedFabricOrderRequisitionDetailsTableName}.dyed_fabric_id`, 
            `${weDyedFabricOrderRequisitionDetailsTableName}.color_category_id`, 
            `${weDyedFabricOrderRequisitionDetailsTableName}.color_id`, 
            )
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.selectWarehouseByRequisitionDetailsId = async (whereCluse) => {
//     let queryResults = [];
//     let columns = [
//         "dyed_fabric_id",
//         "we_dyed_fabric_order_requisition_details_id",
//         "warehouse_id",
//         "warehouse_name",
//         "is_grade",
//         "quantity"
//     ]

//     await knex.select(columns).from(function () {
//         this.select(
//             [
//                 `${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`,
//                 `${wdDyeingRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_details_id`,
//                 `${wdDyeingRequisitionTableName}.warehouse_id`,
//                 `${warehouseTableName}.name as warehouse_name`,
//                 `${warehouseTableName}.is_grade`,
//                 `${wdDyeingRequisitionDetailsTableName}.dyeing_quantity as quantity`,

//             ])
//             .from(`${wdDyeingRequisitionDetailsTableName}`)
//             .innerJoin(`${wdDyeingRequisitionTableName}`,
//                 `${wdDyeingRequisitionTableName}.id`,
//                 `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
//             .innerJoin(`${warehouseTableName}`,
//                 `${warehouseTableName}.id`,
//                 `${wdDyeingRequisitionTableName}.warehouse_id`)
//             .where(`${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`, ">", 0)
//             .as('t1')
//             .union(function () {
//                 this.select([

//                 ])
//                 .from(`${wdDyeingRequisitionDetailsTableName}`)
//             .innerJoin(`${wdDyeingRequisitionTableName}`,
//                 `${wdDyeingRequisitionTableName}.id`,
//                 `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
//             .innerJoin(`${warehouseTableName}`,
//                 `${warehouseTableName}.id`,
//                 `${wdDyeingRequisitionTableName}.warehouse_id`)
//             .where(`${wdDyeingRequisitionDetailsTableName}.dyeing_quantity`, ">", 0)
//             })
//     }).as('temp')
//     .sum("quantity as quantity")
//     .groupBy(`${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`,
//         `${weExecuteOrderRequisitionTableName}.warehouse_id`)

//     await knex.select([
//         `${weDyedFabricOrderRequisitionDetailsTableName}.id as we_dyed_fabric_order_requisition_details_id`,
//         `${warehouseTableName}.name as warehouse_name`,
//         `${warehouseTableName}.is_grade`,
//     ])
//         .sum(`${weExecuteOrderRequisitionDetailsTableName}.quantity as quantity`)
//         .from(`${weExecuteOrderRequisitionDetailsTableName}`)
//         .innerJoin(`${weDyedFabricOrderRequisitionDetailsTableName}`,
//             `${weDyedFabricOrderRequisitionDetailsTableName}.id`,
//             `${weExecuteOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_details_id`)
//         .innerJoin(`${weExecuteOrderRequisitionTableName}`,
//             `${weExecuteOrderRequisitionTableName}.id`,
//             `${weExecuteOrderRequisitionDetailsTableName}.we_execute_order_requisition_id`)
//         .innerJoin(`${warehouseTableName}`,
//             `${warehouseTableName}.id`,
//             `${weExecuteOrderRequisitionTableName}.warehouse_id`)
//         .where(whereCluse)
//         .andWhere(`${weExecuteOrderRequisitionDetailsTableName}.quantity`, ">", 0)
//         .groupBy(`${weExecuteOrderRequisitionDetailsTableName}.dyed_fabric_id`,
//             `${weExecuteOrderRequisitionTableName}.warehouse_id`)
//         .then((data) => {
//             queryResults = data;
//         })
//     .catch((error) => console.error(error));
//   return queryResults;
};

exports.selectOne = async (whereCluse) => {
    let queryResults = false;
    await knex
        .select([
            `${weDyedFabricOrderRequisitionDetailsTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`,
      `${weDyedFabricOrderRequisitionDetailsTableName}.initial_quantity`,
      `${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity`,
        ])
        .from(`${weDyedFabricOrderRequisitionDetailsTableName}`)
        .where(whereCluse)
        .limit(1)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => {
            console.log(error);
        });
    return queryResults;
};

exports.selectOneForUpdate = async (whereCluse) => {
    let queryResults = false;
    await knex
      .select([
        `${weDyedFabricOrderRequisitionDetailsTableName}.id`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.initial_quantity`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity`,
        // `${waAddRequisitionDetailsYarnOrderTableName}.wa_add_requisition_details_id`,
        // `${waAddRequisitionDetailsYarnOrderTableName}.quantity`,
    ])
      .from(`${weDyedFabricOrderRequisitionDetailsTableName}`)
      .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
        `${weDyedFabricOrderRequisitionTableName}.id`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
      .where(whereCluse)
      .limit(1)
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => {
        console.log(error);
      });
    return queryResults;
  };

  
exports.update = async (weDyedFabricOrderRequisitionDetails, whereCluse) => {
    let queryResults = false;
    await sqlFun
        .update(
            weDyedFabricOrderRequisitionDetailsTableName,
            weDyedFabricOrderRequisitionDetails,
            whereCluse
        )
        .then((data) => {
            queryResults = true;
        })
        .catch((err) => console.log(err));
    return queryResults;
};

exports.selectOrdersBySeller = async (whereCluse) => {
    let queryResults = [];

    await knex.select([
        `${weDyedFabricOrderRequisitionTableName}.id as requisition_id`,
        `${weDyedFabricOrderRequisitionTableName}.date`,
        `${weDyedFabricOrderRequisitionTableName}.number`,
        `${weDyedFabricOrderRequisitionTableName}.name as order_name`,
        `${weDyedFabricOrderRequisitionTableName}.note`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.id`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.note as details_note`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.initial_quantity`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.wast_ratio`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.fabric_width`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.fabric_quantity_m2`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.price`,
        `${weDyedFabricOrderRequisitionDetailsTableName}.price_dollar`,
        `${fabricTableName}.id as dyed_fabric_id`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${bussinessmanTableName}.id as seller_id`,
        `${bussinessmanTableName}.name as seller_name`,
        `${bussinessmanTableName}.phone as seller_phone`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        knex.raw(`CONCAT('طلبية رقم: ', ${weDyedFabricOrderRequisitionTableName}.name,  ' - ',
        ${fabricTableName}.code, ${fabricTableName}.name, ' - ',
        ${colorCategoryTableName}.name, ' ', ${colorTableName}.name,
        ' - عرض: ', ${weDyedFabricOrderRequisitionDetailsTableName}.fabric_width, ' - وزن القماش: ', 
        ${weDyedFabricOrderRequisitionDetailsTableName}.fabric_quantity_m2) as dyeing_order_details`)
    ])
        .from(`${weDyedFabricOrderRequisitionDetailsTableName}`)
        .innerJoin(`${weDyedFabricOrderRequisitionTableName}`,
            `${weDyedFabricOrderRequisitionTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.we_dyed_fabric_order_requisition_id`)
        .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${weDyedFabricOrderRequisitionTableName}.seller_id`)
        .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.color_category_id`)
        .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${weDyedFabricOrderRequisitionDetailsTableName}.color_id`)
        .where(whereCluse)
        .andWhere(`${weDyedFabricOrderRequisitionDetailsTableName}.quantity`, ">", 0)
        .andWhere(`${weDyedFabricOrderRequisitionDetailsTableName}.current_quantity`, ">", 0)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};
