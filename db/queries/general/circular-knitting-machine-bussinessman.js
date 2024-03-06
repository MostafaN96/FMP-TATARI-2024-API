// Config
const { fabricTableName } = require("../../../util/database-tables-name");
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const circularKnittingMachineBussinessmanTableName = require("../../../util/database-tables-name").circularKnittingMachineBussinessmanTableName;
const circularKnittingMachineTableName = require("../../../util/database-tables-name").circularKnittingMachineTableName;
const bussinessmanTableName = require("../../../util/database-tables-name").bussinessmanTableName;

exports.insert = async (circularKnittingMachineBussinessman) => {
  let queryResults = false;
  await sqlFun
    .insert(circularKnittingMachineBussinessmanTableName, {
      id: circularKnittingMachineBussinessman.circularKnittingMachineBussinessmanId,
      circular_knitting_machine_id: circularKnittingMachineBussinessman.id,
      manufacturer_id: circularKnittingMachineBussinessman.manufactureId,
      fabric_id: circularKnittingMachineBussinessman.fabricId,
      creator_id: circularKnittingMachineBussinessman.personid,
      ip_address: circularKnittingMachineBussinessman.ipaddress
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
    .limitedSelect(circularKnittingMachineBussinessmanTableName, ["is_deleted"], whereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.select = async () => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${circularKnittingMachineBussinessmanTableName}.is_deleted`] = 0;
  whereCluse[`${circularKnittingMachineBussinessmanTableName}.is_active`] = 1;

  await knex.select([`${circularKnittingMachineBussinessmanTableName}.id`, 
  `${circularKnittingMachineTableName}.id as circular_knitting_machine_id`,
  `${circularKnittingMachineTableName}.type`,
  `${circularKnittingMachineTableName}.number`,
  `${circularKnittingMachineTableName}.diameter`,
  `${circularKnittingMachineTableName}.smoothness`,
  `${circularKnittingMachineTableName}.model`,
  `${bussinessmanTableName}.id as manufacturer_id`, 
  `${bussinessmanTableName}.name as manufacturer_name`,
  `${fabricTableName}.id as fabric_id`, 
  `${fabricTableName}.name as fabric_name`,
  `${fabricTableName}.name as fabric_code`,
])
  .from(`${circularKnittingMachineBussinessmanTableName}`)
  .where(whereCluse)
  .innerJoin(circularKnittingMachineTableName, 
    `${circularKnittingMachineTableName}.id`, 
    `${circularKnittingMachineBussinessmanTableName}.circular_knitting_machine_id`)
  .innerJoin(bussinessmanTableName, 
    `${bussinessmanTableName}.id`, 
    `${circularKnittingMachineBussinessmanTableName}.manufacturer_id`)
    .innerJoin(fabricTableName, 
      `${fabricTableName}.id`, 
      `${circularKnittingMachineBussinessmanTableName}.fabric_id`)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
          queryResults = constants.errorPayload
          console.log(error);
      })
  return queryResults;
};


exports.selectDeleted = async () => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${circularKnittingMachineBussinessmanTableName}.is_deleted`] = 1;
  whereCluse[`${circularKnittingMachineBussinessmanTableName}.is_active`] = 0;

  await knex.select([`${circularKnittingMachineBussinessmanTableName}.id`, 
  `${circularKnittingMachineTableName}.id as circular_knitting_machine_id`,
  `${circularKnittingMachineTableName}.type`,
  `${circularKnittingMachineTableName}.number`,
  `${circularKnittingMachineTableName}.diameter`,
  `${circularKnittingMachineTableName}.smoothness`,
  `${circularKnittingMachineTableName}.model`,
  `${bussinessmanTableName}.id as manufacturer_id`, 
  `${bussinessmanTableName}.name as manufacturer_name`
])
  .from(`${circularKnittingMachineBussinessmanTableName}`)
  .where(whereCluse)
  .innerJoin(circularKnittingMachineTableName, `${circularKnittingMachineTableName}.id`, `${circularKnittingMachineBussinessmanTableName}.circular_knitting_machine_id`)
  .innerJoin(bussinessmanTableName, `${bussinessmanTableName}.id`, `${circularKnittingMachineBussinessmanTableName}.manufacturer_id`)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
          queryResults = constants.errorPayload
          console.log(error);
      })
  return queryResults;
};

exports.selectByManufacture = async (manufactureId) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${circularKnittingMachineBussinessmanTableName}.manufacturer_id`] = manufactureId;
  whereCluse[`${circularKnittingMachineBussinessmanTableName}.is_active`] = 1;
  whereCluse[`${circularKnittingMachineBussinessmanTableName}.is_active`] = 1;

  await knex.select([`${circularKnittingMachineBussinessmanTableName}.id`, 
  `${circularKnittingMachineTableName}.id as circular_knitting_machine_id`,
  `${circularKnittingMachineTableName}.type`,
  `${circularKnittingMachineTableName}.number`,
  `${circularKnittingMachineTableName}.diameter`,
  `${circularKnittingMachineTableName}.smoothness`,
  `${circularKnittingMachineTableName}.model`,
  knex.raw(`CONCAT('النوع: ', type, ' - القطر: ', diameter, ' - جوج: ', smoothness, ' - الموديل: ', model, ' - رقم: ', number) as name`)
])
  .from(`${circularKnittingMachineBussinessmanTableName}`)
  .where(whereCluse)
  .innerJoin(circularKnittingMachineTableName, 
    `${circularKnittingMachineTableName}.id`, 
    `${circularKnittingMachineBussinessmanTableName}.circular_knitting_machine_id`)
      .then(data => {
          queryResults = data
      })
      .catch(error => {
          queryResults = constants.errorPayload
          console.log(error);
      })
  return queryResults;
};

exports.delete = async (circularKnittingMachineBussinessmanId) => {
  let queryResults = false;
  await sqlFun
    .delete(circularKnittingMachineBussinessmanTableName, {
      id: circularKnittingMachineBussinessmanId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (circularKnittingMachineBussinessmanId) => {
  let queryResults = false;
  await sqlFun
    .restore(circularKnittingMachineBussinessmanTableName, {
      id: circularKnittingMachineBussinessmanId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
