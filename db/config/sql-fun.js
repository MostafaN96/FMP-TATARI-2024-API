const databaseConnection = require("../config/connection");
const knex = databaseConnection.getConnection()

exports.insert = async (tableName, payload) => {
  return knex(`${tableName}`).insert(payload);
};

exports.selectMaxValue = async (tableName, atrributeMaxValue) => {
  return knex(tableName).max(atrributeMaxValue)
}

exports.selectMaxValueWithCondition = async (tableName, atrributeMaxValue, whereCluse) => {
  return knex(tableName)
  .max(atrributeMaxValue)
  .where(whereCluse)
}

exports.selectMaxValueWithJoinCondition = async (tableName, atrributeMaxValue, whereCluse, 
  innerTable, innerTableAttribute, outerTableAttribute) => {
  return knex(tableName)
  .max(atrributeMaxValue)
  .innerJoin(innerTable, innerTableAttribute, outerTableAttribute)
  .where(whereCluse)
}

exports.selectMaxValueWith2JoinCondition = async (tableName, atrributeMaxValue, whereCluse, 
  innerTable, innerTableAttribute, outerTableAttribute,
  innerTable2, innerTableAttribute2, outerTableAttribute2
  ) => {
  return knex(tableName)
  .max(atrributeMaxValue)
  .innerJoin(innerTable, innerTableAttribute, outerTableAttribute)
  .innerJoin(innerTable2, innerTableAttribute2, outerTableAttribute2)
  .where(whereCluse)
}

exports.update = async ( tableName, payload, whereCluse) => {
  return knex(`${tableName}`).where(whereCluse).update(payload);
};

exports.delete = async ( tableName, whereCluse) => {
  const payload = {
    is_deleted: 1,
    is_active: 0,
  };

  return knex(tableName).where(whereCluse).update(payload);
};

exports.changeState = async ( tableName, whereCluse, state) => {
  const payload = {
    state: state,
  };

  return knex(tableName).where(whereCluse).update(payload);
};

exports.restore = async ( tableName, whereCluse) => {
  const payload = {
    is_deleted: 0,
    is_active: 1,
  };
  return knex(tableName).where(whereCluse).update(payload);
};

exports.addConfirm = async (knex, tableName, whereCluse) => {
  const payload = {
    is_deleted: 0,
    is_active: 1,
  };

  return knex(tableName).where(whereCluse).update(payload);
};

exports.deleteConfirm = async (knex, tableName, whereCluse) => {
  const payload = {
    is_deleted: 1,
    is_active: 0,
  };

  return knex(tableName).where(whereCluse).update(payload);
};

exports.select = async ( tableName, atrributesArray, whereCluse) => {
  return knex.select(atrributesArray).from(`${tableName}`).where(whereCluse)
};

// new

exports.limitedSelect = async (
  tableName,
  atrributesArray,
  whereCluse,
  limit
) => {
  return knex
    .select(atrributesArray)
    .limit(limit)
    .from(`${tableName}`)
    .where(whereCluse);
};
// new

exports.selectWithWhereCluseFun = async (
  knex,
  tableName,
  atrributesArray,
  whereCluseFun
) => {
  return knex.select(atrributesArray).from(`${tableName}`).where(whereCluseFun);
};
// new

exports.selectWithTwoCondition = async (
  tableName,
  atrributesArray,
  whereCluse,
  andWhereCluseArray
) => {
  return knex.select(atrributesArray).from(`${tableName}`)
    .where(whereCluse)
    .andWhere(andWhereCluseArray[0], andWhereCluseArray[1], andWhereCluseArray[2]);
};
// new
exports.selectWithOrder = async (
  tableName,
  atrributesArray,
  whereCluse,
  orderBy, 
  orderByType
) => {
  return knex
    .select(atrributesArray)
    .from(`${tableName}`)
    .where(whereCluse)
    .orderBy(orderBy, orderByType);
};

exports.selectWhereIn = async (tableName, atrributesArray, whereCluse, 
  whereInId, selectWhereInId, whereInTable, whereInWhereCluse) => {
  return knex.select(atrributesArray)
      .from(`${tableName}`)
      .whereIn(whereInId, function() {
          this.select(selectWhereInId).from(whereInTable).where(whereInWhereCluse);
        })
      .andWhere(whereCluse)
}

// like this
// const query = sqlFun.selectDplicatedData(knex, tableName, 'product_id', id, function () {
//     this.where('product_title', id)
//         .orWhere('product_title', `${request.body.productTitle}`)
//         .orWhere('product_desc', `${request.body.productDesc}`)

// })
// console.log(query);

exports.checkDuplicatedDataByUpdate = async (
  knex,
  tableName,
  idName,
  recoredId,
  whereCluseFun
) => {
  return knex
    .select(["is_deleted"])
    .from(`${tableName}`)
    .whereNot(`${idName}`, recoredId)
    .where(whereCluseFun);
};

exports.checkDuplicatedDataByAdd = async (knex, tableName, whereCluseFun) => {
  return knex.select(["is_deleted"]).from(`${tableName}`).where(whereCluseFun);
};

exports.selectWithJion = async (
  tableName,
  atrributesArray,
  whereCluse,
  innerTable,
  innerTableAttribute,
  outerTableAttribute
) => {
  return knex(tableName)
    .innerJoin(innerTable, innerTableAttribute, outerTableAttribute)
    .select(atrributesArray)
    .where(whereCluse)
};

exports.selectWithJionOrderedBy = async (
  tableName,
  atrributesArray,
  whereCluse,
  innerTable,
  innerTableAttribute,
  outerTableAttribute,
  orderedByColumn,
  orderedByAttribute
) => {
  return knex(tableName)
    .innerJoin(innerTable, innerTableAttribute, outerTableAttribute)
    .select(atrributesArray)
    .where(whereCluse)
    .orderBy(orderedByColumn, orderedByAttribute)
};
exports.selectWithJionAndDistinct = async (
  tableName,
  atrributesArray,
  whereCluse,
  innerTable,
  innerTableAttribute,
  outerTableAttribute,
  distinctColumn
) => {
  return knex(tableName)
    .distinct(`${distinctColumn}`)
    .select(atrributesArray)
    .innerJoin(innerTable, innerTableAttribute, outerTableAttribute)
    .where(whereCluse);
};

exports.selectWithJionWithLimit = async (
  tableName,
  atrributesArray,
  whereCluse,
  innerTable,
  innerTableAttribute,
  outerTableAttribute,
  limit
) => {
  return knex(tableName)
    .innerJoin(innerTable, innerTableAttribute, outerTableAttribute)
    .select(atrributesArray)
    .where(whereCluse)
    .limit(limit);
};

exports.selectWithJionByDate = async (
  knex,
  tableName,
  atrributesArray,
  whereCluse,
  innerTable,
  innerTableAttribute,
  outerTableAttribute,
  whereBetween,
  whereBetween2
) => {
  return knex(tableName)
    .join(innerTable, innerTableAttribute, "=", outerTableAttribute)
    .select(atrributesArray)
    .where(whereCluse)
    .whereBetween(whereBetween, whereBetween2);
};
