// Config
const sqlFun = require("../../config/sql-fun");

// Util
const consigmentYarnTableName = require("../../../util/database-tables-name").consigmentYarnTableName;

exports.insertForWdTransportRequisitionWdWc = async (consigmentYarn, items) => {
  let queryResults = false;
  await sqlFun
    .insert(consigmentYarnTableName, {
      id: items.consigmentYarnId,
      number: items.consigmentYarnNumber,
      creator_id: consigmentYarn.personid,
      ip_address: consigmentYarn.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForAddByOrder = async (consigmentYarn, items) => {
  let queryResults = false;
  await sqlFun
    .insert(consigmentYarnTableName, {
      id: items.consigmentYarnId,
      number: items.consigmentYarnNumber,
      creator_id: consigmentYarn.personid,
      ip_address: consigmentYarn.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};


exports.insert = async (consigmentYarn) => {
  let queryResults = false;
  await sqlFun
    .insert(consigmentYarnTableName, {
      id: consigmentYarn.id,
      number: consigmentYarn.number,
      creator_id: consigmentYarn.personid,
      ip_address: consigmentYarn.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForWaExecuteOrder = async (consigmentYarn, items) => {
  let queryResults = false;
  await sqlFun
    .insert(consigmentYarnTableName, {
      id: items.consigmentYarnId,
      number: items.newConsigmentYarnNumber,
      creator_id: consigmentYarn.personid,
      ip_address: consigmentYarn.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (consigmentYarn) => {
  let queryResults = false;
  await sqlFun
    .update(
      consigmentYarnTableName,
      {
        number: consigmentYarn.number,
      }, {
        id: consigmentYarn.id,
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
    .limitedSelect(consigmentYarnTableName, [
      `${consigmentYarnTableName}.id`,
      `${consigmentYarnTableName}.number`,
    ], whereCluse, 1)
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
  await sqlFun
    .select(
      consigmentYarnTableName,
      [
        `${consigmentYarnTableName}.id`,
        `${consigmentYarnTableName}.number`,
      ],
      {
        is_deleted: "0",
        is_active: "1",
      }
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};


exports.selectDeleted = async () => {
  let queryResults = [];
  await sqlFun
    .select(
      consigmentYarnTableName,
      [
        `${consigmentYarnTableName}.id`,
        `${consigmentYarnTableName}.number`,
      ],
      {
        is_deleted: "1",
        is_active: "0",
      }
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.delete = async (consigmentYarnId) => {
  let queryResults = false;
  await sqlFun
    .delete(consigmentYarnTableName, {
      id: consigmentYarnId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (consigmentYarnId) => {
  let queryResults = false;
  await sqlFun
    .restore(consigmentYarnTableName, {
      id: consigmentYarnId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};