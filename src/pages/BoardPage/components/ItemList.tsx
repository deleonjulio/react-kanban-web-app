import { memo, useRef, useLayoutEffect, useEffect } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { areEqual, VariableSizeList } from "react-window";
import { Paper, Text, Avatar } from "@mantine/core";
import { PriorityBadge } from "./PriorityBadge";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";

const CURRENT_DATE = dayjs();

function calculateHeight(text, width = 300, fontSize = 13) {
  if (text.length === 0) return 0;

  const lineHeight = fontSize * 1.55;

  // Count uppercase, lowercase, and other characters
  let upperCount = 0;
  let lowerCount = 0;
  for (const char of text) {
    if (char >= 'A' && char <= 'Z') upperCount++;
    else if (char >= 'a' && char <= 'z') lowerCount++;
  }
  const otherCount = text.length - upperCount - lowerCount;

  // Character width assumptions
  const upperWidth = 0.65 * fontSize;
  const lowerWidth = 0.52 * fontSize;
  const otherWidth = 0.5 * fontSize;

  // Total width of the text in pixels
  const totalPixelWidth =
    upperCount * upperWidth +
    lowerCount * lowerWidth +
    otherCount * otherWidth;

  // Estimate number of lines
  const totalLines = Math.ceil(totalPixelWidth / width);

  return totalLines * lineHeight;
}

function getStyle({ draggableStyle, virtualStyle, isDragging }) {
  // If you don't want any spacing between your items
  // then you could just return this.
  // I do a little bit of magic to have some nice visual space
  // between the row items
  const combined = {
    ...virtualStyle,
    ...draggableStyle,
  };

  // Being lazy: this is defined in our css file
  const grid = 8;

  // when dragging we want to use the draggable style for placement, otherwise use the virtual style
  const result = {
    ...combined,
    height: isDragging ? combined.height : combined.height - grid,
    left: isDragging ? combined.left : combined.left + grid,
    width: isDragging
      ? draggableStyle.width
      : `calc(${combined.width} - ${grid * 2}px)`,
    marginBottom: grid,
    wordWrap: "break-word"
  };

  return result;
}

export const Item = ({ provided, item, style, isDragging }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Paper
      withBorder
      // bd="0.5px gray solid"
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
      style={{...getStyle({
        draggableStyle: provided.draggableProps.style,
        virtualStyle: style,
        isDragging
      })}}
      className={`item ${isDragging ? "is-dragging" : ""}`}
      onClick={() => {
        searchParams.set("selectedCard", item.card_key);
        setSearchParams(searchParams)
      }}
    >
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <Text fw={900} size="xs" c="gray.7">{item?.card_key}</Text>
          <div style={{display:"flex", justifyContent:"flex-end", alignItems: "center", gap: 4}}>    
            {item?.priority && <PriorityBadge priority={item?.priority} size="xs" />}
            <Avatar size="sm" name="JULIO DE LEON" color="initials" />   
          </div>
      </div>
      <div style={{display:"flex", alignItems: "center"}}>       
        {item.due_date && <Text fw={500} size="xs" c={CURRENT_DATE >= dayjs(item.due_date) ? "red" : "gray"}>{dayjs(item.due_date).format('MMM. DD, YYYY')}</Text>}
      </div>
      <Text style={{fontSize: 13}}>
          {item.title}
      </Text>
    </Paper>
  );
}

// Recommended react-window performance optimisation: memoize the row render function
// Things are still pretty fast without this, but I am a sucker for making things faster
const Row = memo(function Row(props) {
  const { data: items, index, style } = props;
  const item = items[index];
  
  // We are rendering an extra item for the placeholder
  if (!item) {
    return null;
  }

  return (
    <Draggable draggableId={item._id} index={index} key={item._id}>
      {provided => <Item provided={provided} item={item} style={style} />}
    </Draggable>
  );
}, areEqual);

export const ItemList = memo(function ItemList({ column, index, loadMore}) {
    // There is an issue I have noticed with react-window that when reordered
    // react-window sets the scroll back to 0 but does not update the UI
    // I should raise an issue for this.
    // As a work around I am resetting the scroll to 0
    // on any list that changes it's index
    const listRef = useRef();
    const hasMountedRef = useRef();
  
    const rowHeights = column?.items?.map((item) => {
      let height = 70
      height += calculateHeight(item?.title)
  
      if(item?.due_date) {
        height += 20
      }
      
      return height
    });
  
    const getItemSize = index => {
      return rowHeights?.[index];
    }
  
    let totalHeight = 0
  
    rowHeights?.forEach(i => {
      totalHeight += i
    })

    useLayoutEffect(() => {
      if(hasMountedRef?.current) {
        hasMountedRef.current?.resetAfterIndex(0)
      }
    }, [column])

    return (
      <Droppable
        droppableId={column._id}
        mode="virtual"
        renderClone={(provided, snapshot, rubric) => (
          <Item
            provided={provided}
            isDragging={snapshot.isDragging}
            item={column.items[rubric.source.index]}
          />
        )}
      >
        {(provided, snapshot) => {
          // Add an extra item to our list to make space for a dragging item
          // Usually the DroppableProvided.placeholder does this, but that won't
          // work in a virtual list
          const itemCount = snapshot.isUsingPlaceholder
            ? column?.items?.length + 1
            : column?.items?.length;
  
          return (
            <VariableSizeList 
              height={600}
              itemCount={itemCount}
              itemSize={getItemSize}
              width={300}
              itemData={column.items}
              className="task-list"
              outerRef={provided.innerRef}
              innerRef={listRef}
              ref={hasMountedRef}
              onScroll={(event) => {
                if (!hasMountedRef.current) {
                  hasMountedRef.current = true;
                  return;
                }
            
                if (!listRef.current) {
                  return;
                }
                // BUG: totalHeight is off by few pixels
                const MARGIN_ERROR = 1
                if (hasMountedRef.current.props.height + event.scrollOffset >= (totalHeight - MARGIN_ERROR)) {
                  // BUG: when user move an item from one column to another and place it at the end, load more is called many times.
                  if(snapshot.draggingOverWith === snapshot.draggingFromThisWith && !snapshot.isDraggingOver) {
                    loadMore()
                  }
                }
              }}
            >
              {Row}
            </VariableSizeList >
          );
        }}
      </Droppable>
    );
  });

