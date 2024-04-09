const circularKnittingMachineQueries = require("../../db/queries/general/circular-knitting-machine");
const circularKnittingMachineBussinessmanQueries = require("../../db/queries/general/circular-knitting-machine-bussinessman");
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const trans = require("../../helpers/transform");

exports.create = async (circularKnittingMachine) => {
  circularKnittingMachine.id = trans.transform();
  // check on emails
  const selectOneResult = await circularKnittingMachineQueries.selectOne({ 
    type: circularKnittingMachine.type,
    number: circularKnittingMachine.number,
    diameter: circularKnittingMachine.diameter,
    smoothness: circularKnittingMachine.smoothness,
    model: circularKnittingMachine.model
});
  if (selectOneResult[0] != null) {
    const selectOneCircularKnittingMachineBussinessmanResult = await circularKnittingMachineBussinessmanQueries.selectOne({
      manufacturer_id: circularKnittingMachine.manufactureId,
      circular_knitting_machine_id: selectOneResult[0].id,
      // fabric_id: circularKnittingMachine.fabricId,
    })
    if (selectOneCircularKnittingMachineBussinessmanResult[0] != null) {
      return constants.duplicatedData;
    }
  }

  const results = await circularKnittingMachineQueries.insert(circularKnittingMachine);
  if (results) {
    circularKnittingMachine.circularKnittingMachineBussinessmanId = `${trans.transform()}`
    await circularKnittingMachineBussinessmanQueries.insert(circularKnittingMachine)
    return constants.insertSuccess;
  } else {
    return constants.insertError;
  }
};

exports.update = async (circularKnittingMachine) => {
  // check is found
  const isFound = await circularKnittingMachineQueries.selectOne({
    ...constantsPayloads.deletePayload,
    id: circularKnittingMachine.id,
  });
  if (isFound[0] != null) {
    // chick on duplication
    const checkDuplication = await circularKnittingMachineQueries.selectOne( function () {
        this.where({
          type: circularKnittingMachine.type,
          number: circularKnittingMachine.number,
          diameter: circularKnittingMachine.diameter,
          smoothness: circularKnittingMachine.smoothness,
          model: circularKnittingMachine.model
      })
      .andWhere("id", "<>", circularKnittingMachine.id);
      });
    if (checkDuplication[0] != null) {
      const selectOneCircularKnittingMachineBussinessmanResult = await circularKnittingMachineBussinessmanQueries.selectOne({
        manufacturer_id: circularKnittingMachine.manufactureId,
        circular_knitting_machine_id: checkDuplication[0].id,
        // fabric_id: circularKnittingMachine.fabricId,
      })
      if (selectOneCircularKnittingMachineBussinessmanResult[0] != null) {
        return constants.duplicatedData;
      } else {
        // updated
        const updateResults = await circularKnittingMachineQueries.update(circularKnittingMachine);
        if (updateResults) {
          return constants.updateSuccess;
        } else {
          return constants.updateError;
        }
      }
    } else {
      // updated
      const updateResults = await circularKnittingMachineQueries.update(circularKnittingMachine);
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
