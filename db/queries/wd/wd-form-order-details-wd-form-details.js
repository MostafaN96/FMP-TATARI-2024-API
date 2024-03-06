// Config
const sqlFun = require("../../config/sql-fun");

// Util
const wdFormOrderDetailsWdFormDetailsTableName = require("../../../util/database-tables-name").wdFormOrderDetailsWdFormDetailsTableName;

exports.insert = async (wdFormOrderDetailsWdFormDetails, items) => {
    let queryResults = false;
    await sqlFun
        .insert(wdFormOrderDetailsWdFormDetailsTableName, {
            wd_form_dyeing_order_requisition_details_id: items.wdFormDyeingOrderRequisitionDetailsId,
            wd_form_dyeing_requisition_details_id: items.wdFormDyeingRequisitionDetailsId,
            quantity: items.quantity,
            creator_id: wdFormOrderDetailsWdFormDetails.personid,
            ip_address: wdFormOrderDetailsWdFormDetails.ipaddress,
        })
        .then((data) => {
            queryResults = true;
        })
        .catch((error) => {
            console.log(error);
        });
    return queryResults;
};

exports.selectOne = async (whereCluse) => {
    let queryResults = false;
    await sqlFun
      .limitedSelect(wdFormOrderDetailsWdFormDetailsTableName, 
        ["wd_form_dyeing_order_requisition_details_id", "wd_form_dyeing_requisition_details_id", "quantity"], whereCluse, 1)
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => {
        console.log(error);
      });
  
    return queryResults;
  };
  
  exports.update = async (wdFormOrderDetailsWdFormDetails, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wdFormOrderDetailsWdFormDetailsTableName,
        wdFormOrderDetailsWdFormDetails,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };