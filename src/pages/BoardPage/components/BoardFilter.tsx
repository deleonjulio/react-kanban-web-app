import { Grid, Select } from "@mantine/core"
import { useSearchParams } from "react-router-dom"
import { PRIORITY_OPTIONS } from "../../../config"

export const BoardFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
   <Grid>
      <Grid.Col span={{ base: 2 }}>
        <Select 
          label="Priority"
          clearable
          value={searchParams.get('priority')}
          data={PRIORITY_OPTIONS}
          style={{ width: 200 }}
          onChange={(value) =>  {
            if(value) {
              searchParams.set("priority", value)
              setSearchParams(searchParams);
            } else {
              searchParams.delete("priority")
              setSearchParams(searchParams);
            }
          }}
        />
      </Grid.Col>
    </Grid>
  )
}