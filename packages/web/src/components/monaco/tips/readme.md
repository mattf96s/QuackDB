[duckdb SQL select result to JSON](https://stackoverflow.com/questions/77757166/duckdb-sql-select-result-to-json)

SELECT {city: list(city), temp_hi: list(temp_hi)}::JSON AS j FROM weather;
SELECT struct_pack(city := list(city), temp_hi := list(temp_hi))::JSON AS j FROM weather;

```json
┌───────────────────────────────────────────────────────┐
│                           j                           │
│                         json                          │
├───────────────────────────────────────────────────────┤
│ {"city":["San Francisco","Vienna"],"temp_hi":[50,35]} │
└───────────────────────────────────────────────────────┘
```
