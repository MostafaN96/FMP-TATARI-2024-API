// Config
const sqlFun = require("../../config/sql-fun");

// Util
const { gradeItemTableName } = require("../../../util/database-tables-name");

exports.insert = async (gradeItem) => {
  let queryResults = false;
  await sqlFun
    .insert(gradeItemTableName, {
      id: gradeItem.id,
      name: gradeItem.name,
      creator_id: gradeItem.personid,
      ip_address: gradeItem.ipaddress
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (gradeItem) => {
  let queryResults = false;
  await sqlFun
    .update(
      gradeItemTableName,
      {
        name: gradeItem.name,
      }, {
        id: gradeItem.id,
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
    .limitedSelect(gradeItemTableName, [
      `${gradeItemTableName}.id`,
      `${gradeItemTableName}.name`,
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
      gradeItemTableName,
      [
        `${gradeItemTableName}.id`,
        `${gradeItemTableName}.name`,
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
      gradeItemTableName,
      [
        `${gradeItemTableName}.id`,
        `${gradeItemTableName}.name`,
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

exports.delete = async (gradeItemId) => {
  let queryResults = false;
  await sqlFun
    .delete(gradeItemTableName, {
      id: gradeItemId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (gradeItemId) => {
  let queryResults = false;
  await sqlFun
    .restore(gradeItemTableName, {
      id: gradeItemId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};
