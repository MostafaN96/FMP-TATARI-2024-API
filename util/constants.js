const insertError = {
  status: "error",
  code: 500,
  msg: "cannot inerts data",
};
const insertSuccess = {
  status: "success",
  code: 201,
  msg: "data inserted",
};
const updateSuccess = {
  status: "success",
  code: 200,
  msg: "data updated",
};
const updateError = {
  status: "error",
  code: 500,
  msg: "faild to update the data",
};
const duplicatedData = {
  status: "error",
  code: 400,
  msg: "duplicated data",
};
const invalidDataResponse = {
  code: 400,
  status: "error",
  msg: "invalid data bad request",
};
const deleteError = {
  code: 500,
  status: "error",
  msg: "Faild to delete",
};
const deleteSuccess = {
  code: 200,
  status: "success",
  msg: "the item is delete",
};
const restoreError = {
  code: 500,
  status: "error",
  msg: "Faild to Restore",
};
const restoreSuccess = {
  code: 200,
  status: "success",
  msg: "the item is Restored",
};
const itemNotFound = {
  code: 404,
  status: "error",
  msg: "item not found",
};

const loginSuccess = {
  status: "success",
  code: 200,
  msg: "login success",
};

const unauthorized = {
  status: "error",
  code: 401,
  msg: "unauthorized",
};

const wrongQuantity = {
  status: "wrong",
  code: 400,
  msg: "quantity is wrong",
};

function notZero(n) {
  n = +n;  // Coerce to number.
  if (!n) {  // Matches +0, -0, NaN
    n = 1
  }
  return n;
}

module.exports = {
  insertError,
  insertSuccess,
  duplicatedData,
  invalidDataResponse,
  deleteError,
  restoreError,
  deleteSuccess,
  restoreSuccess,
  itemNotFound,
  updateSuccess,
  updateError,
  loginSuccess,
  unauthorized,
  wrongQuantity,

  notZero
};
