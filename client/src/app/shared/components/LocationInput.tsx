import { useMemo, useState, useEffect } from "react";
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import type { LocationIqSuggestion } from "../../../lib/types";
import {
  Box,
  debounce,
  List,
  ListItemButton,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";

type Props<T extends FieldValues> = {
  label: string;
} & UseControllerProps<T>;

export default function LocationInput<T extends FieldValues>(props: Props<T>) {
  const { field, fieldState } = useController({ ...props });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationIqSuggestion[]>([]);
  const [inputValue, setInputValue] = useState(field.value || "");

  useEffect(() => {
    if (field.value && typeof field.value === "object") {
      setInputValue(field.value.venue || "");
    } else {
      setInputValue(field.value || "");
    }
  }, [field.value]);

  const locationUrl = import.meta.env.VITE_LOCATION_IQ_KEY;

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (query: string) => {
        if (!query || query.length < 3) {
          setSuggestions([]);
          return;
        }
        setLoading(true);

        try {
          const res = await axios.get<LocationIqSuggestion[]>(
            `${locationUrl}q=${query}`
          );
          setSuggestions(res.data);
        } catch (error) {
          console.log(
            "eroareheloo" + import.meta.env.VITE_LOCATION_IQ_KEY,
            error
          );
        } finally {
          setLoading(false);
        }
      }, 500),
    [locationUrl]
  );

  const handleChange = async (value: string) => {
    field.onChange(value);
    await fetchSuggestions(value);
  };

  const handleSelect = (location: LocationIqSuggestion) => {
    const city =
      location.address?.city ||
      location.address?.town ||
      location.address?.village;
    const venue = location.display_name;
    const latitude = location.lat;
    const longitude = location.lon;

    setInputValue(venue);
    field.onChange({ city, venue, latitude, longitude });
    setSuggestions([]);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        {...props}
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        fullWidth
        variant="outlined"
        error={!!fieldState.error}
        helperText={fieldState.error?.message}
        sx={{
          backgroundColor: "rgba(255,255,255,0.9)",
          "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: 3,
            borderColor: "linear-gradient(90deg, #7b61ff 0%, #29b6f6 100%)",
          },
        }}
      />
      {loading && <Typography>Loading...</Typography>}
      {suggestions.length > 0 && (
        <List
          sx={{
            p: 1,
            border: 1,
            borderRadius: 3,
            borderTop: 0,
            borderColor: "grey.300",
          }}
        >
          {suggestions.map((suggestion) => (
            <ListItemButton
              sx={{
                p: 1,
                mt: 0.5,
                borderRadius: 3,
                ":hover": {
                  background:
                    "linear-gradient(90deg, #7b61ff 0%, #29b6f6 100%)",
                  color: "#fff",
                },
              }}
              divider
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.display_name}
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
}
