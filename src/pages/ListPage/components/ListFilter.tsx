import { useEffect, useState, useRef } from "react"
import { CloseButton, Grid, Select, TextInput } from "@mantine/core"
import { useSearchParams } from "react-router-dom"
import { PRIORITY_OPTIONS } from "../../../config"
import { useDebounce } from 'use-debounce';

export const ListFilter = () => {
  const userTyped = useRef(false); // So we dont reset the page on initial load

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  const [value] = useDebounce(search, 500);

  useEffect(() => {
    if (userTyped.current) {
      searchParams.set("page", "1"); 
    }

    if(value === "") {
      searchParams.delete("search")
    } else {
      searchParams.set("search", value)
    }
    setSearchParams(searchParams);
  }, [value])
    
  return (
   <Grid style={{padding: 4}}>
      <Grid.Col span={2.2}>
        <TextInput
          rightSection={search.length > 0 && <CloseButton size="sm" onClick={() => setSearch('')} />}
          label="Search"
          value={search}
          onChange={(e) => {
            userTyped.current = true;
            setSearch(e.target.value)
          }}
          style={{ width: 200 }}         
        />
      </Grid.Col>
      <Grid.Col span={2.1}>
      <Select 
          label="Priority"
          clearable
          value={searchParams.get('priority')}
          data={PRIORITY_OPTIONS}
          style={{ width: 200 }}
          onChange={(value) =>  {
            searchParams.set("page", "1")
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