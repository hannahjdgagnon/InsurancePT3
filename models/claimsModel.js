let mongoose = require("mongoose");

let claimSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  //any other fields
});

let Claim = mongoose.model("Claim", claimSchema);

module.exports = Claim;
