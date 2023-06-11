const express = require("express");
const { auth } = require("../middlewares/auth");
const { toyModel, validateToy } = require("../models/toyModel");
const router = express.Router();

router.get("/", async (req, res) => {
  let perPage = Math.min(req.query.perPage, 20) || 10;
  let page = req.query.page || 1;
  let sort = req.query.sort || "_id";
  let reverse = req.query.reverse == "yes" ? -1 : 1;

  try {
    let data = await toyModel
      .find({})
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ [sort]: reverse });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});
router.get("/signal/:id", async (req, res) => {
  let id = req.params.id;
  try {
    let toy = await toyModel.findOne({ _id: id });
    res.json(toy);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});
router.get("/search", async (req, res) => {
  let perPage = Math.min(req.query.perPage, 20) || 10;
  let page = req.query.page || 1;
  let sort = req.query.sort || "_id";
  let reverse = req.query.reverse == "yes" ? -1 : 1;
  let search = req.query.s;
  try {
    let toy = await toyModel
      .find({
        $or: [{ name: { $regex: search } }, { info: { $regex: search } }],
      })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ [sort]: reverse });
    res.json(toy);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

router.get("/category/:category", async (req, res) => {
  let perPage = req.query.perPage || 10;
  let page = req.query.page || 1;
  let category = req.params.category;
  try {
    let toy = await toyModel
      .find({ category: category })
      .limit(perPage)
      .skip((page - 1) * perPage);
    res.json(toy);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

router.post("/", auth, async (req, res) => {
  let valdiateBody = validateToy(req.body);
  if (valdiateBody.error) {
    return res.status(400).json(valdiateBody.error.details);
  }
  try {
    let toy = new toyModel(req.body);
    toy.user_id = req.tokenData._id;
    await toy.save();
    res.status(201).json(toy);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});

router.put("/:editId", auth, async (req, res) => {
  let validBody = validateToy(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let editId = req.params.editId;
    let data;
    if (req.tokenData.role == "admin") {
      data = await toyModel.updateOne({ _id: editId }, req.body);
    } else {
      data = await toyModel.updateOne(
        { _id: editId, user_id: req.tokenData._id },
        req.body
      );
    }
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err });
  }
});

router.get("/prices", async (req, res) => {
  try {
    let minQ = req.query.min || 0;
    let maxQ = req.query.max || Infinity;
    let perPage = req.query.perPage || 10;
    let data = await toyModel
      .find({ price: { $gte: minQ, $lte: maxQ } })
      .limit(perPage);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "err", err });
  }
});
router.delete("/:delId", auth, async (req, res) => {
  try {
    let delId = req.params.delId;
    let data;
    if (req.tokenData.role == "admin") {
      data = await toyModel.deleteOne({ _id: delId });
    } else {
      data = await toyModel.deleteOne({
        _id: delId,
        user_id: req.tokenData._id,
      });
    }
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "there error try again later", err });
  }
});

module.exports = router;
