import React from "react";
import CircularProgress from "material-ui/CircularProgress";

const ProgressIndicator = () => {
  var styles = {
    root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "90%"
    },
    cell: {
      width: 100,
      position: "relative"
    }
  };
  return (
    <div style={styles.root}>
      <div style={styles.cell}>
        <CircularProgress />
      </div>
    </div>
  );
};

export default ProgressIndicator;