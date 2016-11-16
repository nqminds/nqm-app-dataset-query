"use strict";

import React from "react";
import {Meteor} from "meteor/meteor";
import Snackbar from "material-ui/Snackbar";
import RaisedButton from "material-ui/RaisedButton";
import FontIcon from "material-ui/FontIcon";
import Divider from "material-ui/Divider";
import {List} from 'material-ui/List';
import * as _ from "lodash";
import TDXAPI from "nqm-api-tdx/client-api";

import connectionManager from "../../api/manager/connection-manager";
import ResourceList from "./resource-list-container";

class QueryApp extends React.Component {
  constructor(props) {
    super(props);

    this.tdxApi = new TDXAPI({
      commandHost: Meteor.settings.public.commandHost,
      queryHost: Meteor.settings.public.queryHost,
      accessToken: connectionManager.authToken
    });

    // Bind event handlers to "this"
    this._onFolder = this._onFolder.bind(this);
    this._onResource = this._onResource.bind(this);
    this._onBack = this._onBack.bind(this);
    this.parentList = [];

    this.state = {
      snackBarMessage:"",
      snackBarOpen: false,
      parent:[]
    };
  }

  handleSnackbarClose() {
    this.setState({
      snackBarOpen: false
    });
  };

  _onResource(resource) {
    // A non-folder resource has been clicked on => attempt to show resource contents
    //FlowRouter.go("resource", { id: resource.id });    
  }
  
  _onFolder(folder) {
    // A folder resource has been clicked on => make the folder the new parent.
    //FlowRouter.go("folder", { parent: folder.id });
    this.parentList.push(this.state.parent)
    this.setState({
      parent: folder.id
    });
  }

  _onBack() {
    const parent = this.parentList.pop();
    this.setState({
      parent: parent
    });
  }

  componentWillMount() {
  }

  render() {
    const appBarHeight = Meteor.settings.public.showAppBar !== false ? 50 : 0;
    const leftPanelWidth = 300;
    const styles = {
      root: {
        height: "100%"
      },      
      backButton: {
        minWidth: 40
      },
      mainPanel: {
        position: "absolute",        
        top: appBarHeight,
        bottom: 0,
        left: leftPanelWidth,
        right: 0
      },
      leftPanel: {
        background: "white",
        position: "fixed",
        top: appBarHeight,
        bottom: 0,
        width: leftPanelWidth
      }
    };
    
    // Default parent property to an empty array, which signifies no parent and therefore top-level resources 
    const parentId = this.state.parent || [];

    // Only need a back button if there is a non-null parent.
    const backButton = <RaisedButton
                          style={styles.backButton}
                          disabled={this.parentList.length?false:true}
                          icon={<FontIcon className="material-icons">arrow_back</FontIcon>}
                          onTouchTap={this._onBack}
                          label="Back"
                        />;

    // Filter to retrieve folder resources that are children of the current parent.
    const folderFilter = {parents: parentId, baseType: "resourceGroup"};

    // Filter to retrieve non-folder resources that are children of the current parent.
    const fileFilter = {parents: parentId, baseType: {$ne: "resourceGroup"}};
    const folderComponent = <ResourceList filter={folderFilter} options={{sort: { sortName: 1}}} onSelect={this._onFolder}/>;
    const resourceComponent = <ResourceList filter={fileFilter} options={{sort: { sortName: 1}}} onSelect={this._onResource}/>;
    let listComponent = null;

    console.log(folderComponent);
    console.log(resourceComponent);

    if (folderComponent.key!==null && resourceComponent.key!==null)
      listComponent = <List>{folderComponent}{resourceComponent}</List>;
    else if(folderComponent.key!==null && resourceComponent.key===null)
      listComponent = <List>{folderComponent}</List>;
    else if (folderComponent.key===null && resourceComponent.key!==null)
      listComponent = <List>{resourceComponent}</List>;
    
    return (
      <div style={styles.root}>
      <div style={styles.leftPanel}>
        {backButton}
        {listComponent}
      </div>
      <div style={styles.mainPanel}>
      </div>
        <Snackbar
          open={this.state.snackBarOpen}
          message={this.state.snackBarMessage}
          autoHideDuration={4000}
          onRequestClose={this.handleSnackbarClose.bind(this)}
        />
      </div>
    );
  }
}

QueryApp.propTypes = {
  parent: React.PropTypes.string
};

QueryApp.contextTypes = {
  muiTheme: React.PropTypes.object
};

export default QueryApp;

