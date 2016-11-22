import React from "react";
import {Table, TableHeader, TableBody, TableRow, TableRowColumn, TableHeaderColumn} from "material-ui/Table";
import * as _ from "lodash";

class TableContent extends React.Component {
  constructor(props) {
    super(props);

    // REVIEW - shouldn't usually store data directly on 'this', but use React properties or the state API, which 
    // will handle re-rendering when data changes - unless you specifically don't want to trigger a re-render 
    // when data changes - but that doesn't appear to be the case here, it looks like you should be using props?
    this.tableData = [];
  }

  componentWillMount() {
    this.tableData = _.clone(this.props.data);
  }

  componentWillReceiveProps(nextprops) {
    this.tableData = _.clone(nextprops.data);
  }

  render() {
    let tableRowList = null;
    let keyList = [];

    if (!_.isEmpty(this.props.keyHeaderList)) {
      _.forEach(this.props.keyHeaderList, (val,key)=>{
        if (val) keyList.push(key);
      });
    }

    if (this.tableData.length) {
      tableRowList = this.tableData.map((row, index)=>{
        let rowObj = _.map(keyList,(val)=>{
          let entry = "";
          if (row[val]!==null && !_.isObject(row[val])) entry = row[val];
          else if (row[val]!==null && _.isObject(row[val]))
            entry = JSON.stringify(row[val]);

          return <TableRowColumn key={val}>{entry}</TableRowColumn>;
        });
        return <TableRow key={index}>{rowObj}</TableRow>;
      });
    }

    let tableHeaderComponent = null;

    if (keyList.length)
      tableHeaderComponent = _.map(keyList,(val)=>{
        return <TableHeaderColumn key={val}>{val}</TableHeaderColumn>;
      });

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {tableHeaderComponent}
                </TableRow>
            </TableHeader>
            <TableBody>
                {tableRowList}
            </TableBody>
        </Table>);
  }
}

TableContent.propTypes = {
  data: React.PropTypes.array.isRequired,
  keyHeaderList: React.PropTypes.object.isRequired
};

export default TableContent;

