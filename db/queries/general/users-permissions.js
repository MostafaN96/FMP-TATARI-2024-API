// Config
const sqlFun = require("../../config/sql-fun");
const knex = require("../../config/connection").getConnection();

// Util
const { privilegesTableName, pagesTableName, functionsTableName, 
    componentsTableName, modulesTableName } = require("../../../util/database-tables-name");


exports.insert = async (usersPermissions, items) => {
    let queryResults = false;
    await sqlFun
        .insert(privilegesTableName, {
            user_id: usersPermissions.userId,
            functions_id: items.functions_id,
            pages_id: items.pages_id,
            modules_id: items.modules_id,
            components_id: items.components_id,
            creator_id: usersPermissions.personid,
            ip_address: usersPermissions.ipaddress,
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
        .limitedSelect(privilegesTableName, ["is_deleted"], whereCluse, 1)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => {
            console.log(error);
        });

    return queryResults;
};

exports.update = async (usersPermissions, whereCluse) => {
    let queryResults = false;
    await sqlFun
        .update(
            privilegesTableName,
            usersPermissions,
            whereCluse
        )
        .then((data) => {
            queryResults = true;
        })
        .catch((err) => console.log(err));
    return queryResults;
};

exports.selectAddedUsersPermissions = async (whereCluse) => {
    let queryResults = [];

    await knex.select([
        `${privilegesTableName}.user_id`,
        `${functionsTableName}.id as functions_id`,
        `${functionsTableName}.name as functions_name`,
        `${pagesTableName}.id as pages_id`,
        `${pagesTableName}.name as pages_name`,
        `${pagesTableName}.link as pages_link`,
        `${componentsTableName}.id as components_id`,
        `${componentsTableName}.name as components_name`,
        `${componentsTableName}.order as components_order`,
        `${modulesTableName}.id as modules_id`,
        `${modulesTableName}.name as modules_name`,
        `${modulesTableName}.order`,
    ])
        .from(privilegesTableName)
        .where(whereCluse)
        .orderBy([`order`, `components_order`, `components_id`, `pages_id`, `functions_id`])
        .innerJoin(`${functionsTableName}`,
            `${functionsTableName}.id`,
            `${privilegesTableName}.functions_id`)
        .innerJoin(`${pagesTableName}`,
            `${pagesTableName}.id`,
            `${privilegesTableName}.pages_id`)
        .innerJoin(`${componentsTableName}`,
            `${componentsTableName}.id`,
            `${privilegesTableName}.components_id`)
        .innerJoin(`${modulesTableName}`,
            `${modulesTableName}.id`,
            `${privilegesTableName}.modules_id`)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};

exports.selectLinksByUserId = async (whereCluse) => {
    let queryResults = [];

    await knex.select([
        `${pagesTableName}.link`,
    ])
        .from(privilegesTableName)
        .where(whereCluse)
        .innerJoin(`${pagesTableName}`,
            `${pagesTableName}.id`,
            `${privilegesTableName}.pages_id`)
            .pluck(`${pagesTableName}.link`)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};


exports.selectNewUsersPermissions = async (whereCluse, userId) => {
    let queryResults = [];

    await knex.select([
        `${functionsTableName}.id as functions_id`,
        `${functionsTableName}.name as functions_name`,
        `${pagesTableName}.id as pages_id`,
        `${pagesTableName}.name as pages_name`,
        `${pagesTableName}.link as pages_link`,
        `${componentsTableName}.id as components_id`,
        `${componentsTableName}.name as components_name`,
        `${modulesTableName}.id as modules_id`,
        `${modulesTableName}.name as modules_name`,
    ])
        .from(modulesTableName)
        .innerJoin(`${componentsTableName}`,
            `${componentsTableName}.modules_id`,
            `${modulesTableName}.id`)
        .innerJoin(`${pagesTableName}`,
            `${pagesTableName}.components_id`,
            `${componentsTableName}.id`)
            .innerJoin(`${functionsTableName}`,
            `${functionsTableName}.pages_id`,
            `${pagesTableName}.id`)
            .whereNotIn(`${functionsTableName}.id`, function() {
                this.select([
                    `${privilegesTableName}.functions_id as id`
                ])
                    .from(privilegesTableName)
                    .where(`${privilegesTableName}.user_id`, userId)
                    .andWhere({
                        'is_deleted': '0',
                        'is_active': '1'
                    })
              })
        .andWhere(whereCluse)
        .then((data) => {
            queryResults = data;
        })
        .catch((error) => console.error(error));
    return queryResults;
};