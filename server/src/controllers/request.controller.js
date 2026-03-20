const { requests, employees, accounts } = require("../data.js");

const getRequestList = async (req, res) => {
  try {
    const userRequests = requests.filter((r) => r.user_id === Number(req.user.id));
    if (!userRequests.length) {
      return res.status(404).json({ success: false, error: "No requests found." });
    }
    return res.status(200).json({ success: true, message: "Requests fetched successfully.", data: userRequests });
  } catch (error) {
    console.error("Get Requests Error: ", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const createRequest = async (req, res) => {
  const { type, items } = req.body;
  try {
    if (!type?.trim()) {
      return res.status(400).json({ success: false, error: "Request type is required." });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "At least one item is required." });
    }

    const validItems = items.filter((i) => i.name?.trim() && i.qty > 0);
    if (!validItems.length) {
      return res.status(400).json({ success: false, error: "Items must have a valid name and quantity." });
    }

    const newRequest = {
      id: requests.length === 0 ? 1 : requests[requests.length - 1].id + 1,
      user_id: Number(req.user.id),
      type: type.trim(),
      items: validItems,
      status: "Pending",
      date: new Date().toISOString(),
    };

    requests.push(newRequest);
    return res.status(201).json({ success: true, message: "Request submitted successfully!", data: newRequest });
  } catch (error) {
    console.error("Create Request Error: ", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const deleteRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const index = requests.findIndex((r) => r.id === Number(id) && r.user_id === Number(req.user.id));
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Request not found." });
    }
    if (requests[index].status !== "Pending") {
      return res.status(400).json({ success: false, error: "Only pending requests can be deleted." });
    }

    const [deleted] = requests.splice(index, 1);
    return res.status(200).json({ success: true, message: "Request deleted successfully!", data: deleted });
  } catch (error) {
    console.error("Delete Request Error: ", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { getRequestList, createRequest, deleteRequest };