// Config
const { anointedServicesPricesTableName, dyeingServicesTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const wdFormDyeingRequisitionDetailsDyeingServicesTableName = require("../../../util/database-tables-name").wdFormDyeingRequisitionDetailsDyeingServicesTableName;

exports.insert = async (wdFormDyeingRequisitionDetailsDyeingServices, items, dyeingService) => {

    let queryResults = false;
    await sqlFun
      .insert(wdFormDyeingRequisitionDetailsDyeingServicesTableName, {
        dyeing_services_prices_id: dyeingService.dyeingServicesPricesId,
        dyeing_services_id: dyeingService.dyeingServiceId,
        dyeing_id: wdFormDyeingRequisitionDetailsDyeingServices.dyeingId,
        wd_form_dyeing_requisition_details_id: items.wdFormDyeingRequisitionDetailsId,
        price: dyeingService.dyeingServicePrice,
        creator_id: wdFormDyeingRequisitionDetailsDyeingServices.personid,
        ip_address: wdFormDyeingRequisitionDetailsDyeingServices.ipaddress,
      })
      .then((data) => {
        queryResults = true;
      })
      .catch((error) => {
        console.log(error);
      });
    return queryResults;
  };

exports.insertForUpdate = async (wdFormDyeingRequisitionDetailsDyeingServices, dyeingService) => {

    let queryResults = false;
    await sqlFun
      .insert(wdFormDyeingRequisitionDetailsDyeingServicesTableName, {
        dyeing_services_prices_id: dyeingService.dyeing_service_prices_id,
        dyeing_services_id: dyeingService.id,
        dyeing_id: wdFormDyeingRequisitionDetailsDyeingServices.dyeingId,
        wd_form_dyeing_requisition_details_id: wdFormDyeingRequisitionDetailsDyeingServices.wdFormDyeingRequisitionDetailsId,
        price: dyeingService.price,
        creator_id: wdFormDyeingRequisitionDetailsDyeingServices.personid,
        ip_address: wdFormDyeingRequisitionDetailsDyeingServices.ipaddress,
      })
      .then((data) => {
        queryResults = true;
      })
      .catch((error) => {
        console.log(error);
      });
    return queryResults;
  };
  
exports.selectByFormDyeingRequisitionDetailsId = async (whereCluse) => {
  let queryResults = [];

  await knex.select([
    `${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.dyeing_services_id`,
    `${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.wd_form_dyeing_requisition_details_id`,
    `${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.price`,
    `${dyeingServicesTableName}.name`,
    `${anointedServicesPricesTableName}.is_fabric_piece`,
  ])
    .from(`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}`)
    .where(whereCluse)
    .innerJoin(`${anointedServicesPricesTableName}`,
    `${anointedServicesPricesTableName}.id`,
    `${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.dyeing_services_prices_id`)
    .innerJoin(`${dyeingServicesTableName}`,
    `${dyeingServicesTableName}.id`,
    `${anointedServicesPricesTableName}.anointed_services_id`)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.update = async (wdFormDyeingRequisitionDetailsDyeingServices, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      wdFormDyeingRequisitionDetailsDyeingServicesTableName,
      wdFormDyeingRequisitionDetailsDyeingServices,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
