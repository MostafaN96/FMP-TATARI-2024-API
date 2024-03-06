// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const wdDyeingOrderRequisitionDetailsTableName = require("../../../util/database-tables-name").wdDyeingOrderRequisitionDetailsTableName;
const { wdDyeingOrderRequisitionTableName, fabricTableName, bussinessmanTableName, wdDyeingOrderDetailsWdFormDyeingDetailsTableName, colorCategoryTableName, colorTableName, wdFormOrderDetailsWdFormDetailsTableName, consigmentDyeingTableName, wdDyeingRequisitionDetailsTableName, wdFormDyeingRequisitionDetailsTableName, warehouseTableName, wdDyeingRequisitionTableName } = require("../../../util/database-tables-name");

exports.insert = async (wdDyeingOrderRequisitionDetails, items) => {
    let queryResults = false;
    await sqlFun
        .insert(wdDyeingOrderRequisitionDetailsTableName, {
            id: items.wdDyeingOrderRequisitionDetailsId,
            wd_form_dyeing_order_requisition_id: wdDyeingOrderRequisitionDetails.id,
            color_category_id: items.colorCategoryId,
            color_id: items.colorId,
            color_code: items.colorCode,
            dyed_fabric_id: items.dyedFabricId,
            quantity: items.quantity,
            form_current_quantity: items.quantity,
            dyeing_current_quantity: items.quantity,
            fabric_width: items.fabricWidth,
            fabric_quantity_m2: items.fabricQuantityM2,
            note: items.note,
            creator_id: wdDyeingOrderRequisitionDetails.personid,
            ip_address: wdDyeingOrderRequisitionDetails.ipaddress,
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
        `${wdDyeingOrderRequisitionTableName}.id as requisition_id`,
        `${wdDyeingOrderRequisitionTableName}.date`,
        `${wdDyeingOrderRequisitionTableName}.number`,
        `${wdDyeingOrderRequisitionTableName}.name as order_name`,
        `${wdDyeingOrderRequisitionTableName}.work_order_number`,
        `${wdDyeingOrderRequisitionTableName}.note`,
        `${wdDyeingOrderRequisitionDetailsTableName}.id`,
        `${wdDyeingOrderRequisitionDetailsTableName}.note as details_note`,
        `${wdDyeingOrderRequisitionDetailsTableName}.quantity`,
        `${wdDyeingOrderRequisitionDetailsTableName}.form_current_quantity`,
        `${wdDyeingOrderRequisitionDetailsTableName}.dyeing_current_quantity`,
        `${wdDyeingOrderRequisitionDetailsTableName}.color_code`,
        `${wdDyeingOrderRequisitionDetailsTableName}.fabric_width`,
        `${wdDyeingOrderRequisitionDetailsTableName}.fabric_quantity_m2`,
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
    ])
        .from(`${wdDyeingOrderRequisitionDetailsTableName}`)
        .innerJoin(`${wdDyeingOrderRequisitionTableName}`,
            `${wdDyeingOrderRequisitionTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`)
        .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdDyeingOrderRequisitionTableName}.seller_id`)
        .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.color_category_id`)
        .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.color_id`)
        .where(whereCluse)
        .andWhere(`${wdDyeingOrderRequisitionDetailsTableName}.quantity`, ">", 0)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.selectByRequisitionIds = async (whereCluse, requisitionsIds) => {
    let queryResults = [];
    
    await knex.select([
        `${wdDyeingOrderRequisitionDetailsTableName}.id`,
        `${wdDyeingOrderRequisitionDetailsTableName}.note as details_note`,
        `${wdDyeingOrderRequisitionDetailsTableName}.quantity`,
        `${wdDyeingOrderRequisitionDetailsTableName}.form_current_quantity`,
        `${wdDyeingOrderRequisitionDetailsTableName}.dyeing_current_quantity`,
        `${wdDyeingOrderRequisitionDetailsTableName}.color_code as colorCode`,
        `${wdDyeingOrderRequisitionDetailsTableName}.fabric_width`,
        `${wdDyeingOrderRequisitionDetailsTableName}.fabric_quantity_m2`,
        `${fabricTableName}.fabric_id as fabricId`,
        `${fabricTableName}.id as dyedFabricId`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${fabricTableName}.waste_ratio`,
        `${fabricTableName}.waste_ratio as wasteRatio`,
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
    .sum(`${wdDyeingOrderRequisitionDetailsTableName}.quantity as quantity`)
    .sum(`${wdDyeingOrderRequisitionDetailsTableName}.form_current_quantity as form_current_quantity`)
    .sum(`${wdDyeingOrderRequisitionDetailsTableName}.dyeing_current_quantity as dyeing_current_quantity`)
        .from(`${wdDyeingOrderRequisitionDetailsTableName}`)
        .innerJoin(`${wdDyeingOrderRequisitionTableName}`,
            `${wdDyeingOrderRequisitionTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`)
        .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdDyeingOrderRequisitionTableName}.seller_id`)
        .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.color_category_id`)
        .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.color_id`)
            .innerJoin(`${fabricTableName} as row_fabric`,
            `row_fabric.id`,
            `${fabricTableName}.fabric_id`)
        .where(whereCluse)
        .whereIn(`${wdDyeingOrderRequisitionTableName}.id`, requisitionsIds)
        .andWhere(`${wdDyeingOrderRequisitionDetailsTableName}.quantity`, ">", 0)
        .groupBy(
            `${wdDyeingOrderRequisitionDetailsTableName}.dyed_fabric_id`, 
            `${wdDyeingOrderRequisitionDetailsTableName}.color_category_id`, 
            `${wdDyeingOrderRequisitionDetailsTableName}.color_id`, 
            )
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.selectWarehouseByRequisitionDetailsId = async (whereCluse) => {
    let queryResults = [];

    await knex.select([
        `${warehouseTableName}.name as warehouse_name`,
    `${warehouseTableName}.is_grade`,
    ])
    .sum(`${wdDyeingRequisitionDetailsTableName}.dyeing_quantity as quantity`)
        .from(`${wdDyeingRequisitionDetailsTableName}`)
        .innerJoin(`${wdFormOrderDetailsWdFormDetailsTableName}`,
            `${wdFormOrderDetailsWdFormDetailsTableName}.wd_form_dyeing_requisition_details_id`,
            `${wdDyeingRequisitionDetailsTableName}.wd_form_dyeing_requisition_details_id`)
        .innerJoin(`${wdDyeingRequisitionTableName}`,
            `${wdDyeingRequisitionTableName}.id`,
            `${wdDyeingRequisitionDetailsTableName}.wd_dyeing_requisition_id`)
        .innerJoin(`${warehouseTableName}`,
            `${warehouseTableName}.id`,
            `${wdDyeingRequisitionTableName}.warehouse_id`)
        .where(whereCluse)
        .andWhere(`${wdDyeingRequisitionDetailsTableName}.quantity`, ">", 0)
        .groupBy(`${wdDyeingRequisitionDetailsTableName}.dyed_fabric_id`, 
    `${wdDyeingRequisitionTableName}.warehouse_id`)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.selectOne = async (whereCluse) => {
    let queryResults = false;
    await knex
        .select([
            `${wdDyeingOrderRequisitionDetailsTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.quantity`,
            `${wdDyeingOrderRequisitionDetailsTableName}.form_current_quantity`,
            `${wdDyeingOrderRequisitionDetailsTableName}.dyeing_current_quantity`,
        ])
        .from(`${wdDyeingOrderRequisitionDetailsTableName}`)
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

exports.update = async (wdDyeingOrderRequisitionDetails, whereCluse) => {
    let queryResults = false;
    await sqlFun
        .update(
            wdDyeingOrderRequisitionDetailsTableName,
            wdDyeingOrderRequisitionDetails,
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
        `${wdDyeingOrderRequisitionTableName}.id as requisition_id`,
        `${wdDyeingOrderRequisitionTableName}.date`,
        `${wdDyeingOrderRequisitionTableName}.number`,
        `${wdDyeingOrderRequisitionTableName}.name as order_name`,
`${wdDyeingOrderRequisitionTableName}.work_order_number`,
        `${wdDyeingOrderRequisitionTableName}.note`,
        `${wdDyeingOrderRequisitionDetailsTableName}.id`,
        `${wdDyeingOrderRequisitionDetailsTableName}.note as details_note`,
        `${wdDyeingOrderRequisitionDetailsTableName}.quantity`,
        `${wdDyeingOrderRequisitionDetailsTableName}.form_current_quantity`,
        `${wdDyeingOrderRequisitionDetailsTableName}.dyeing_current_quantity`,
`${wdDyeingOrderRequisitionDetailsTableName}.fabric_width`,
        `${wdDyeingOrderRequisitionDetailsTableName}.fabric_quantity_m2`,
        `${fabricTableName}.id as dyed_fabric_id`,
        `${fabricTableName}.name as dyed_fabric_name`,
        `${fabricTableName}.code as dyed_fabric_code`,
        `${bussinessmanTableName}.id as seller_id`,
        `${bussinessmanTableName}.name as seller_name`,
        `${bussinessmanTableName}.phone as seller_phone`,
        `${colorCategoryTableName}.name as color_category_name`,
        `${colorTableName}.name as color_name`,
        knex.raw(`CONCAT('طلبية رقم: ', ${wdDyeingOrderRequisitionTableName}.work_order_number,  ' - ',
        ${fabricTableName}.code, ${fabricTableName}.name, ' - ',
        ${colorCategoryTableName}.name, ' ', ${colorTableName}.name,
        ' - عرض: ', ${wdDyeingOrderRequisitionDetailsTableName}.fabric_width, ' - وزن القماش: ', 
        ${wdDyeingOrderRequisitionDetailsTableName}.fabric_quantity_m2) as dyeing_order_details`)
    ])
        .from(`${wdDyeingOrderRequisitionDetailsTableName}`)
        .innerJoin(`${wdDyeingOrderRequisitionTableName}`,
            `${wdDyeingOrderRequisitionTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`)
        .innerJoin(`${fabricTableName}`,
            `${fabricTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.dyed_fabric_id`)
        .innerJoin(`${bussinessmanTableName}`,
            `${bussinessmanTableName}.id`,
            `${wdDyeingOrderRequisitionTableName}.seller_id`)
        .innerJoin(`${colorCategoryTableName}`,
            `${colorCategoryTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.color_category_id`)
        .innerJoin(`${colorTableName}`,
            `${colorTableName}.id`,
            `${wdDyeingOrderRequisitionDetailsTableName}.color_id`)
        .where(whereCluse)
        .andWhere(`${wdDyeingOrderRequisitionDetailsTableName}.quantity`, ">", 0)
        .andWhere(`${wdDyeingOrderRequisitionDetailsTableName}.form_current_quantity`, ">", 0)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.selectFormDyeingRequisitionDetailsByFormDyeingOrderDetails = async (whereCluse) => {
    let queryResults = [];

    await knex.select([
        `${wdFormOrderDetailsWdFormDetailsTableName}.wd_form_dyeing_requisition_details_id`,
    ])
    .distinct(`${wdFormOrderDetailsWdFormDetailsTableName}.wd_form_dyeing_requisition_details_id`)
        .from(`${wdFormOrderDetailsWdFormDetailsTableName}`)
        .where(whereCluse)
        .andWhere(`${wdFormOrderDetailsWdFormDetailsTableName}.quantity`, ">", 0)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};


// exports.selectByFabricBySeller = async (whereCluse) => {
//     let queryResults = [];

//     await knex.select([
//         `${wdDyeingOrderRequisitionTableName}.id as requisition_id`,
//         `${wdDyeingOrderRequisitionTableName}.date`,
//         `${wdDyeingOrderRequisitionTableName}.number`,
// `${wdDyeingOrderRequisitionTableName}.work_order_number`,
//         `${wdDyeingOrderRequisitionTableName}.note`,
//         `${wdDyeingOrderRequisitionDetailsTableName}.id`,
//         `${wdDyeingOrderRequisitionDetailsTableName}.note as details_note`,
//         `${wdDyeingOrderRequisitionDetailsTableName}.quantity`,
//         `${wdDyeingOrderRequisitionDetailsTableName}.form_current_quantity`,
//         `${wdDyeingOrderRequisitionDetailsTableName}.dyeing_current_quantity`,
// `${wdDyeingOrderRequisitionDetailsTableName}.fabric_width`,
//         `${wdDyeingOrderRequisitionDetailsTableName}.fabric_quantity_m2`,
//         `${fabricTableName}.id as dyed_fabric_id`,
//         `${fabricTableName}.name as dyed_fabric_name`,
//         `${fabricTableName}.code as dyed_fabric_code`,
//         `${bussinessmanTableName}.id as seller_id`,
//         `${bussinessmanTableName}.name as seller_name`,
//         `${bussinessmanTableName}.phone as seller_phone`,
//         `${colorCategoryTableName}.name as color_category_name`,
//         `${colorTableName}.name as color_name`,
//     ])
//         .from(`${wdDyeingOrderRequisitionDetailsTableName}`)
//         .innerJoin(`${wdDyeingOrderRequisitionTableName}`,
//             `${wdDyeingOrderRequisitionTableName}.id`,
//             `${wdDyeingOrderRequisitionDetailsTableName}.wd_form_dyeing_order_requisition_id`)
//         .innerJoin(`${fabricTableName}`,
//             `${fabricTableName}.id`,
//             `${wdDyeingOrderRequisitionDetailsTableName}.dyed_fabric_id`)
//         .innerJoin(`${bussinessmanTableName}`,
//             `${bussinessmanTableName}.id`,
//             `${wdDyeingOrderRequisitionTableName}.seller_id`)
//         .innerJoin(`${colorCategoryTableName}`,
//             `${colorCategoryTableName}.id`,
//             `${wdDyeingOrderRequisitionDetailsTableName}.color_category_id`)
//         .innerJoin(`${colorTableName}`,
//             `${colorTableName}.id`,
//             `${wdDyeingOrderRequisitionDetailsTableName}.color_id`)
//         .where(whereCluse)
//         .andWhere(`${wdDyeingOrderRequisitionDetailsTableName}.quantity`, ">", 0)
//         .then((data) => {
//             queryResults = data;
//         })
//         .catch((error) => console.error(error));
//     return queryResults;
// };
