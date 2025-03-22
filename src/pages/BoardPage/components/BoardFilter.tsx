import { Grid, Select } from "@mantine/core"
import { PRIORITY_OPTIONS } from "../../../config"

export const BoardFilter = () => {
  return (
   <Grid>
      <Grid.Col span={{ base: 2 }}>
        <Select 
          label="Priority"
          clearable
          data={PRIORITY_OPTIONS}
          style={{ width: 200 }}
        />
      </Grid.Col>
    </Grid>
  )
}