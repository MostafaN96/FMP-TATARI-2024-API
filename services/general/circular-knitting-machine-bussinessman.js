const circularKnittingMachineBussinessmanQueries = require("../../db/queries/general/circular-knitting-machine-bussinessman");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");

exports.select = async () => {
  const results = await circularKnittingMachineBussinessmanQueries.select();
  return results;
};

exports.selectDeleted = async () => {
  const results = await circularKnittingMachineBussinessmanQueries.selectDeleted();
  return results;
};

exports.selectByManufacture = async (manufactureId) => {
  const results = await circularKnittingMachineBussinessmanQueries.selectByManufacture(manufactureId);
  return results;
};

exports.update = async (yarn) => {
    // check is found
    const isFound = await circularKnittingMachineBussinessmanQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: yarn.id,
    });
    if (isFound[0] != null) {
      // chick on duplication
      const checkDuplication = await circularKnittingMachineBussinessmanQueries.selectOne(function () {
        this.where("code", "=", yarn.code).andWhere("id", "<>", yarn.id);
      });
  
      if (checkDuplication[0] != null) {
        return constants.duplicatedData;
      } else {
        // updated
        const updateResults = await circularKnittingMachineBussinessmanQueries.update(yarn);
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
    const yarnId = bodyPalod[i].id;

    // check is the item is found
    const isItemAdded = await circularKnittingMachineBussinessmanQueries.selectOne({
      ...constantsPayloads.deletePayload,
      id: yarnId,
    });

    if (isItemAdded[0] != null) {
      const results = await circularKnittingMachineBussinessmanQueries.delete(yarnId);
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
    const yarnId = bodyPalod[i].id;

    // check is the item is found
    const isItemdeleted = await circularKnittingMachineBussinessmanQueries.selectOne({
      ...constantsPayloads.restorePayload,
      id: yarnId,
    });
    if (isItemdeleted[0] != null) {
      const results = await circularKnittingMachineBussinessmanQueries.restore(yarnId);
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