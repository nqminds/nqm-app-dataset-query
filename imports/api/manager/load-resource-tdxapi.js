import TDXAPI from "nqm-api-tdx/client-api";
import connectionManager from "./connection-manager";

// Loads data for a given resource id from the TDX.
// filter - an optional query filter to refine the returned data, e.g. {temperature: {$gt: 20}}
// options - options to tweak the returned data, e.g. { sort: { timestamp: -1 }, limit: 10, fields: {temperature: 1}} will sort by timestamp descending, limit the result to 10 items, and only return the temperature field in each document.
// pipeline - string for aggregate query
// type - set to "Query" or "Aggregate"
function loadResourceData({
    resourceId,
    filter,
    options,
    pipeline,
    type
}, onData) {
  if (resourceId!==null) {
    const config = {
      commandHost: Meteor.settings.public.commandHost,
      queryHost: Meteor.settings.public.queryHost,
      accessToken: connectionManager.authToken
    };

    const tdxApi = new TDXAPI(config);

    // REVIEW - by convention, using underscores to prefix a variable implies the variable is static or private scope, 
    // i.e. don't use it for local variables.
    filter = filter || "";
    options = options || "";
    pipeline = pipeline || "";
    type = type || "";

    console.log("loadResourceData tdxApi: ", resourceId, filter, options, pipeline);

    if (type==="Query") {
      tdxApi.getDatasetData(resourceId, filter, null, options, (err, response) => {
        if (err) {
          console.log("Failed to get query data: ", err);
          onData(err, {
            data: []
          });
        } else {
          onData(null, {
            data: response.data
          });
        }
      });
    } else if (type==="Aggregate") {
      tdxApi.getAggregateData(resourceId, pipeline, options, (err, response) => {
        if (err) {
          console.log("Failed to get aggregate data: ", err);
          onData(err, {
            data: []
          });
        } else {
          onData(null, {
            data: response.data
          });
        }        
      });
    }
  } else {
    onData(null, {
      data: []
    });
  }
}

export default loadResourceData;