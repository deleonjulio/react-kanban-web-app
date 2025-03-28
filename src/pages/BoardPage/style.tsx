export const styles = {
  boardStyle: {
    display: "flex",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#f0f0f0",
    // overflowX: "auto" // needs to be removed because of https://github.com/atlassian/react-beautiful-dnd/issues/131
  },
  containerStyle: {
    display: "flex",
    gap: "16px",
  },
  columnStyle: {
    backgroundColor: "white",
    borderRadius: 4,
    paddingLeft: 16,
    paddingRight: 16,
    minWidth: 300,
    maxWidth: 300,
    maxHeight: "80vh", // Limits height but allows content to expand
    overflowY: "auto", // Only scrolls when content exceeds max height
    overscrollBehaviorY: "none",
  },  
  columnHeaderStyle: {
    fontSize: "18px",
    fontWeight: "bold",
    paddingBottom: 4,
    cursor: "grab",
    position: "sticky", // Makes the header sticky
    top: 0, // Sticks to the top of the column
    backgroundColor: "white",
    zIndex: 1, // Ensures it appears above the list items
    paddingTop: 8,
  },
  itemListStyle:{
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minHeight: "100vh",
    backgroundColor: "white",
  },
  // itemStyle: {
  //   padding: "8px",
  //   backgroundColor: "white",
  //   cursor: "grab",
  // },
}
