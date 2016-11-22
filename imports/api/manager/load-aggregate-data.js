import connectionManager from "./connection-manager";

/*
 * REVIEW - the meteorhacks:aggregate package is not reactive and using it doesn't provide any benefits
 * over the nqm-api-tdx methods getAggregateData (https://github.com/nqminds/nqm-api-tdx/blob/master/lib/aggregate.js#L13)
 * and, if you're using it for counting, getDatasetDataCount (https://github.com/nqminds/nqm-api-tdx/blob/master/lib/query.js#L81).
 * In fact, I suspect the nqm-api-tdx versions (i.e. over HTTP) will be quicker and more efficient that the DDP
 * meteorhacks implementation. 
 */


// Loads data for a given resource id from the TDX.
// pipeline - A sequence of data aggregation operations or stages.,
//              e.g. [{ $match: { status: "A" } },
//                    { $group: { _id: "$cust_id", total: { $sum: "$amount" } } },
//                    { $sort: { total: -1 } }]
// options - The options document can contain the following fields and values: explain, allowDiskUse, ...
function loadAggregateData({resourceId, pipeline, options}, onData) {
  console.log("loadAggregateData: ", resourceId, pipeline, options);
  
  // Subscribe to the datasetData publication using the given pipeline and options.
  // The subscription will automatically re-run if any of the parameters change (i.e. resourceId, pipeline or options).
  const sub = connectionManager.subscribe("datasetData",resourceId, pipeline, options, {
    onError(err) {
      console.log("error subscribing to datasetData: " + err.message);
    }}
  );

  if (sub.ready()) {
    // The subscription is ready
    pipeline = pipeline || {};
    // Add pipeline for dataset data (all datasetData subscriptions are stored in the same collection).
    pipeline._d = resourceId;
    // Fetch the data from the local cache.
    const datasetData = connectionManager.datasetDataCollection.aggregate(pipeline,options).fetch();
    // Pass the data on to the component via the data property.
    onData(null, {data: datasetData});
  }
}

export default loadAggregateData;