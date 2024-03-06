
// Queries
const userQueries = require("../../db/queries/general/user");

// Util
const constants = require("../../util/constants");

// Services
const checkPassword = require("./check-password");
const usersPermissionsService = require("./users-permissions");

const jwt = require("jsonwebtoken");
const userTypes = require("../../util/user-types");
const { privilegesTableName, modulesTableName, pagesTableName } = require("../../util/database-tables-name");

const selectUserPrivileges = async (selectUserPrivilegesResults) => {

  let moduleId = ""
  let componentId = ""
  let pageId = ""
  let modules = []

  selectUserPrivilegesResults.forEach(privilege => {

    if (privilege.modules_id === moduleId) {
      let module = modules[modules.length - 1]

      if (privilege.components_id === componentId) {

        let component = module.components[module.components.length - 1]

        if (privilege.pages_id === pageId) {
          component.pages[component.pages.length - 1].functions.push({ ...privilege })

        } else {

          pageId = privilege.pages_id
          component.pages.push(
            {
              pageId: privilege.pages_id,
              pageName: privilege.pages_name,
              pageLink: privilege.pages_link,

              functions: [
                { ...privilege }
              ]
            }

          )

        }

      } else {

        componentId = privilege.components_id
        pageId = privilege.pages_id

        module.components.push(

          {
            componentId: privilege.components_id,
            componentName: privilege.components_name,

            pages: [
              {
                pageId: privilege.pages_id,
                pageName: privilege.pages_name,
                pageLink: privilege.pages_link,

                functions: [
                  { ...privilege }
                ]
              }
            ]
          }
        )


      }



    } else {
      moduleId = privilege.modules_id
      componentId = privilege.components_id
      pageId = privilege.pages_id

      modules.push({
        moduleId: privilege.modules_id,
        moduleName: privilege.modules_name,
        components: [
          {
            componentId: privilege.components_id,
            componentName: privilege.components_name,

            pages: [
              {
                pageId: privilege.pages_id,
                pageName: privilege.pages_name,
                pageLink: privilege.pages_link,

                functions: [
                  { ...privilege }
                ]
              }
            ]
          }
        ]

      })

    }

  })

  return modules
};
exports.login = async (user) => {
  // check on emails
  const selectOneResult = await userQueries.selectByEmail(user);
  if (selectOneResult[0] == null) {
    return constants.itemNotFound;
  }
  user.stored_password = selectOneResult[0].user_password;
  user.user_id = selectOneResult[0].user_id;

  // Check Password
  let isCorrectPassword = await checkPassword.checkPassword(
    user.password,
    user.stored_password
  );
  if (!isCorrectPassword) {
    return constants.unauthorized;
  }

  // console.log("000000000000000");
  // selectUserPrivileges
  let whereCluse = {};
  whereCluse[`${privilegesTableName}.is_deleted`] = 0;
  whereCluse[`${privilegesTableName}.is_active`] = 1;
  whereCluse[`${modulesTableName}.is_setting`] = 0;
  whereCluse[`${pagesTableName}.is_details`] = 0;
  whereCluse[`${privilegesTableName}.user_id`] = selectOneResult[0].user_id;
  const selectUserPrivilegesResults = await usersPermissionsService.selectAddedUsersPermissionsForPrivilege(whereCluse)
  const modules = await selectUserPrivileges(selectUserPrivilegesResults)

  whereCluse[`${modulesTableName}.is_setting`] = 1;
  const selectsettingModuleResults = await usersPermissionsService.selectAddedUsersPermissionsForPrivilege(whereCluse)
  const settingModule = await selectUserPrivileges(selectsettingModuleResults)

  let linksWhereCluse = {};
  linksWhereCluse[`${privilegesTableName}.is_deleted`] = 0;
  linksWhereCluse[`${privilegesTableName}.is_active`] = 1;
  linksWhereCluse[`${privilegesTableName}.user_id`] = selectOneResult[0].user_id;
  const links = await usersPermissionsService.selectLinksByUserId(linksWhereCluse)

  const tokenPayload = {
    user_email: user.email,
    user_id: user.user_id,
    isAdmin: true,
    userType: userTypes.ADMIN_STR,
  };
  const secret = userTypes.TOKEN_KEY;
  const token = jwt.sign(tokenPayload, secret, {
    // expiresIn: '10h'
  });
  
  // console.log("modules :::: ", modules);
  // console.log("settingModule :::: ", settingModule);
  // console.log("links :::: ", links);
  return {
    token,
    privilege: {
      modules,
      settingModule,
      links
    }
  };

};

exports.select = async () => {
  const results = await userQueries.select();
  return results;
};

