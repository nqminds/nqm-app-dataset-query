import React from "react";
import composeWithTracker from "../../api/komposer/compose-with-tracker";
import TableContent from "../components/table-content";
import loadResourceData from "../../api/manager/load-resource-tdxapi";
import ProgressIndicator from "../components/progress-indicator";
import * as _ from "lodash";

const options={
  loadingHandler: () => (<ProgressIndicator/>),
  propsToWatch: ["resourceId", "filter", "options"],

  shouldSubscribe(currentProps, nextProps) {
    if (_.isEqual(currentProps,nextProps))
      return false;
    return true;
  },
};

export default composeWithTracker(loadResourceData, options)(TableContent);