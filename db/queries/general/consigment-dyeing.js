// Config
const sqlFun = require("../../config/sql-fun");

// Util
const consigmentDyeingTableName = require("../../../util/database-tables-name").consigmentDyeingTableName;

exports.insert = async (consigmentDyeing) => {
  let queryResults = false;
  await sqlFun
    .insert(consigmentDyeingTableName, {
      id: consigmentDyeing.id,
      number: consigmentDyeing.number,
      creator_id: consigmentDyeing.personid,
      ip_address: consigmentDyeing.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForAdd = async (consigmentDyeing, items) => {
  let queryResults = false;
  await sqlFun
    .insert(consigmentDyeingTableName, {
      id: items.consigmentDyeingId,
      number: items.consigmentDyeingNumber,
      creator_id: consigmentDyeing.personid,
      ip_address: consigmentDyeing.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForTransport = async (consigmentDyeing, items, trx = null) => {
  let queryResults = false;
  await sqlFun
    .insert(consigmentDyeingTableName, {
      id: items.consigmentDyeingId,
      number: items.consigmentDyeingNumber,
      creator_id: consigmentDyeing.personid,
      ip_address: consigmentDyeing.ipaddress
    }, trx)
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForTransitionBetween = async (consigmentDyeing, items) => {
  let queryResults = false;
  await sqlFun
    .insert(consigmentDyeingTableName, {
      id: items.consigmentDyeingId,
      number: items.newConsigmentDyeingNumber,
      creator_id: consigmentDyeing.personid,
      ip_address: consigmentDyeing.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.insertForWeExecuteOrder = async (consigmentDyeing, items) => {
  let queryResults = false;
  await sqlFun
    .insert(consigmentDyeingTableName, {
      id: items.consigmentDyeingId,
      number: items.newConsigmentDyeingNumber,
      creator_id: consigmentDyeing.personid,
      ip_address: consigmentDyeing.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (consigmentDyeing) => {
  let queryResults = false;
  await sqlFun
    .update(
      consigmentDyeingTableName,
      {
        number: consigmentDyeing.number,
      }, {
        id: consigmentDyeing.id,
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
    .limitedSelect(consigmentDyeingTableName, [
      `${consigmentDyeingTableName}.id`,
      `${consigmentDyeingTableName}.number`,
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
      consigmentDyeingTableName,
      [
        `${consigmentDyeingTableName}.id`,
        `${consigmentDyeingTableName}.number`,
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
      consigmentDyeingTableName,
      [
        `${consigmentDyeingTableName}.id`,
        `${consigmentDyeingTableName}.number`,
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

exports.delete = async (consigmentDyeingId) => {
  let queryResults = false;
  await sqlFun
    .delete(consigmentDyeingTableName, {
      id: consigmentDyeingId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (consigmentDyeingId) => {
  let queryResults = false;
  await sqlFun
    .restore(consigmentDyeingTableName, {
      id: consigmentDyeingId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};