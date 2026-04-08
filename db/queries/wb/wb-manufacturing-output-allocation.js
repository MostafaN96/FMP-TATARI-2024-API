// Database Queries for wb_manufacturing_output_allocation
const knex = require("../../config/connection").getConnection();
const tableName = require("../../../util/database-tables-name").wbManufacturingOutputAllocationTableName;

/**
 * Insert new allocation record
 */
exports.insert = (allocation, trx = null) => {
  const queryBuilder = trx || knex;
  return queryBuilder(tableName).insert(allocation);
};

/**
 * Select allocations with conditions
 */
exports.select = (whereObject) => {
  return knex(tableName)
    .select()
    .where(whereObject)
    .andWhere("is_deleted", 0)
    .catch(err => {
      console.error("Error in select:", err);
      throw err;
    });
};

/**
 * Select single allocation
 */
exports.selectOne = (whereObject) => {
  return knex(tableName)
    .select()
    .where(whereObject)
    .andWhere("is_deleted", 0)
    .catch(err => {
      console.error("Error in selectOne:", err);
      throw err;
    });
};

/**
 * Select all allocations for specific output
 * Ordered by sequence_order
 */
exports.selectByOutputId = (outputId) => {
  return knex(tableName)
    .select()
    .where("wb_manufacturing_output_id", outputId)
    .andWhere("is_deleted", 0)
    .orderBy("sequence_order", "asc")
    .catch(err => {
      console.error("Error in selectByOutputId:", err);
      throw err;
    });
};

/**
 * Select all allocations for specific order
 */
exports.selectByOrderId = (orderId) => {
  return knex(tableName)
    .select()
    .where("orders_requisitions_id", orderId)
    .andWhere("is_deleted", 0)
    .catch(err => {
      console.error("Error in selectByOrderId:", err);
      throw err;
    });
};

/**
 * Get total allocated quantity for specific output
 */
exports.getTotalAllocated = (outputId) => {
  return knex(tableName)
    .where("wb_manufacturing_output_id", outputId)
    .andWhere("is_deleted", 0)
    .sum("allocated_quantity as total")
    .catch(err => {
      console.error("Error in getTotalAllocated:", err);
      throw err;
    });
};

/**
 * Get allocation count for specific output
 */
exports.getAllocationCount = (outputId) => {
  return knex(tableName)
    .where("wb_manufacturing_output_id", outputId)
    .andWhere("is_deleted", 0)
    .count("id as count")
    .catch(err => {
      console.error("Error in getAllocationCount:", err);
      throw err;
    });
};

/**
 * Update allocation record
 */
exports.update = (id, updateObject) => {
  return knex(tableName)
    .where("id", id)
    .update({
      ...updateObject,
      updated_at: new Date()
    })
    .catch(err => {
      console.error("Error in update:", err);
      throw err;
    });
};

/**
 * Soft delete allocation (mark as deleted)
 */
exports.deleteById = (id) => {
  return knex(tableName)
    .where("id", id)
    .update({
      is_deleted: 1,
      updated_at: new Date()
    })
    .catch(err => {
      console.error("Error in deleteById:", err);
      throw err;
    });
};

/**
 * Hard delete allocation (actual delete from DB)
 * Use with caution!
 */
exports.hardDeleteById = (id) => {
  return knex(tableName)
    .where("id", id)
    .del()
    .catch(err => {
      console.error("Error in hardDeleteById:", err);
      throw err;
    });
};

/**
 * Delete all allocations for specific output (soft delete)
 */
exports.deleteByOutputId = (outputId) => {
  return knex(tableName)
    .where("wb_manufacturing_output_id", outputId)
    .update({
      is_deleted: 1,
      updated_at: new Date()
    })
    .catch(err => {
      console.error("Error in deleteByOutputId:", err);
      throw err;
    });
};

/**
 * Check if allocation exists
 */
exports.checkExists = (whereObject) => {
  return knex(tableName)
    .where(whereObject)
    .andWhere("is_deleted", 0)
    .first()
    .catch(err => {
      console.error("Error in checkExists:", err);
      throw err;
    });
};

/**
 * Get allocation with related output data
 */
exports.selectWithOutputDetails = (allocationId) => {
  return knex(`${tableName} as alloc`)
    .select(
      "alloc.*",
      "output.quantity",
      "output.total_allocated_quantity",
      "output.remaining_quantity",
      "output.allocation_status"
    )
    .join("wb_manufacturing_output as output", "alloc.wb_manufacturing_output_id", "=", "output.id")
    .where("alloc.id", allocationId)
    .andWhere("alloc.is_deleted", 0)
    .first()
    .catch(err => {
      console.error("Error in selectWithOutputDetails:", err);
      throw err;
    });
};

/**
 * Get all allocations for output with order details
 */
exports.selectByOutputIdWithDetails = (outputId) => {
  return knex(`${tableName} as alloc`)
    .select(
      "alloc.id",
      "alloc.orders_requisitions_id",
      "alloc.allocated_quantity",
      "alloc.sequence_order",
      "alloc.created_at",
      "output.quantity",
      "output.total_allocated_quantity",
      "output.remaining_quantity",
      "output.allocation_status"
    )
    .join("wb_manufacturing_output as output", "alloc.wb_manufacturing_output_id", "=", "output.id")
    .where("alloc.wb_manufacturing_output_id", outputId)
    .andWhere("alloc.is_deleted", 0)
    .orderBy("alloc.sequence_order", "asc")
    .catch(err => {
      console.error("Error in selectByOutputIdWithDetails:", err);
      throw err;
    });
};

/**
 * Get allocation summary for specific output
 */
exports.getAllocationSummary = (outputId) => {
  return knex(tableName)
    .select(
      knex.raw('COUNT(id) as allocation_count'),
      knex.raw('SUM(allocated_quantity) as total_allocated'),
      knex.raw('MAX(sequence_order) as max_sequence')
    )
    .where("wb_manufacturing_output_id", outputId)
    .andWhere("is_deleted", 0)
    .first()
    .catch(err => {
      console.error("Error in getAllocationSummary:", err);
      throw err;
    });
};
