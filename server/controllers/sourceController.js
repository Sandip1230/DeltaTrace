import Source from "../models/Source.js";

export const getSources = async (req, res) => {
  res.json(await Source.find().lean());
};