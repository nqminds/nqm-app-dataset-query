import React from "react";

import { List, ListItem } from "material-ui/List";
import ResourceIcon from "./resource-icon";
import Infinite from "react-infinite";
import * as _ from "lodash";

class ResourceList extends React.Component {
  constructor(props) {
    super(props);
  }

  _onListSelect(resource) {
    this.props.onSelect(resource);
  }

  render() {
    const styles = {
      list: {
        padding: 4
      },
      listItem: {
      }
    };

    // Render a list item for each resource. Bind the onTouchTap event so that it can propagate the selected resource up the event chain.
    const list = _.map(this.props.resources, (res) => {
      return (
        <ListItem
          innerDivStyle={styles.listItem}
          key={res.id}
          primaryText={res.name}
          onTouchTap={this._onListSelect.bind(this, res)}
          rightIcon={<ResourceIcon resourceType={res.schemaDefinition.basedOn} />}
        />);
    });

    return (
      <List>
        <Infinite containerHeight={300} elementHeight={50}>
          {list}
        </Infinite>
      </List>);
  }
}

ResourceList.propTypes = {
  resources: React.PropTypes.array.isRequired,
  onSelect: React.PropTypes.func.isRequired
};

ResourceList.defaultProps = {
  resources: []
};

export default ResourceList;