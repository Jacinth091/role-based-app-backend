const guestContent = async (req, res) => {
  res.json({
    message: "Public content for all visitors",
  });
};


module.exports = {guestContent};