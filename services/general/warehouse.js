const warehouseQueries = require("../../db/queries/general/warehouse");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");

exports.create = async (warehouse) => {
  warehouse.id = trans.transform();
    // check on emails
    const selectOneResult = await warehouseQueries.selectOne({"name": warehouse.name, "phone": warehouse.phone});
    if (selectOneResult[0] != null) {
      return constants.duplicatedData;
    }
  
    const results = await warehouseQueries.insert(warehouse);
    if (results) {
      return constants.insertSuccess;
    } else {
      return constants.insertError;
    }
  };

exports.select = async () => {
  const results = await warehouseQueries.select();
  return results;
};

exports.selectDeleted = async () => {
  const results = await warehouseQueries.selectDeleted();
  return results;
};

exports.selectWhereInWa = async () => {
  const results = await warehouseQueries.selectWhereInWa();
  return results;
};

exports.selectWhereInWaBySupplier = async (supplierId) => {
  const results = await warehouseQueries.selectWhereInWaBySupplier(supplierId);
  return results;
};

exports.selectWhereInWc = async () => {
  const results = await warehouseQueries.selectWhereInWc();
  return results;
};

exports.selectWhereInWcBySupplier = async (supplierId) => {
  const results = await warehouseQueries.selectWhereInWcBySupplier(supplierId);
  return results;
};

exports.selectWhereInWe = async () => {
  const results = await warehouseQueries.selectWhereInWe();
  return results;
};
exports.update = async (warehouse) => {
    // check is found
    const isFound = await warehouseQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: warehouse.id,
    });
    if (isFound[0] != null) {
      // chick on duplication
      const checkDuplication = await warehouseQueries.selectOne(function () {
        this.where({"name": warehouse.name, "phone": warehouse.phone}).andWhere("id", "<>", warehouse.id);
      });
  
      if (checkDuplication[0] != null) {
        return constants.duplicatedData;
      } else {
        // updated
        const updateResults = await warehouseQueries.update(warehouse);
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
    const warehouseId = bodyPalod[i].id;

    // check is the item is found
    const isItemAdded = await warehouseQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: warehouseId,
    });

    if (isItemAdded[0] != null) {
      const results = await warehouseQueries.delete(warehouseId);
      if (!results) {
        return constants.deleteError;
      }
      else if (bodyPalod.length-1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }

  };

exports.restore = async (bodyPalod) => {
  for (let i = 0; i < bodyPalod.length; i++) {
    const warehouseId = bodyPalod[i].id;

    // check is the item is found
    const isItemdeleted = await warehouseQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: warehouseId,
    });
    if (isItemdeleted[0] != null) {
      const results = await warehouseQueries.restore(warehouseId);
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