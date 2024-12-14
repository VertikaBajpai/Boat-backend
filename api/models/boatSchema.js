const mongoose = require("mongoose")
const boatSchema = new mongoose.Schema({
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
   amenities:{
    type: [String]
   },
    
    safetyfeatures:
    {type:[String]},
    photo:
    {
      type:  String
    }
  
  });
  const Boat = mongoose.model("Boat", boatSchema);

module.exports = Boat;