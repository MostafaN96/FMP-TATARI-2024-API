const bcrypt = require("bcrypt");

const gethashedText = (planText) => {
  const salt = bcrypt.genSaltSync(10);
  const hashedText = bcrypt.hashSync(planText, salt);
  return hashedText;
};

module.exports = {
  gethashedText,
};
