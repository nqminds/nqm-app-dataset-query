import {composeWithTracker} from "react-komposer";
import checkAuthenticated from "../../api/manager/authenticated";
import Layout from "./layout";

// Use the checkAuthenticated composer to populate the "authenticated" property of the Layout component.
export default composeWithTracker(checkAuthenticated)(Layout);
