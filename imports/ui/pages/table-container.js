import {composeWithTracker} from "react-komposer";
import TableContent from "../components/table-content";
import loadResourceData from "../../api/manager/load-resource-tdxapi";

export default composeWithTracker(loadResourceData)(TableContent);