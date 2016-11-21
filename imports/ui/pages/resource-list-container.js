import React from "react";
import composeWithTracker from "../../api/komposer/compose-with-tracker";
import ResourceList from "../components/resource-list";
import loadResources from "../../api/manager/load-resources";
import ProgressIndicator from "../components/progress-indicator";
import * as _ from "lodash";

const options={
  loadingHandler: () => (<ProgressIndicator/>),
  propsToWatch: ["filter", "options"],

  shouldSubscribe(currentProps, nextProps) {
    if (_.isEqual(currentProps.filter, nextProps.filter) &&
        _.isEqual(currentProps.options, nextProps.options))
      return false;
    return true;
  },
};

// Use the loadResources composer to populate the "resources" property of the ResourceList component.
export default composeWithTracker(loadResources, options)(ResourceList);