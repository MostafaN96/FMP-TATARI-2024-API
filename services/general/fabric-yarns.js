// Queries
const fabricYarnsQueries = require("../../db/queries/general/fabric-yarns");
const fabricQueries = require("../../db/queries/general/fabric");

// Util
// const constantsPayloads = require("../../util/constants-payloads");
const { fabricYarnsTableName, fabricTableName } = require("../../util/database-tables-name");
const constants = require("../../util/constants");


exports.create = async (fabricYarns) => {
  for (let i = 0; i < fabricYarns.items.length; i++) {
    const fabricYarn = fabricYarns.items[i];

    // check is found
    let whereCluse = {}
    whereCluse[`${fabricYarnsTableName}.fabric_id`] = fabricYarns.id;
    whereCluse[`${fabricYarnsTableName}.yarn_id`] = fabricYarn.yarnId;

    const selectOneResult = await fabricYarnsQueries.selectOne(whereCluse);
    if (selectOneResult[0] != null) {
      // updated
      const updateResults = await fabricYarnsQueries.update({
        ratio: fabricYarn.ratio,
        wast_ratio: fabricYarn.wastRatio,
        is_deleted: 0,
        is_active: 1,
      }, whereCluse);
      if (updateResults) {
        let whereCluseFabric = {}
        whereCluseFabric[`${fabricTableName}.id`] = fabricYarns.id;
        await fabricQueries.updateDynamic({
          is_form: 1
        },
          whereCluseFabric)

        return constants.insertSuccess;
      } else {
        return constants.insertError;
      }
    } else {

      const results = await fabricYarnsQueries.insert(fabricYarns, fabricYarn);
      if (results) {
        let whereCluseFabric = {}
        whereCluseFabric[`${fabricTableName}.id`] = fabricYarns.id;
        await fabricQueries.updateDynamic({
          is_form: 1
        },
          whereCluseFabric)
        return constants.insertSuccess
      } else {
        return constants.insertError;
      }
    }

  }


};

exports.selectByFabricId = async (fabricId) => {

  let whereCluse = {}
  whereCluse[`${fabricYarnsTableName}.fabric_id`] = fabricId;
  whereCluse[`${fabricYarnsTableName}.is_deleted`] = 0;
  whereCluse[`${fabricYarnsTableName}.is_active`] = 1;

  const results = await fabricYarnsQueries.select(whereCluse);

  return results;
};

exports.selectByFabricIdByYarnId = async (fabricId, yarnId) => {

  let whereCluse = {}
  whereCluse[`${fabricYarnsTableName}.fabric_id`] = fabricId;
  whereCluse[`${fabricYarnsTableName}.yarn_id`] = yarnId;
  whereCluse[`${fabricYarnsTableName}.is_deleted`] = 0;
  whereCluse[`${fabricYarnsTableName}.is_active`] = 1;

  const results = await fabricYarnsQueries.select(whereCluse);

  return results;
};


exports.update = async (fabricYarns) => {

  for (let i = 0; i < fabricYarns.items.length; i++) {
    const fabricYarn = fabricYarns.items[i];
    console.log("fabricYarn ::: ", fabricYarn);

    // check is found
    let whereCluse = {}
    whereCluse[`${fabricYarnsTableName}.fabric_id`] = fabricYarns.id;
    whereCluse[`${fabricYarnsTableName}.yarn_id`] = fabricYarn.yarnId;
    whereCluse[`${fabricYarnsTableName}.is_deleted`] = 0;
    whereCluse[`${fabricYarnsTableName}.is_active`] = 1;

    // check is added
    const isItemAdded = await fabricYarnsQueries.selectOne(whereCluse);
    if (isItemAdded[0] != null) {
      // updated
      const updateResults = await fabricYarnsQueries.update({
        ratio: fabricYarn.ratio,
        wast_ratio: fabricYarn.wastRatio
      }, whereCluse);
      if (updateResults) {
        return constants.updateSuccess;
      } else {
        return constants.updateError;
      }

    } else {
      return constants.updateError;
    }
  }

};

exports.dalete = async (bodyPalod) => {
  for (let i = 0; i < bodyPalod.length; i++) {
    const fabricYarn = bodyPalod[i];

    //
    let whereCluse = {}
    whereCluse[`${fabricYarnsTableName}.fabric_id`] = bodyPalod.id;
    whereCluse[`${fabricYarnsTableName}.yarn_id`] = fabricYarn.yarnId;
    whereCluse[`${fabricYarnsTableName}.is_deleted`] = 0;
    whereCluse[`${fabricYarnsTableName}.is_active`] = 1;

    // check is the item is found
    const isItemAdded = await fabricYarnsQueries.selectOne(whereCluse);

    if (isItemAdded[0] != null) {
      const results = await fabricYarnsQueries.delete(whereCluse);
      if (!results) {
        return constants.deleteError;
      }
      else if (bodyPalod.length - 1 == i) {
        // select if deleted all form data
        let whereCluseIsFound = {}
        whereCluseIsFound[`${fabricYarnsTableName}.fabric_id`] = bodyPalod.id;
        whereCluseIsFound[`${fabricYarnsTableName}.is_deleted`] = 0;
        whereCluseIsFound[`${fabricYarnsTableName}.is_active`] = 1;
        const isFound = await fabricYarnsQueries.selectOne(whereCluseIsFound);
        if (isFound.length < 1) {
          let whereCluseFabric = {}
          whereCluseFabric[`${fabricTableName}.id`] = bodyPalod.id;
          await fabricQueries.updateDynamic({
            is_form: 0
          },
            whereCluseFabric)
        }

        return results;
      }
    } else {
      return constants.itemNotFound;
    }
  }

};