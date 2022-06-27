const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema(
  {
    category: { type: String, required: [true, "Category is required"] },
    title: { type: String, required: [true, "Title is required"] },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    details: { type: String, required: [true, "Details are required"] },
    weight: { type: String, required: [true, "Weight is required"] },
    color: { type: String, required: [true, "Color is required"] },
    img: { type: String, required: [true, "Image path is required"] },
    watchlist: { type: String, default: "Watch it" },
    watchListBy: { type: Array, default: [] },
    tradeListBy: { type: String, default: "-" },
    status: { type: String, default: "Available" },
    trade: {
      myItemID: { type: String, default: "0" },
      tradeItemID: { type: String, default: "0" },
      tradeOwnerID: { type: String, default: "0" },
      tradeStatus: { type: String, default: "Pending" },
    },
  },
  { timeStamp: true }
);

// Collection name is "items" in the database
module.exports = mongoose.model("Item", itemSchema);
