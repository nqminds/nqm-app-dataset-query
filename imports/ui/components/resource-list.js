import React from "react";

import {ListItem} from 'material-ui/List';
import ResourceIcon from "./resource-icon";

class ResourceList extends React.Component {
  _onListSelect(resource) {
    // Fire the onSelect property handler.
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
      return <ListItem innerDivStyle={styles.listItem} key={res.id} primaryText={res.name} onTouchTap={this._onListSelect.bind(this,res)} rightIcon={<ResourceIcon resourceType={res.schemaDefinition.basedOn} />} />
    });
    
    return ({list});
  }
}

ResourceList.propTypes = {
  resources: React.PropTypes.array.isRequired,
  onSelect: React.PropTypes.func.isRequired
};

export default ResourceList;