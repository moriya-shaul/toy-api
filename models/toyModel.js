const mongoose = require("mongoose");
const Joi = require("joi");

const toySchema = new mongoose.Schema({
  name: String,
  info: String,
  category: String,
  img_url: String,
  price: Number,
  date: {
    type: Date,
    default: Date.now(),
  },
  user_id: String,
});

exports.toyModel = mongoose.model("toys", toySchema);

exports.validateToy = (_reqBody) => {
  let schemaJoi = Joi.object({
    name: Joi.string().min(2).max(99).required(),
    info: Joi.string().min(2).max(9999).required(),
    category: Joi.string().min(2).max(99).required(),
    img_url: Joi.string().min(2).max(99).allow(null, ""),
    price: Joi.number().min(2).max(99999).required()
  });
  return schemaJoi.validate(_reqBody);
};
