import React from "react";
import {Table, TableHeader, TableBody, TableRow, TableRowColumn, TableHeaderColumn} from "material-ui/Table";
import * as _ from "lodash";

class TableContent extends React.Component {
  constructor(props) {
    super(props);
    this.tableData = [];
  }

  componentWillMount() {
    if (this.props.data.length)
      this.tableData = this.props.data;
  }

  componentWillReceiveProps(nextprops) {
    if (nextprops.data.length)
      this.tableData = nextprops.data;   
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

