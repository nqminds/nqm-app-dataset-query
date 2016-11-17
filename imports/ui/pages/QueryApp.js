"use strict";

import React from "react";
import {Meteor} from "meteor/meteor";
import Snackbar from "material-ui/Snackbar";
import RaisedButton from "material-ui/RaisedButton";
import FontIcon from "material-ui/FontIcon";
import {List} from "material-ui/List";
import {Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn}
  from "material-ui/Table";
import TextField from "material-ui/TextField";
import SelectField from "material-ui/SelectField";
import MenuItem from 'material-ui/MenuItem';
import Drawer from "material-ui/Drawer";
import Chip from "material-ui/Chip";
import Avatar from "material-ui/Avatar";
import Checkbox from 'material-ui/Checkbox';
import {blue300, indigo900} from "material-ui/styles/colors";
import * as _ from "lodash";
import TDXAPI from "nqm-api-tdx/client-api";

import connectionManager from "../../api/manager/connection-manager";
import ResourceList from "./resource-list-container";
import ResourceIcon from "../components/resource-icon"

const itemsPageData = {1:10, 2:50, 3:100, 4:1000};

class QueryApp extends React.Component {
  constructor(props) {
    super(props);

    this.tdxApi = new TDXAPI({
      commandHost: Meteor.settings.public.commandHost,
      queryHost: Meteor.settings.public.queryHost,
      accessToken: connectionManager.authToken
    });

    // Bind event handlers to "this"
    this.handleDrawerChecks = this.handleDrawerChecks.bind(this);
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
      drawerOpen: false,
      keyHeaderList:{},
      totalCount: null,
      itemsPage: 1
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

  handleNextChipTap() {

  }

  handlePrevChipTap() {

  }

  handleDrawerChange(open) {
   this.setState({
      drawerOpen: open
    });
  }
  
  handleDrawerChecks(key, isInputChecked) {
    let keyHeaderList = _.clone(this.state.keyHeaderList);
    let result = false;

    keyHeaderList[key] = isInputChecked;

    _.forEach(keyHeaderList,(val,key)=>{
      result = result || val;
    });

    if (result)
      this.setState({keyHeaderList: keyHeaderList});
  }

  handleItemsPageChange(event, index, value) {
    this.setState({
      itemsPage: value
    });
  }

  _onResource(resource) {
    let keyHeaderList = {};
    
    _.forEach(resource.schemaDefinition.dataSchema, (val,key)=>{
        keyHeaderList[key]=true;
    });

    const queryCount = '[{"$group":{"_id":null, "count":{"$sum":1}}}]';
    this.tdxApi.getAggregateData(resource.id, queryCount, null,  (err, data)=>{
      if(err){
        console.log(err);
      } else {
        if(data.data.length) {
          this.setState({
            datasetName: resource.name,
            datasetID: resource.id,
            schemaDefinition: resource.schemaDefinition,
            keyHeaderList: keyHeaderList,
            totalCount: data.data[0].count
          });
        } else {
          this.setState({
            snackBarMessage:"Dataset "+resource.name+" has no schema!",
            snackBarOpen: true
          });
        }
      }
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
      },
      wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
      },
      checkbox: {
        marginBottom: 16,
      },
      button: {
        margin: 12
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
    const checkBoxList = _.map(this.state.keyHeaderList, (val,key)=>{
      return <Checkbox
                onCheck={(event, isInputChecked)=>{this.handleDrawerChecks(key, isInputChecked)}}
                key={key}
                label={key}
                checked={val}
                style={styles.checkbox}
              />;
    });

    let listMenuItems = _.map(itemsPageData, (val,key)=>{
      return <MenuItem value={key} primaryText={val} key={key}/>;
    });

    let tableHeaderComponent = null;
    
    if(!_.isEmpty(this.state.keyHeaderList)) {
      tableHeaderComponent = [];
      _.forEach(this.state.keyHeaderList,(val,key)=>{
        if (val) {
          tableHeaderComponent.push((<TableHeaderColumn key={key}>{key}</TableHeaderColumn>));
        }
      });
    }

    let nameChipComponent = null;
    
    if (this.state.datasetID!==null) {
      nameChipComponent = 
        <Chip
          backgroundColor={blue300}
          style={styles.chip}
          onTouchTap={this.handleNameChipTap.bind(this)}
        >
          {this.state.datasetName}
        </Chip>
    }

    let totalCountChipComponent = null,
      nextChipComponent = null,
      prevChipComponent = null;
    if (this.state.totalCount!==null) {
      totalCountChipComponent = 
        <Chip style={styles.chip}>
          {this.state.totalCount}
        </Chip>;
      if (this.state.totalCount>itemsPageData[this.state.itemsPage]){
        nextChipComponent = 
          <Chip
            backgroundColor={blue300}
            style={styles.chip}
            onTouchTap={this.handleNextChipTap.bind(this)}
          >
            Next Page
          </Chip>;
        prevChipComponent = 
          <Chip
            backgroundColor={blue300}
            style={styles.chip}
            onTouchTap={this.handlePrevChipTap.bind(this)}
          >
            Prev Page
          </Chip>;
      }
    }
    let self = this;

    return (
      <div style={styles.root}>
      <div style={styles.leftPanel}>
        {backButton}
        {folderComponent}
        {resourceComponent}
        <TextField
          type='text'
          hintText="Filter"
          floatingLabelText="Filter"
          multiLine={true}
          rows={1}
        />
        <TextField
          type='text'
          hintText="Options"
          floatingLabelText="Options"
          multiLine={true}
          rows={1}
        />
        <TextField
          type='text'
          hintText="Pipeline"
          floatingLabelText="Pipeline"
          multiLine={true}
          rows={1}
        />
        <RaisedButton label="Query" primary={true} style={styles.button} />
        <RaisedButton label="Aggregate" secondary={true} style={styles.button} />
      </div>
      <div style={styles.mainPanel}>
        <div style={styles.wrapper}>
          {nameChipComponent}
          {totalCountChipComponent}
          {prevChipComponent}
          {nextChipComponent}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {tableHeaderComponent}
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
            {checkBoxList}
            <SelectField
              floatingLabelText="Items per page"
              value={self.state.itemsPage}
              onChange={this.handleItemsPageChange.bind(this)}
            >
              {listMenuItems}
            </SelectField>
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

