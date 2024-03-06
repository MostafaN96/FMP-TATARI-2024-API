const deliveryCarQueries = require("../../db/queries/general/delivery-car");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");

exports.create = async (deliveryCar) => {
  deliveryCar.id = trans.transform();
  // check on emails
  const selectOneResult = await deliveryCarQueries.selectOne({ plate_number: deliveryCar.plateNumber, national_id: deliveryCar.nationalId });
  if (selectOneResult[0] != null) {
    return constants.duplicatedData;
  }

  const results = await deliveryCarQueries.insert(deliveryCar);
  if (results) {
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};

exports.select = async () => {
  const results = await deliveryCarQueries.select();
  return results;
};

exports.selectDeleted = async () => {
  const results = await deliveryCarQueries.selectDeleted();
  return results;
};

exports.update = async (deliveryCar) => {
  // check is found
  const isFound = await deliveryCarQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: deliveryCar.id,
  });
  if (isFound[0] != null) {
    // chick on duplication
    const checkDuplication = await deliveryCarQueries.selectOne(function () {
      this.where({ plate_number: deliveryCar.plateNumber, national_id: deliveryCar.nationalId }).andWhere("id", "<>", deliveryCar.id);
    });

    if (checkDuplication[0] != null) {
      return constants.duplicatedData;
    } else {
      // updated
      const updateResults = await deliveryCarQueries.update(deliveryCar);
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


exports.dalete = async (deliveryCar) => {
  for (let i = 0; i < deliveryCar.length; i++) {
    const deliveryCarId = deliveryCar[i].id;

    // check is the item is found
    const isItemAdded = await deliveryCarQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: deliveryCarId,
    });

    if (isItemAdded[0] != null) {
      const results = await deliveryCarQueries.delete(deliveryCarId);
      if (!results) {
        return constants.deleteError;
      }
      else if (deliveryCar.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }

};

exports.restore = async (deliveryCar) => {
  for (let i = 0; i < deliveryCar.length; i++) {
    const deliveryCarId = deliveryCar[i].id;

    // check is the item is found
    const isItemdeleted = await deliveryCarQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: deliveryCarId,
    });
    if (isItemdeleted[0] != null) {
      const results = await deliveryCarQueries.restore(deliveryCarId);
      if (!results) {
        return constants.restoreError;
      }
      else if (deliveryCar.length - 1 == i) {
        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }
};