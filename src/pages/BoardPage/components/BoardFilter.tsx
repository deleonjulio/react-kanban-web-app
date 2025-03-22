import { Grid, Select } from "@mantine/core"
import { PRIORITY_OPTIONS } from "../../../config"
import { ColumnFilters } from "../../../types"

export const BoardFilter = ({
  columnFilters,
  setColumnFilters
}: {
  columnFilters: ColumnFilters;
  setColumnFilters: any
}) => {

  return (
   <Grid>
      <Grid.Col span={{ base: 2 }}>
        <Select 
          label="Priority"
          clearable
          value={columnFilters.priority}
          data={PRIORITY_OPTIONS}
          style={{ width: 200 }}
          onChange={(value) => setColumnFilters((prev: ColumnFilters) => ({...prev, priority: value}))}
        />
      </Grid.Col>
    </Grid>
  )
}