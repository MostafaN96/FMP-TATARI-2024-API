// QuerieswaCottonSellRequisitionDetailsWa
const wdFormDyeingRequisitionDetailsDyeingServicesQueries = require("../../db/queries/wd/wd-form-dyeing-requisition-details-dyeing-services");

// Util
const constants = require("../../util/constants");
const { wdFormDyeingRequisitionDetailsDyeingServicesTableName } = require("../../util/database-tables-name");

exports.create = async (wdFormDyeingRequisitionDetailsDyeingServices, items, dyeingService) => {

  const results = await wdFormDyeingRequisitionDetailsDyeingServicesQueries.insert(wdFormDyeingRequisitionDetailsDyeingServices, items, dyeingService);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};

exports.selectByFormDyeingRequisitionDetailsId = async (whereCluse) => {
  const results = await wdFormDyeingRequisitionDetailsDyeingServicesQueries.selectByFormDyeingRequisitionDetailsId(whereCluse);
  return results;
};

exports.updateDyeingServcies = async (formDyeingRequisitionDetailsDyeingServices) => {

  let queryResults = false

  if (formDyeingRequisitionDetailsDyeingServices.newDyeingServices[0] != null) {
    for (let i = 0; i < formDyeingRequisitionDetailsDyeingServices.newDyeingServices.length; i++) {
      const newDyeingService = formDyeingRequisitionDetailsDyeingServices.newDyeingServices[i];

      // select from wd_form_dyeing_requisition_details_dyeing_services is has same 
      // dyeing service but deleted
      let wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse = {};
      wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.wd_form_dyeing_requisition_details_id`] = formDyeingRequisitionDetailsDyeingServices.wdFormDyeingRequisitionDetailsId;
      wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.dyeing_services_id`] = newDyeingService.id;
      wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse[`${wdFormDyeingRequisitionDetailsDyeingServicesTableName}.is_deleted`] = 1;
      const selectDeletedDyeingServicesRecords = await wdFormDyeingRequisitionDetailsDyeingServicesQueries.selectByFormDyeingRequisitionDetailsId(wdFormDyeingRequisitionDetailsDyeingServicesWhereCluse)
      if (selectDeletedDyeingServicesRecords[0] != null) {
        queryResults = await wdFormDyeingRequisitionDetailsDyeingServicesQueries.update({
          price: newDyeingService.price,
          is_deleted: 0,
          is_active: 1
        }, {
          wd_form_dyeing_requisition_details_id: selectDeletedDyeingServicesRecords[0].wd_form_dyeing_requisition_details_id,
          dyeing_services_id: selectDeletedDyeingServicesRecords[0].dyeing_services_id
        })
      } else {
        queryResults = await wdFormDyeingRequisitionDetailsDyeingServicesQueries.insertForUpdate(
          formDyeingRequisitionDetailsDyeingServices,
          newDyeingService
        )
      }
    }

  }

  if (formDyeingRequisitionDetailsDyeingServices.deletedDyeingServices[0] != null) {
    for (let i = 0; i < formDyeingRequisitionDetailsDyeingServices.deletedDyeingServices.length; i++) {
      const deletedDyeingService = formDyeingRequisitionDetailsDyeingServices.deletedDyeingServices[i];

      queryResults = await wdFormDyeingRequisitionDetailsDyeingServicesQueries.update({
        is_deleted: 1,
        is_active: 0
      }, {
        wd_form_dyeing_requisition_details_id: formDyeingRequisitionDetailsDyeingServices.wdFormDyeingRequisitionDetailsId,
        dyeing_services_id: deletedDyeingService.id
      })
    }
  }

  if (queryResults) {
    queryResults = constants.updateSuccess
  } else {
    queryResults = constants.updateError
  }

  return queryResults;
};
