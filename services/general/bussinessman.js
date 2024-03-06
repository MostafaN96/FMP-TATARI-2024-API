// Queries
const bussinessmanQueries = require("../../db/queries/general/bussinessman");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");
const { wbManufacturingOrderRequisitionTableName, wdDyeingOrderRequisitionTableName, wdFormDyeingRequisitionTableName, weSellRequisitionTableName, weSellRequisitionDetailsTableName, weSellRequisitionDetailsWeTableName } = require("../../util/database-tables-name");

// Util
const bussinessmanTableName = require("../../util/database-tables-name").bussinessmanTableName;
// WA
const waTableName = require("../../util/database-tables-name").waTableName;
const waAddRequisitionTableName = require("../../util/database-tables-name").waAddRequisitionTableName;
const waAddRequisitionDetailsTableName = require("../../util/database-tables-name").waAddRequisitionDetailsTableName;
const waTransportWaWbRequisitionTableName = require("../../util/database-tables-name").waTransportWaWbRequisitionTableName;
const waTransportWaWbRequisitionDetailsTableName = require("../../util/database-tables-name").waTransportWaWbRequisitionDetailsTableName;

// WB
const wbTableName = require("../../util/database-tables-name").wbTableName;
const wbManufacturingRequisitionTableName = require("../../util/database-tables-name").wbManufacturingRequisitionTableName;

// WC
const wcTableName = require("../../util/database-tables-name").wcTableName;
const wcAddRequisitionTableName = require("../../util/database-tables-name").wcAddRequisitionTableName;
const wcAddRequisitionDetailsTableName = require("../../util/database-tables-name").wcAddRequisitionDetailsTableName;
const wdTransportWcWdTableName = require("../../util/database-tables-name").wdTransportWcWdTableName;
const wdTransportWcWdDetailsTableName = require("../../util/database-tables-name").wdTransportWcWdDetailsTableName;

// WD
const wdTableName = require("../../util/database-tables-name").wdTableName;
const wdDyeingRequisitionTableName = require("../../util/database-tables-name").wdDyeingRequisitionTableName;

// WE
const weAddRequisitionTableName = require("../../util/database-tables-name").weAddRequisitionTableName;
const weAddRequisitionDetailsTableName = require("../../util/database-tables-name").weAddRequisitionDetailsTableName;
const weTableName = require("../../util/database-tables-name").weTableName;

exports.selectSuppliers = async () => {
  const whereCluse = { ...constantsPayloads.deletePayload, is_supplier: '1' }
  const results = await bussinessmanQueries.selectBussienessmanByType(whereCluse);
  return results;
};

exports.selectSellers = async () => {
  const whereCluse = { ...constantsPayloads.deletePayload, is_seller: '1' }
  const results = await bussinessmanQueries.selectBussienessmanByType(whereCluse);
  return results;
};

exports.selectDyerHasServices = async () => {
  const whereCluse = { ...constantsPayloads.deletePayload, is_dyer: '1' }
  const whereInWhereCluse = { ...constantsPayloads.deletePayload }
  const results = await bussinessmanQueries.selectDyerHasServices(whereCluse, whereInWhereCluse);
  return results;
};

exports.selectSuppliersBoughtFromWa = async () => {
  let whereInTableName = waAddRequisitionTableName
  let whereStoreTableName = waTableName
  let whereDetailsTableName = waAddRequisitionDetailsTableName
  let attributeRequisitionId = 'wa_add_requisition_id'
  let attributeRequisitionDetailsId = 'wa_add_requisition_details_id'

  const results = await bussinessmanQueries.selectSuppliersBoughtFrom(whereInTableName, whereStoreTableName, whereDetailsTableName, attributeRequisitionId, attributeRequisitionDetailsId);
  return results;
};

// WB
exports.selectNotSelectedManufacturerWb = async (manufacturerId) => {
  const whereCluse = { ...constantsPayloads.deletePayload, is_manufacturer: '1' }
  const results = await bussinessmanQueries.selectNotSelectedBussinessman(manufacturerId, whereCluse);
  return results;
};

exports.selectManufacturerFromWb = async () => {
  let whereInTableName = waTransportWaWbRequisitionTableName
  let whereStoreTableName = wbTableName
  let whereDetailsTableName = waTransportWaWbRequisitionDetailsTableName
  let attributeRequisitionId = 'wa_transport_wa_wb_requisition_id'
  let attributeRequisitionDetailsId = 'wa_transport_wa_wb_requisition_details_id'

  const results = await bussinessmanQueries.selectManufacturerFrom(whereInTableName, whereStoreTableName, whereDetailsTableName,
    attributeRequisitionId, attributeRequisitionDetailsId);
  return results;
};

exports.selectManufacturerManufactured = async () => {
  let whereInTableName = wbManufacturingRequisitionTableName
  let whereInAttr = "industry_id"
  let bussinessmanFlagType = "is_manufacturer"

  let whereInWhereCluse = {};
  whereInWhereCluse[`${whereInTableName}.is_deleted`] = 0;
  whereInWhereCluse[`${whereInTableName}.is_active`] = 1;

  const results = await bussinessmanQueries.selectWhereInBussinessman(whereInTableName, whereInAttr, whereInWhereCluse, bussinessmanFlagType);
  return results;
};

exports.selectTransportedManufacturersInWb = async () => {
  let whereInTableName = wbTableName
  let whereInAttr = "industry_id"
  let bussinessmanFlagType = "is_manufacturer"

  let whereInWhereCluse = {};
  whereInWhereCluse[`${whereInTableName}.is_deleted`] = 0;
  whereInWhereCluse[`${whereInTableName}.is_active`] = 1;

  const results = await bussinessmanQueries.selectWhereInBussinessman(whereInTableName, whereInAttr, whereInWhereCluse, bussinessmanFlagType);
  return results;
};

exports.selectTransportedManufacturersNotSelectedInWb = async (industryId) => {
  let whereInTableName = bussinessmanTableName
  let whereInAttr = "id"
  let bussinessmanFlagType = "is_manufacturer"

  let whereInWhereCluse = {};
  whereInWhereCluse[`${whereInTableName}.is_deleted`] = 0;
  whereInWhereCluse[`${whereInTableName}.is_active`] = 1;

  let whereCluseNot = {};
  whereCluseNot[`${whereInTableName}.id`] = industryId;

  const results = await bussinessmanQueries.selectWhereInBussinessmanNotSelected(whereInTableName, whereInAttr, whereInWhereCluse, bussinessmanFlagType, whereCluseNot);
  return results;
};

exports.selectSellerManufacturingOrdered = async () => {
  let whereInTableName = wbManufacturingOrderRequisitionTableName
  let whereInAttr = "seller_id"
  let bussinessmanFlagType = "is_seller"

  let whereInWhereCluse = {};
  whereInWhereCluse[`${whereInTableName}.is_deleted`] = 0;
  whereInWhereCluse[`${whereInTableName}.is_active`] = 1;
  whereInWhereCluse[`${whereInTableName}.is_order`] = 1;

  const results = await bussinessmanQueries.selectWhereInBussinessman(whereInTableName, whereInAttr, whereInWhereCluse, bussinessmanFlagType);
  return results;
};

// WC
exports.selectManufacturer = async () => {
  const whereCluse = { ...constantsPayloads.deletePayload, is_manufacturer: '1' }
  const results = await bussinessmanQueries.selectBussienessmanByType(whereCluse);
  return results;
};

exports.selectSuppliersBoughtFromWc = async () => {
  let whereInTableName = wcAddRequisitionTableName
  let whereStoreTableName = wcTableName
  let whereDetailsTableName = wcAddRequisitionDetailsTableName
  let attributeRequisitionId = 'wc_add_requisition_id'
  let attributeRequisitionDetailsId = 'wc_add_requisition_details_id'

  const results = await bussinessmanQueries.selectSuppliersBoughtFrom(whereInTableName, whereStoreTableName, whereDetailsTableName,
    attributeRequisitionId, attributeRequisitionDetailsId);
  return results;
};

// WD
exports.selectDyer = async () => {
  const whereCluse = { ...constantsPayloads.deletePayload, is_dyer: '1' }
  const results = await bussinessmanQueries.selectBussienessmanByType(whereCluse);
  return results;
};

exports.selectDyeingFromWd = async () => {
  let whereInTableName = wdTableName
  let whereInAttr = "dyeing_id"
  let bussinessmanFlagType = "is_dyer"
  let whereInWhereCluse = {};
    whereInWhereCluse[`${whereInTableName}.is_deleted`] = 0;
    whereInWhereCluse[`${whereInTableName}.is_active`] = 1;

  const results = await bussinessmanQueries.selectWhereInBussinessman(whereInTableName, whereInAttr, whereInWhereCluse,
    bussinessmanFlagType);
  return results;
};

exports.selectDyerDyeing = async () => {
  let whereInTableName = wdDyeingRequisitionTableName
  let whereInAttr = "dyeing_id"
  let bussinessmanFlagType = "is_dyer"

  let whereInWhereCluse = {};
  whereInWhereCluse[`${whereInTableName}.is_deleted`] = 0;
  whereInWhereCluse[`${whereInTableName}.is_active`] = 1;

  const results = await bussinessmanQueries.selectWhereInBussinessman(whereInTableName, whereInAttr, whereInWhereCluse, bussinessmanFlagType);
  return results;
};

exports.selectSellersOrderedFromDyeing = async () => {
  let whereInTableName = wdDyeingOrderRequisitionTableName
  let whereInAttr = "seller_id"
  let bussinessmanFlagType = "is_seller"

  let whereInWhereCluse = {};
  whereInWhereCluse[`${whereInTableName}.is_deleted`] = 0;
  whereInWhereCluse[`${whereInTableName}.is_active`] = 1;

  const results = await bussinessmanQueries.selectWhereInBussinessman(whereInTableName, whereInAttr, whereInWhereCluse, bussinessmanFlagType);
  return results;
};

exports.selectDyerHasForm = async () => {
  let whereInTableName = wdFormDyeingRequisitionTableName
  let whereInAttr = "dyeing_id"
  let bussinessmanFlagType = "is_dyer"

  let whereInWhereCluse = {};
  whereInWhereCluse[`${whereInTableName}.is_deleted`] = 0;
  whereInWhereCluse[`${whereInTableName}.is_active`] = 1;

  const results = await bussinessmanQueries.selectWhereInBussinessman(whereInTableName, whereInAttr, whereInWhereCluse, bussinessmanFlagType);
  return results;
};

exports.selectNotSelectedDyeingWd = async (dyeingId) => {
  const whereCluse = { ...constantsPayloads.deletePayload, is_dyer: '1' }
  const results = await bussinessmanQueries.selectNotSelectedBussinessman(dyeingId, whereCluse);
  return results;
};

// WE
exports.selectSellersSellFromWe = async () => {
  let whereInTableName = weSellRequisitionTableName
  let whereStoreTableName = weTableName
  let whereDetailsTableName = weSellRequisitionDetailsTableName
  let whereDetailsWeTableName = weSellRequisitionDetailsWeTableName
  let attributeRequisitionId = 'we_sell_requisition_id'
  let attributeRequisitionDetailsId = 'we_sell_requisition_details_id'
  let attributeRequisitionDetailsWeId = 'we_id'

  const results = await bussinessmanQueries.selectSellersSellFrom(whereInTableName, whereStoreTableName, whereDetailsTableName,
    attributeRequisitionId, attributeRequisitionDetailsId, whereDetailsWeTableName, attributeRequisitionDetailsWeId);
  return results;
};

exports.selectSuppliersBoughtFromWe = async () => {
  let whereInTableName = weAddRequisitionTableName
  let whereStoreTableName = weTableName
  let whereDetailsTableName = weAddRequisitionDetailsTableName
  let attributeRequisitionId = 'we_add_requisition_id'
  let attributeRequisitionDetailsId = 'we_add_requisition_details_id'

  const results = await bussinessmanQueries.selectSuppliersBoughtFrom(whereInTableName, whereStoreTableName, whereDetailsTableName,
    attributeRequisitionId, attributeRequisitionDetailsId);
  return results;
};

exports.create = async (bussinessman) => {
  bussinessman.id = trans.transform();
  // check on emails
  const selectOneResult = await bussinessmanQueries.selectOne({ name: bussinessman.name, "phone": bussinessman.phone });
  if (selectOneResult[0] != null) {
    return constants.duplicatedData;
  }

  const results = await bussinessmanQueries.insert(bussinessman);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};

exports.select = async () => {
  const results = await bussinessmanQueries.select();
  return results;
};


exports.selectDeleted = async () => {
  const results = await bussinessmanQueries.selectDeleted();
  return results;
};

exports.update = async (bussinessman) => {
  // check bussinessman is found
  const isFound = await bussinessmanQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: bussinessman.id,
  });
  if (isFound[0] != null) {
    // chick on duplication
    const checkDuplication = await bussinessmanQueries.selectOne(function () {
      this.where({"name": bussinessman.name, "phone": bussinessman.phone}).andWhere("id", "<>", bussinessman.id);
    });

    if (checkDuplication[0] != null) {
      return constants.duplicatedData;
    } else {
      // updated
      const updateResults = await bussinessmanQueries.update(bussinessman);
      if (updateResults) {
        return constants.updateSuccess;
      } else {
        return constants.updateError;
      }
    }
  } else {
    return constants.itemNotFound;
  }
};


exports.dalete = async (bodyPalod) => {
  for (let i = 0; i < bodyPalod.length; i++) {
    const bussinessmanId = bodyPalod[i].id;

    // check is the item is found
    const isItemAdded = await bussinessmanQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: bussinessmanId,
    });

    if (isItemAdded[0] != null) {
      const results = await bussinessmanQueries.delete(bussinessmanId);
      if (!results) {
        return constants.deleteError;
      }
      else if (bodyPalod.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }

};

exports.restore = async (bodyPalod) => {
  for (let i = 0; i < bodyPalod.length; i++) {
    const bussinessmanId = bodyPalod[i].id;

    // check is the item is found
    const isItemdeleted = await bussinessmanQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: bussinessmanId,
    });
    if (isItemdeleted[0] != null) {
      const results = await bussinessmanQueries.restore(bussinessmanId);
      if (!results) {
        return constants.restoreError;
      }
      else if (bodyPalod.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }
};