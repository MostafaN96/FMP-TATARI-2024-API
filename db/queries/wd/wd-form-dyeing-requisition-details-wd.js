// Config
const sqlFun = require("../../config/sql-fun");
// Util
const wdFormDyeingRequisitionDetailsWdTableName = require("../../../util/database-tables-name").wdFormDyeingRequisitionDetailsWdTableName;

exports.insert = async (wdFormDyeingRequisitionDetailsWd, items) => {
    let queryResults = false;
    await sqlFun
      .insert(wdFormDyeingRequisitionDetailsWdTableName, {
        wd_form_dyeing_requisition_details_id: items.wdFormDyeingRequisitionDetailsId,
        wd_id: items.wdId,
        quantity: items.updatedQuantity,
        creator_id: wdFormDyeingRequisitionDetailsWd.personid,
        ip_address: wdFormDyeingRequisitionDetailsWd.ipaddress,
      })
      .then((data) => {
        queryResults = true;
      })
      .catch((error) => {
        console.log(error);
      });
    return queryResults;
  };

  exports.select = async (whereCluse) => {
    let queryResults = [];
    await sqlFun
      .select(
        wdFormDyeingRequisitionDetailsWdTableName,
        [
          `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`,
          `${wdFormDyeingRequisitionDetailsWdTableName}.quantity`
        ],
        whereCluse
      )
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => console.error(error));
    return queryResults;
  };

  exports.selectWithTwoCondition = async (whereCluse, andWhereCluseArray) => {
    let queryResults = [];
    await sqlFun
      .selectWithTwoCondition(
        wdFormDyeingRequisitionDetailsWdTableName,
        [
          `${wdFormDyeingRequisitionDetailsWdTableName}.wd_id`,
          `${wdFormDyeingRequisitionDetailsWdTableName}.quantity`
        ],
        whereCluse,
        andWhereCluseArray
      )
      .then((data) => {
        queryResults = data;
      })
      .catch((error) => console.error(error));
    return queryResults;
  };

  exports.update = async (wdFormDyeingRequisitionDetailsWd, whereCluse) => {
    let queryResults = false;
    await sqlFun
      .update(
        wdFormDyeingRequisitionDetailsWdTableName,
        wdFormDyeingRequisitionDetailsWd,
        whereCluse
      )
      .then((data) => {
        queryResults = true;
      })
      .catch((err) => console.log(err));
    return queryResults;
  };