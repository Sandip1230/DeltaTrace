// latest reading per station (optionally limited to a list of station ids)
export const latestPipeline = (ids = null) => [
  ...(ids ? [{ $match: { station: { $in: ids } } }] : []),
  { $sort: { timestamp: -1 } },
  { $group: { _id: "$station", doc: { $first: "$$ROOT" } } },
  { $replaceRoot: { newRoot: "$doc" } },
  { $lookup: { from: "stations", localField: "station", foreignField: "_id", as: "station" } },
  { $unwind: "$station" },
];