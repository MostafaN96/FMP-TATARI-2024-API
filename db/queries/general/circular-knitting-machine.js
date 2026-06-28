// Config
const sqlFun = require("../../config/sql-fun");

// Util
const circularKnittingMachineTableName = require("../../../util/database-tables-name").circularKnittingMachineTableName;

exports.insert = async (circularKnittingMachine) => {
  let queryResults = false;
  await sqlFun
    .insert(circularKnittingMachineTableName, {
      id: circularKnittingMachine.id,
      type: circularKnittingMachine.type,
      number: circularKnittingMachine.number,
      diameter: circularKnittingMachine.diameter,
      smoothness: circularKnittingMachine.smoothness,
      model: circularKnittingMachine.model,
      creator_id: circularKnittingMachine.personid,
      ip_address: circularKnittingMachine.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForManufacturingWb = async (circularKnittingMachine, trx = null) => {
  let queryResults = false;
  await sqlFun
    .insert(circularKnittingMachineTableName, {
      id: circularKnittingMachine.circularKnittingMachineId,
      type: "",
      number: "",
      diameter: "",
      smoothness: "",
      model: "",
      creator_id: circularKnittingMachine.personid,
      ip_address: circularKnittingMachine.ipaddress
    }, trx)
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (circularKnittingMachine) => {
  let queryResults = false;
  await sqlFun
    .update(
      circularKnittingMachineTableName,
      {
        type: circularKnittingMachine.type,
        number: circularKnittingMachine.number,
        diameter: circularKnittingMachine.diameter,
        smoothness: circularKnittingMachine.smoothness,
        model: circularKnittingMachine.model
      },
      {
        id: circularKnittingMachine.id,
      }
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  await sqlFun
    .limitedSelect(circularKnittingMachineTableName, ["id"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};
