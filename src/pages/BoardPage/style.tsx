export const styles = {
    boardStyle: {
      display: "flex",
      gap: "16px",
      padding: "16px",
      overflowX: "auto",
      backgroundColor: "#f0f0f0",
    },
    containerStyle: {
      display: "flex",
      gap: "16px",
      // padding: "16px",
      // overflowX: "auto",
      // maxHeight: '100vh',  
      // backgroundColor: "#f0f0f0",
    },
    columnStyle: {
      display: "flex",
      flexDirection: "column",
      backgroundColor: "white",
      borderRadius: 4,
      paddingLeft: 16,
      paddingRight: 16,
      minWidth: 300,
      maxWidth: 300,
      maxHeight: '100vh',
      overflowX: "auto",
      overscrollBehaviorY: "none"
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
    itemStyle: {
      padding: "8px",
      backgroundColor: "white",
      // borderRadius: "4px",
      cursor: "grab",
      // minHeight: "80px",
      // maxHeight: "100px",
      // overflow: "hidden",
    },
    itemWithPriorityStyle: {
      padding: "2px 8px 8px 8px",
      backgroundColor: "white",
      // borderRadius: "4px",
      cursor: "grab",
    }
  }
  