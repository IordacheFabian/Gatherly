import { Clear, Event, FilterList, Search } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Grow,
} from "@mui/material";
import { useCallback, useMemo, useState } from "react";

type FilterKind = "all" | "going" | "hosting";

const todayIso = (() => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
})();

export default function ActivityFilters() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKind>("all");
  const [date, setDate] = useState<string | null>(null);

  const handleClear = useCallback(() => {
    setSearch("");
    setFilter("all");
    setDate(null);
  }, []);

  const chips = useMemo(
    () => [
      { key: "all", label: "All Activities" },
      { key: "going", label: "I'm going" },
      { key: "hosting", label: "I'm hosting" },
    ],
    []
  );

  return (
    <Grow in appear timeout={400}>
      <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
        <CardHeader
          title={<Typography variant="h6">Filters</Typography>}
          avatar={<FilterList sx={{ color: "#fff" }} />}
          action={
            <IconButton
              onClick={handleClear}
              aria-label="clear filters"
              sx={{
                background: "linear-gradient(45deg, #7b61ff, #29b6f6)",
                color: "#fff",
                mr: 1,
                "&:hover": { opacity: 0.95 },
              }}
            >
              <Clear />
            </IconButton>
          }
          sx={{
            background: "linear-gradient(45deg, #7b61ff, #29b6f6)",
            color: "#fff",
            alignItems: "center",
            px: 2,
          }}
        />

        <CardContent>
          <Stack spacing={2}>
            <TextField
              sx={{ display: "flex", alignItems: "start" }}
              value={search}
              size="small"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                sx: {
                  width: "100%",
                  borderRadius: "12px",
                  backgroundColor: "rgba(255,255,255,0.9)",
                  paddingRight: 1,
                },
              }}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                View
              </Typography>
              <Stack direction="row" spacing={1}>
                {chips.map((c) => {
                  const isActive = filter === (c.key as FilterKind);
                  return (
                    <Chip
                      key={c.key}
                      label={c.label}
                      variant={isActive ? "filled" : "outlined"}
                      onClick={() => setFilter(c.key as FilterKind)}
                      clickable
                      sx={
                        isActive
                          ? {
                              color: "#fff",
                              background:
                                "linear-gradient(45deg, #7b61ff, #29b6f6)",
                              boxShadow: "0 6px 18px rgba(43, 122, 255, 0.18)",
                              border: "none",
                              "&:hover": { filter: "brightness(0.95)" },
                              borderRadius: "999px",
                              px: 1.5,
                            }
                          : { borderRadius: "999px", px: 1 }
                      }
                    />
                  );
                })}
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Event fontSize="small" />
                Date
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  type="date"
                  size="small"
                  value={date ?? todayIso}
                  onChange={(e) => setDate(e.target.value)}
                  sx={{ minWidth: 150 }}
                  InputProps={{
                    sx: { borderRadius: "8px", backgroundColor: "#fff" },
                  }}
                  inputProps={{
                    "aria-label": "filter-date",
                  }}
                />

                <Chip
                  label={
                    date ? new Date(date).toLocaleDateString() : "Any date"
                  }
                  sx={
                    date
                      ? {
                          color: "#fff",
                          background:
                            "linear-gradient(45deg, #7b61ff, #29b6f6)",
                          borderRadius: "999px",
                        }
                      : { borderRadius: "999px" }
                  }
                />
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}
