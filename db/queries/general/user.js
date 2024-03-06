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

exports.select = async () => {
  let queryResults = [];
  await sqlFun
    .select(
      userTableName,
      [
        `${userTableName}.user_id`,
        `${userTableName}.user_name`,
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