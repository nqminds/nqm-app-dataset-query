import {composeWithTracker} from "react-komposer";
import ResourceList from "../components/resource-list";
import loadResources from "../../api/manager/load-resources";

// Use the loadResources composer to populate the "resources" property of the ResourceList component.
export default composeWithTracker(loadResources)(ResourceList);