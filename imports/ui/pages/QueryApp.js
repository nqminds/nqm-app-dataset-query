"use strict";

import React from "react";
import { Meteor } from "meteor/meteor";
import Snackbar from "material-ui/Snackbar";
import RaisedButton from "material-ui/RaisedButton";
import FontIcon from "material-ui/FontIcon";
import TextField from "material-ui/TextField";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import Drawer from "material-ui/Drawer";
import Chip from "material-ui/Chip";
import Checkbox from "material-ui/Checkbox";
import { blue300 } from "material-ui/styles/colors";
import * as _ from "lodash";
import TDXAPI from "nqm-api-tdx/client-api";

import connectionManager from "../../api/manager/connection-manager";
import ResourceList from "./resource-list-container";
import TableContainer from "./table-container";

const itemsPageData = { 1: 10, 2: 50, 3: 100, 4: 1000 };
const searchTypes = {aggregate:"Aggregate", query:"Query"};

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
    this.onResource = this.onResource.bind(this);
    this.onBack = this.onBack.bind(this);
    this.onQueryHandle = this.onQueryHandle.bind(this);
    this.onAggregateHandle = this.onAggregateHandle.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.handlePipelineChange = this.handlePipelineChange.bind(this);
    this.handleClickResource = this.handleClickResource.bind(this);
    this.parentList = [];
    
    this.state = {
      snackBarMessage: "",
      snackBarOpen: false,
      parent: [],
      schemaDefinition: {},
      datasetName: null,
      datasetID: null,
      drawerOpen: false,
      keyHeaderList: {},
      totalCount: null,
      itemsPage: 1,
      datasetOptionsText: "{}",
      datasetFilterText: "{}",
      datasetPipelineText: "[]",
      datasetOptions: {},
      datasetFilter: {},
      datasetPipeline: [],
      currentPage: 0,
      commandButtonState: true,
      queryCount: null,
      searchType: searchTypes.query
    };
  }

  handleSnackbarClose() {
    this.setState({
      snackBarOpen: false
    });
  }

  handleNameChipTap() {
    this.setState({
      drawerOpen: true
    });
  }

  handleNextChipTap() {
    let totalPages = _.ceil(this.state.queryCount/itemsPageData[this.state.itemsPage]);
    let currentPage = this.state.currentPage;

    if (totalPages && currentPage<totalPages)
      this.setState({
        currentPage: currentPage+1
      });
  }

  handlePrevChipTap() {
    let totalPages = _.ceil(this.state.queryCount/itemsPageData[this.state.itemsPage]);
    let currentPage = this.state.currentPage;

    if (totalPages && currentPage>1)
      this.setState({
        currentPage: currentPage-1
      });
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

    _.forEach(keyHeaderList, (val, key) => {
      result = result || val;
    });

    if (result)
      this.setState({
        keyHeaderList: keyHeaderList
      });
  }

  handleItemsPageChange(event, index, value) {
    let currentPage = this.state.currentPage;
    if (currentPage) currentPage = 1;
    this.setState({
      itemsPage: value,
      currentPage: currentPage
    });
  }

  handleClickResource(resource) {
    if (resource.baseType==="resourceGroup") {
      // A folder resource has been clicked on => make the folder the new parent.
      this.parentList.push(this.state.parent);
      this.setState({
        parent: resource.id
      });
    } else if (resource.baseType==="dataset") {
      this.onResource(resource);      
    }
  }

  onResource(resource) {
    let keyHeaderList = {};

    _.forEach(resource.schemaDefinition.dataSchema, (val, key) => {
      keyHeaderList[key] = true;
    });

    const queryCount = "[{\"$group\":{\"_id\":null, \"count\":{\"$sum\":1}}}]";
    this.tdxApi.getAggregateData(resource.id, queryCount, null, (err, data) => {
      if (err) {
        this.setState({
          snackBarMessage: "Can't load dataset " + resource.name ,
          snackBarOpen: true
        });
      } else {
        if (data.data.length) {
          this.setState({
            datasetName: resource.name,
            datasetID: resource.id,
            schemaDefinition: resource.schemaDefinition,
            keyHeaderList: keyHeaderList,
            totalCount: data.data[0].count,
            currentPage: 1,
            commandButtonState: false,
            queryCount: data.data[0].count,
            searchType: searchTypes.query
          });
        } else {
          this.setState({
            snackBarMessage: "Dataset " + resource.name + " has no schema!",
            snackBarOpen: true
          });
        }
      }
    });
  }

  onBack() {
    const parent = this.parentList.pop();
    this.setState({
      parent: parent
    });
  }

  onQueryHandle() {
    try {
      const datasetFilter = JSON.parse(this.state.datasetFilterText);
      const datasetOptions = JSON.parse(this.state.datasetOptionsText);
      const queryCount = "[{\"$match\":" + this.state.datasetFilterText + "}," +
        "{\"$group\":{\"_id\":null, \"count\":{\"$sum\":1}}}]";
      //{"SiteCode":{"$eq":"BG1"}}

      this.tdxApi.getAggregateData(this.state.datasetID, queryCount, null, (err, data) => {
        if (err) {
          this.setState({
            snackBarMessage: "Can't get query count for " + this.state.datasetName ,
            snackBarOpen: true,
            datasetFilterText: JSON.stringify(datasetFilter, null, "\t"),
            datasetOptionsText: JSON.stringify(datasetOptions, null, "\t")
          });
        } else {
          this.setState({
            queryCount: data.data[0].count,
            currentPage: 1,
            datasetFilterText: JSON.stringify(datasetFilter, null, "\t"),
            datasetOptionsText: JSON.stringify(datasetOptions, null, "\t"),
            datasetFilter: datasetFilter,
            datasetOptions: datasetOptions,
            searchType: searchTypes.query
          });
        }
      });
    } catch(e) {
      const filter = this.state.datasetFilterText===""?"{}":this.state.datasetFilterText;
      const options = this.state.datasetOptionsText===""?"{}":this.state.datasetOptionsText;
      this.setState({
        snackBarMessage: e.toString(),
        snackBarOpen: true,
        datasetFilterText: filter,
        datasetOptionsText: options
      });
    }
  }

  onAggregateHandle() {
    this.setState({
      searchType: searchTypes.aggregate
    });
    
  }

  handleFilterChange(event) {
    this.setState({
      datasetFilterText: event.target.value
    });
  }

  handleOptionsChange(event) {
    this.setState({
      datasetOptionsText: event.target.value
    });
  }

  handlePipelineChange(event) {
    this.setState({
      datasetPipelineText: event.target.value
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
        display: "flex",
        flexWrap: "wrap",
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
      disabled={this.parentList.length ? false : true}
      icon={<FontIcon className="material-icons">arrow_back</FontIcon>}
      onTouchTap={this.onBack}
      label="Back"
      />;

    const resourceComponent = <ResourceList
      filter={{ parents: parentId}}
      options={{ sort: { sortName: 1 } }}
      onSelect={this.handleClickResource}
      />;

    const checkBoxList = _.map(this.state.keyHeaderList, (val, key) => {
      return ( 
        <Checkbox
          onCheck={(event, isInputChecked) => { this.handleDrawerChecks(key, isInputChecked); } }
          key={key}
          label={key}
          checked={val}
          style={styles.checkbox}
        />);
    });

    let listMenuItems = _.map(itemsPageData, (val, key) => {
      return <MenuItem value={key} primaryText={val} key={key}/>;
    });

    let nameChipComponent = null;

    if (this.state.datasetID !== null) {
      nameChipComponent =
        <Chip
          backgroundColor={blue300}
          style={styles.chip}
          onTouchTap={this.handleNameChipTap.bind(this)}
          >
          {this.state.datasetName}
        </Chip>;
    }

    let totalCountChipComponent = null,
      nextChipComponent = null,
      prevChipComponent = null,
      pageComponent = null,
      queryCountComponent = null;

    if (this.state.totalCount !== null) {
      totalCountChipComponent =
        <Chip style={styles.chip}>
          Total: {this.state.totalCount}
        </Chip>;
    }

    if (this.state.queryCount !== null) {
      queryCountComponent =
        <Chip style={styles.chip}>
          {this.state.searchType}: {this.state.queryCount}
        </Chip>;
    }

    if (this.state.queryCount > itemsPageData[this.state.itemsPage]) {
      let totalPages = _.ceil(this.state.queryCount/itemsPageData[this.state.itemsPage]);

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
      pageComponent = 
          <Chip style={styles.chip}>
            {this.state.currentPage}/{totalPages}
          </Chip>;
    }

    const datasetFilter = _.clone(this.state.datasetFilter); 
    let datasetOptions = _.clone(this.state.datasetOptions);

    datasetOptions["limit"] = itemsPageData[this.state.itemsPage];
    if (this.state.currentPage>1)
      datasetOptions["skip"] = itemsPageData[this.state.itemsPage]*(this.state.currentPage-1); 
    
    return (
      <div style={styles.root}>
        <div style={styles.leftPanel}>
          {backButton}
          {resourceComponent}
          <TextField
            hintText="Filter"
            floatingLabelText="Filter"
            value={this.state.datasetFilterText}
            multiLine={true} rows={1} rowsMax={4}
            onChange={this.handleFilterChange}
          />
          <TextField
            hintText="Options"
            floatingLabelText="Options"
            value={this.state.datasetOptionsText}
            multiLine={true} rows={1} rowsMax={4}
            onChange={this.handleOptionsChange}
          />
          <TextField
            hintText="Pipeline"
            floatingLabelText="Pipeline"
            value={this.state.datasetPipelineText}
            multiLine={true} rows={1} rowsMax={4}
            onChange={this.handlePipelineChange}
          />
          <RaisedButton
            label="Query"
            primary={true}
            style={styles.button}
            onTouchTap={this.onQueryHandle}
            disabled={this.state.commandButtonState}
          />
          <RaisedButton
            label="Aggregate"
            secondary={true}
            style={styles.button}
            onTouchTap={this.onAggregateHandle}
            disabled={this.state.commandButtonState}
          />
        </div>
        <div style={styles.mainPanel}>
          <div style={styles.wrapper}>
            {nameChipComponent}
            {totalCountChipComponent}
            {queryCountComponent}
            {prevChipComponent}
            {pageComponent}            
            {nextChipComponent}
          </div>
          <TableContainer
            keyHeaderList={this.state.keyHeaderList}
            resourceId={this.state.datasetID}
            filter={datasetFilter}
            options={datasetOptions}
            type={this.state.searchType}
          />
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
            value={this.state.itemsPage}
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

