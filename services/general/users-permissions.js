// Queries
const usersPermissionsQueries = require("../../db/queries/general/users-permissions");

// Util
const constants = require("../../util/constants");
const constantsPayloads = require("../../util/constants-payloads");
const { privilegesTableName, functionsTableName, modulesTableName } = require("../../util/database-tables-name");

exports.update = async (usersPermissions) => {
  // add new permissions
  for (let i = 0; i < usersPermissions.newUserPermissions.length; i++) {
      // check if added record
      const selectUsersPermissionsRecord = await usersPermissionsQueries.selectOne({
        user_id : usersPermissions.userId,
        functions_id : usersPermissions.newUserPermissions[i].functions_id,
      })

      if(selectUsersPermissionsRecord[0] != null) {
          await usersPermissionsQueries.update(constantsPayloads.deletePayload, {
            user_id : usersPermissions.userId,
            functions_id : usersPermissions.newUserPermissions[i].functions_id,
          });
      } else {
          await usersPermissionsQueries.insert(usersPermissions, usersPermissions.newUserPermissions[i]);
      }
  }

  // delete permissions
  for (let i = 0; i < usersPermissions.deletedUserPermissions.length; i++) {
      await usersPermissionsQueries.update(constantsPayloads.restorePayload, {
        user_id : usersPermissions.userId,
        functions_id : usersPermissions.deletedUserPermissions[i].functions_id,
      });
  }
  return { ...constants.insertSuccess };
};

exports.selectAddedUsersPermissionsForPrivilege = async (whereCluse) => {

   
    const results = await usersPermissionsQueries.selectAddedUsersPermissions(whereCluse);
    return results;
  };

exports.selectLinksByUserId = async (whereCluse) => {
    const results = await usersPermissionsQueries.selectLinksByUserId(whereCluse);
    return results;
  };

exports.selectAddedUsersPermissions = async (id) => {
    let whereCluse = {};
    whereCluse[`${privilegesTableName}.is_deleted`] = 0;
    whereCluse[`${privilegesTableName}.is_active`] = 1;
    whereCluse[`${privilegesTableName}.user_id`] = id;
   
    const results = await usersPermissionsQueries.selectAddedUsersPermissions(whereCluse);
    return results;
  };
  
  exports.selectNewUsersPermissions = async (userId) => {
    let whereCluse = {};
    whereCluse[`${functionsTableName}.is_deleted`] = 0;
    whereCluse[`${functionsTableName}.is_active`] = 1;

    const results = await usersPermissionsQueries.selectNewUsersPermissions(whereCluse, userId);
    return results;
  };