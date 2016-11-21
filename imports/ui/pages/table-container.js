import React from "react";
import composeWithTracker from "../../api/komposer/compose-with-tracker";
import TableContent from "../components/table-content";
import loadResourceData from "../../api/manager/load-resource-tdxapi";
import ProgressIndicator from "../components/progress-indicator";

const options={
  loadingHandler: () => (<ProgressIndicator/>)
};

export default composeWithTracker(loadResourceData, options)(TableContent);