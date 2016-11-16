import React from "react";

import FontIcon from "material-ui/FontIcon";
import DatasetIcon from "material-ui/svg-icons/image/blur-on";
import FolderIcon from "material-ui/svg-icons/file/folder";
import VisualisationIcon from "material-ui/svg-icons/image/landscape";
import QuestionIcon from "material-ui/svg-icons/action/help-outline";
import FileIcon from "material-ui/svg-icons/file/attachment";
import TaskIcon from "material-ui/svg-icons/action/update";

class ResourceIcon extends React.Component {
  render() {
    var style = {
      float: "left",
      marginTop: -5,
      paddingRight: 5
    };
    var icon;

    // Select an icon based on the resource base type.
    switch(this.props.resourceType[0]) {
      case "dataset":
      icon = <DatasetIcon color={this.props.color} style={style} />;
      break;
      case "resourceGroup":
      icon = <FolderIcon  color={this.props.color} style={style} />;
      break;
      case "visualisation":
      icon = <VisualisationIcon color={this.props.color} style={style} />;
      break;
      case "rawFile":
      icon = <FileIcon color={this.props.color} style={style} />;
      break
      case "task":
      icon = <TaskIcon  color={this.props.color} style={style} />;
      break;
      default:
      icon = <QuestionIcon color={this.props.color} style={style} />;
      break;
    }

    return icon;
  }
}

ResourceIcon.propTypes = {
  resourceType: React.PropTypes.array.isRequired,
  color: React.PropTypes.string
};

ResourceIcon.defaultProps = {
  color: "#999" 
};

export default ResourceIcon;