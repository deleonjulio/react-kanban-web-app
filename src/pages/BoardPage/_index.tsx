import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Paper, Text } from "@mantine/core";

export const Board = () => {
  const [columns, setColumns] = useState({
    column1: {
      name: "To Do",
      items: [
      ],
    },
    column2: {
      name: "In Progress",
      items: [
      ],
    },
    column3: {
      name: "For Testing",
      items: [
        { id: "1", content: "Task 1" },
        { id: "2", content: "Task 2" },
        { id: "3", content: "Task 3" },
        { id: "4", content: "Task 4" },
        { id: "5", content: "Task 5" },
        { id: "6", content: "Task 6" },
      ],
    },
    column4: {
        name: "For Deployment",
        items: [
          { id: "7", content: "Task 7" },
          { id: "8", content: "Task 8" },
        ],
      },
    column5: {
    name: "Deployed",
    items: [
        { id: "9", content: "Task 9" },
        { id: "10", content: "Task 10" },
    ],
    },
  });

  const onDragEnd = (result) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (type === "COLUMN") {
      // Handle column drag
      const columnOrder = Object.entries(columns);
      const [movedColumn] = columnOrder.splice(source.index, 1);
      columnOrder.splice(destination.index, 0, movedColumn);

      const reorderedColumns = Object.fromEntries(columnOrder);
      setColumns(reorderedColumns);
    } else {
      // Handle item drag
      const sourceColumn = columns[source.droppableId];
      const destinationColumn = columns[destination.droppableId];

      const sourceItems = [...sourceColumn.items];
      const destinationItems = [...destinationColumn.items];

      const [movedItem] = sourceItems.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        // Same column
        sourceItems.splice(destination.index, 0, movedItem);
        setColumns({
          ...columns,
          [source.droppableId]: {
            ...sourceColumn,
            items: sourceItems,
          },
        });
      } else {
        // Different columns
        destinationItems.splice(destination.index, 0, movedItem);
        setColumns({
          ...columns,
          [source.droppableId]: {
            ...sourceColumn,
            items: sourceItems,
          },
          [destination.droppableId]: {
            ...destinationColumn,
            items: destinationItems,
          },
        });
      }
    }
  };

  const containerStyle = {
    display: "flex",
    gap: "16px",
    padding: "16px",
    overflowX: "auto",
    maxHeight: '100vh',
    backgroundColor: "#f0f0f0",
  };

  const columnStyle = {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    borderRadius: 4,
    paddingLeft: 16,
    paddingRight: 16,
    minWidth: 300,
    maxHeight: '100vh',
    overflowX: "auto",
    overscrollBehaviorY: "none"
  };

  const columnHeaderStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    paddingBottom: 4,
    cursor: "grab",
    position: "sticky", // Makes the header sticky
    top: 0, // Sticks to the top of the column
    backgroundColor: "white",
    zIndex: 1, // Ensures it appears above the list items
    // padding: "8px",
    paddingTop: 8,
  };
  
  const itemListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minHeight: "100vh",
    backgroundColor: "white",
    padding: "8px",
  };

  const itemStyle = {
    padding: "8px",
    backgroundColor: "white",
    borderRadius: "4px",
    cursor: "grab",
  };

  return (
    <div style={containerStyle}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={containerStyle}
            >
              {Object.entries(columns).map(([columnId, column], index) => (
                <Draggable key={columnId} draggableId={columnId} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{ ...columnStyle, ...provided.draggableProps.style }}
                    >
                      <div
                        {...provided.dragHandleProps}
                        style={columnHeaderStyle}
                      >
                        {column.name}
                      </div>
                      <Droppable droppableId={columnId} type="ITEM">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={itemListStyle}
                          >
                            {column.items.map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                              >
                                {(provided) => (
                                    <Paper
                                         shadow="sm" radius="md" withBorder
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                        ...itemStyle,
                                        ...provided.draggableProps.style,
                                        }}
                                    >
                                    {item.content}
                                        <Text size="sm">
                                            With Fjord Tours you can explore more of the magical fjord landscapes with tours and
                                            activities on and around the fjords of Norway
                                        </Text>
                                    </Paper>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
