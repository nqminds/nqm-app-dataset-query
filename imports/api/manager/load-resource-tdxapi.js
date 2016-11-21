import TDXAPI from "nqm-api-tdx/client-api";
import connectionManager from "./connection-manager";

// Loads data for a given resource id from the TDX.
// filter - an optional query filter to refine the returned data, e.g. {temperature: {$gt: 20}}
// opt - options to tweak the returned data, e.g. { sort: { timestamp: -1 }, limit: 10, fields: {temperature: 1}} will sort by timestamp descending, limit the result to 10 items, and only return the temperature field in each document.
// load - set to true loads the resourse, set to false passes an empty output
function loadResourceData({
    resourceId,
    filter,
    options
}, onData) {
  if (resourceId!==null) {
    const config = {
      commandHost: Meteor.settings.public.commandHost,
      queryHost: Meteor.settings.public.queryHost,
      accessToken: connectionManager.authToken
    };
    const tdxApi = new TDXAPI(config);


    const _filter = filter || "";
    const _options = options || "";

    console.log("loadResourceData tdxApi: ", resourceId, _filter, _options);

    tdxApi.getDatasetData(resourceId, _filter, null, _options, (err, response) => {
      if (err) {
        console.log("Failed to get data: ", err);
        onData(err, {
          data: []
        });
      } else {
        onData(null, {
          data: response.data
        });
      }
    });
  } else {
    onData(null, {
      data: []
    });
  }
}

export default loadResourceData;