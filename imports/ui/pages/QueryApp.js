"use strict";

import React from "react";
import {Meteor} from "meteor/meteor";
import Snackbar from "material-ui/Snackbar";
import RaisedButton from "material-ui/RaisedButton";
import FontIcon from "material-ui/FontIcon";
import {List} from "material-ui/List";
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from "material-ui/Table";
import Drawer from "material-ui/Drawer";
import Chip from "material-ui/Chip";
import Avatar from "material-ui/Avatar";
import * as _ from "lodash";
import TDXAPI from "nqm-api-tdx/client-api";

import connectionManager from "../../api/manager/connection-manager";
import ResourceList from "./resource-list-container";
import ResourceIcon from "../components/resource-icon"

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
      parent:[],
      schemaDefinition:{},
      datasetName:null,
      datasetID:null,
      drawerOpen: false
    };
  }

  handleSnackbarClose() {
    this.setState({
      snackBarOpen: false
    });
  };

  handleNameChipTap() {
    this.setState({
      drawerOpen: true
    });
  }

  handleDrawerChange(open) {
   this.setState({
      drawerOpen: open
    });
  }
  
  _onResource(resource) {
    this.setState({
      datasetName: resource.name,
      datasetID: resource.id,
      schemaDefinition: resource.schemaDefinition  
    });

  }
  
  _onFolder(folder) {
    // A folder resource has been clicked on => make the folder the new parent.
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
      },
      chip: {
        margin: 4,
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
    const folderComponent = <ResourceList filter={folderFilter} options={{sort: { sortName: 1}}} onSelect={this._onFolder} type={true}/>;
    const resourceComponent = <ResourceList filter={fileFilter} options={{sort: { sortName: 1}}} onSelect={this._onResource} type={false}/>;
    let nameChipComponent = null;
    
    if (this.state.datasetName!==null) {
      nameChipComponent = 
        <Chip style={styles.chip} onTouchTap={this.handleNameChipTap.bind(this)}>
          <Avatar icon={<ResourceIcon resourceType={["dataset"]}/>} />
          {this.state.datasetName}
        </Chip>
    }

    return (
      <div style={styles.root}>
      <div style={styles.leftPanel}>
        {backButton}
          {folderComponent}
          {resourceComponent}

      </div>
      <div style={styles.mainPanel}>
        {nameChipComponent}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderColumn>ID</TableHeaderColumn>
              <TableHeaderColumn>Name</TableHeaderColumn>
              <TableHeaderColumn>Status</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableRowColumn>1</TableRowColumn>
              <TableRowColumn>John Smith</TableRowColumn>
              <TableRowColumn>Employed</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>2</TableRowColumn>
              <TableRowColumn>Randal White</TableRowColumn>
              <TableRowColumn>Unemployed</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>3</TableRowColumn>
              <TableRowColumn>Stephanie Sanders</TableRowColumn>
              <TableRowColumn>Employed</TableRowColumn>
            </TableRow>
            <TableRow>
              <TableRowColumn>4</TableRowColumn>
              <TableRowColumn>Steve Brown</TableRowColumn>
              <TableRowColumn>Employed</TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
      </div>
        <Snackbar
          open={this.state.snackBarOpen}
          message={this.state.snackBarMessage}
          autoHideDuration={4000}
          onRequestClose={this.handleSnackbarClose.bind(this)}
        />
        <Drawer docked={false} open={this.state.drawerOpen} openSecondary={true} onRequestChange={this.handleDrawerChange.bind(this)}>
        </Drawer>
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

