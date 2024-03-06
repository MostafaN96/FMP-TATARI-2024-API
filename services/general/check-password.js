const bcrypt = require("bcrypt");

checkPassword = async (password, storedPassword) => {
  const results = bcrypt.compareSync(password, storedPassword);
  return results;
};

module.exports = {
  checkPassword,
};
