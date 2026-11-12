import Source from "../models/Source.js";
import { scopeFilter } from "../utils/scope.js";

export const getSources = async (req, res) => {
  res.json(await Source.find(scopeFilter(req.query)).lean());
};