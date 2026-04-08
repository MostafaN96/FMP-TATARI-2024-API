const sqlFun = require("../../config/sql-fun");
const jwt = require("jsonwebtoken");
const userTypes = require("../../../util/user-types");
const userTableName = require("../../../util/database-tables-name").userTableName;

exports.login = async (user, privilege) => {
  let queryResults = [];
  const tokenPayload = {
    user_email: user.email,
    user_id: user.user_id,
    isAdmin: true,
    privilege: privilege,
    userType: userTypes.ADMIN_STR,
  };
  const secret = userTypes.TOKEN_KEY;
  const token = jwt.sign(tokenPayload, secret, {
    // expiresIn: '10h'
  });
      queryResults = token;
  return queryResults;
};

exports.selectByEmail = async (user) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${userTableName}.is_deleted`] = 0;
  whereCluse[`${userTableName}.is_active`] = 1;
  whereCluse[`${userTableName}.user_email`] = user.email;

  await sqlFun
    .limitedSelect(
      userTableName,
      [`${userTableName}.user_id`, `${userTableName}.user_password`],
      whereCluse,
      1
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.selectOne = async (whereCluse) => {
  let queryResults = false;
  
  // Add table name prefix to where clause keys if not already added
  let newWhereCluse = {};
  for (const key in whereCluse) {
    if (!key.includes('.')) {
      newWhereCluse[`${userTableName}.${key}`] = whereCluse[key];
    } else {
      newWhereCluse[key] = whereCluse[key];
    }
  }
  
  await sqlFun
    .limitedSelect(userTableName, [
      `${userTableName}.user_id`,
      `${userTableName}.user_email`,
      `${userTableName}.is_deleted`,
    ], newWhereCluse, 1)
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => {
      console.log(error);
    });

  return queryResults;
};

exports.selectByUserEmail = async (userEmail) => {
  let queryResults = [];
  let whereCluse = {};
  whereCluse[`${userTableName}.is_deleted`] = 0;
  whereCluse[`${userTableName}.is_active`] = 1;
  whereCluse[`${userTableName}.user_email`] = userEmail;

  await sqlFun
    .limitedSelect(
      userTableName,
      [`${userTableName}.user_id`, `${userTableName}.user_email`],
      whereCluse,
      1
    )
    .then((data) => {
      queryResults = data;
    })
    .catch((error) => console.error(error));
  return queryResults;
};

exports.insert = async (user) => {
  let queryResults = false;
  await sqlFun
    .insert(userTableName, {
      user_id: user.user_id,
      user_name: user.userName,
      user_email: user.userEmail,
      user_password: user.userPassword,
      user_mobile: user.userMobile,
      creator_id: user.personid,
      ip_address: user.ipaddress,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((error) => {
      console.log(error);
    });
  return queryResults;
};

exports.update = async (payload, whereCluse) => {
  let queryResults = false;
  await sqlFun
    .update(
      userTableName,
      payload,
      whereCluse
    )
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.delete = async (userId) => {
  let queryResults = false;
  await sqlFun
    .delete(userTableName, {
      user_id: userId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.restore = async (userId) => {
  let queryResults = false;
  await sqlFun
    .restore(userTableName, {
      user_id: userId,
    })
    .then((data) => {
      queryResults = true;
    })
    .catch((err) => console.log(err));
  return queryResults;
};

exports.select = async () => {
  let queryResults = [];
  await sqlFun
    .select(
      userTableName,
      [
        `${userTableName}.user_id`,
        `${userTableName}.user_name`,
        `${userTableName}.user_email`,
        `${userTableName}.user_mobile`,
        `${userTableName}.user_password`,
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
      userTableName,
      [
        `${userTableName}.user_id`,
        `${userTableName}.user_name`,
        `${userTableName}.user_email`,
        `${userTableName}.user_mobile`,
        `${userTableName}.user_password`,
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