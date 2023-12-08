let mongoose = require("mongoose");

let claimsModel = mongoose.Schema(
  {
    title: String,
    description: String,
  },
  {
    collection: "claims",
  }
);

module.exports = mongoose.model("claims", claimsModel);
