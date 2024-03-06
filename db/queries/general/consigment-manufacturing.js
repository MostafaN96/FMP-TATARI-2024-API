// Config
const sqlFun = require("../../config/sql-fun");

// Util
const consigmentManufacturingTableName = require("../../../util/database-tables-name").consigmentManufacturingTableName;


exports.insertForWdTransportRequisitionWdWc = async (consigmentManufacturing, items) => {
  let queryResults = false;
  await sqlFun
    .insert(consigmentManufacturingTableName, {
      id: items.consigmentManufacturingId,
      number: items.consigmentManufacturingNumber,
      creator_id: consigmentManufacturing.personid,
      ip_address: consigmentManufacturing.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertAddWc = async (consigmentManufacturing, items) => {
  let queryResults = false;
  await sqlFun
    .insert(consigmentManufacturingTableName, {
      id: items.consigmentManufacturingId,
      number: items.consigmentNumber,
      creator_id: consigmentManufacturing.personid,
      ip_address: consigmentManufacturing.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insert = async (consigmentManufacturing) => {
  let queryResults = false;
  await sqlFun
    .insert(consigmentManufacturingTableName, {
      id: consigmentManufacturing.id,
      number: consigmentManufacturing.number,
      creator_id: consigmentManufacturing.personid,
      ip_address: consigmentManufacturing.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForManufacturing = async (consigmentManufacturing) => {
  let queryResults = false;
  await sqlFun
    .insert(consigmentManufacturingTableName, {
      id: consigmentManufacturing.consigmentManufacturingId,
      number: consigmentManufacturing.consigmentNumber,
      creator_id: consigmentManufacturing.personid,
      ip_address: consigmentManufacturing.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (consigmentManufacturing) => {
  let queryResults = false;
  await sqlFun
    .update(
      consigmentManufacturingTableName,
      {
        number: consigmentManufacturing.number,
      }, {
        id: consigmentManufacturing.id,
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
    .limitedSelect(consigmentManufacturingTableName, [
      `${consigmentManufacturingTableName}.id`,
      `${consigmentManufacturingTableName}.number`,
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
      consigmentManufacturingTableName,
      [
        `${consigmentManufacturingTableName}.id`,
        `${consigmentManufacturingTableName}.number`,
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
      consigmentManufacturingTableName,
      [
        `${consigmentManufacturingTableName}.id`,
        `${consigmentManufacturingTableName}.number`,
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

exports.delete = async (consigmentManufacturingId) => {
  let queryResults = false;
  await sqlFun
    .delete(consigmentManufacturingTableName, {
      id: consigmentManufacturingId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (consigmentManufacturingId) => {
  let queryResults = false;
  await sqlFun
    .restore(consigmentManufacturingTableName, {
      id: consigmentManufacturingId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};