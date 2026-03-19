const { accounts } = require("../data");

const guestContent = async (req, res) => {
  res.json({
    message: "Public content for all visitors",
  });
};

//testing
const getAccountList = async (req, res) => {
  res.json({
    message: "Current All Account List",
    accountList: accounts
  })
}


module.exports = { guestContent, getAccountList };