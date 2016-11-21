import composeWithTracker from "../../api/komposer/compose-with-tracker";
import checkAuthenticated from "../../api/manager/authenticated";
import Layout from "./layout";

const options={};

// Use the checkAuthenticated composer to populate the "authenticated" property of the Layout component.
export default composeWithTracker(checkAuthenticated, options)(Layout);
