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
      <Card
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          position: "relative",
          // overflow: "hidden",
          // borderRadius: 10,
          textTransform: "none",
          fontWeight: 700,
          px: 3,
          py: 0.9,
          minWidth: 96,
          // color: "#1b1a1aff",
          color: "#fff",
          // subtle translucent base so backdropFilter works through
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
          backdropFilter: "blur(6px) saturate(120%)",
          WebkitBackdropFilter: "blur(6px) saturate(120%)",

          // moving sheen + subtle color wash via pseudo elements
          "&::before": {
            content: '""',
            position: "absolute",
            left: "-40%",
            top: "-60%",
            width: "220%",
            height: "220%",
            background:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.16), rgba(255,255,255,0) 18%), linear-gradient(90deg, rgba(123,97,255,0.10), rgba(41,182,246,0.10))",
            transform: "rotate(20deg)",
            transition:
              "transform 560ms cubic-bezier(.2,.9,.2,1), opacity 300ms",
            opacity: 0.95,
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            boxShadow: "inset 0 -8px 24px rgba(0,0,0,0.08)",
            pointerEvents: "none",
          },

          // hover/tap states
          "&:hover": {
            transform: "translateY(-5px) scale(1.02)",
            boxShadow: "0 18px 40px rgba(41,182,246,0.14)",
            "&::before": {
              transform: "rotate(20deg) translateX(8%)",
            },
          },
          "&:active": {
            transform: "translateY(-1px) scale(0.995)",
            boxShadow: "0 8px 20px rgba(11,14,46,0.08)",
          },
        }}
      >
        <CardHeader
          title={<Typography variant="h6">Filters</Typography>}
          avatar={<FilterList sx={{ color: "#fff" }} />}
          
          action={
            <IconButton
              onClick={handleClear}
              aria-label="clear filters"
              sx={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",

                color: "#fff",
                mr: 1,
                "&:hover": { opacity: 0.95 },
              }}
            >
              <Clear />
            </IconButton>
          }
          sx={{
            color: "#fff",
            alignItems: "center",
            px: 2,
            position: "relative",
            overflow: "hidden",
            borderRadius: 10,
            textTransform: "none",
            fontWeight: 700,
            py: 0.9,
            mt: 2,
            minWidth: 96,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
            backdropFilter: "blur(6px) saturate(120%)",
            WebkitBackdropFilter: "blur(6px) saturate(120%)",

            // moving sheen + subtle color wash via pseudo elements
            "&::before": {
              content: '""',
              position: "absolute",
              left: "-40%",
              top: "-60%",
              width: "220%",
              height: "220%",
              background:
                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.16), rgba(255,255,255,0) 18%), linear-gradient(90deg, rgba(123,97,255,0.10), rgba(41,182,246,0.10))",
              transform: "rotate(20deg)",
              transition:
                "transform 560ms cubic-bezier(.2,.9,.2,1), opacity 300ms",
              opacity: 0.95,
              pointerEvents: "none",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: 12,
              boxShadow: "inset 0 -8px 24px rgba(0,0,0,0.08)",
              pointerEvents: "none",
            },
          }}
        />

        <CardContent>
          <Stack spacing={2}>
            <TextField
              sx={{
                display: "flex",
                alignItems: "start",
                borderRadius: 3,
                // overflow: "hidden",
                color: "#fff",
                background: "transparent",
                backdropFilter: "blur(8px) saturate(120%)",
                WebkitBackdropFilter: "blur(8px) saturate(120%)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",

                "& .MuiOutlinedInput-root": {
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 3,
                  "& fieldset": { border: "none" },
                  "&:hover fieldset": { border: "none" },
                  "&.Mui-focused fieldset": { border: "none" },
                  "& input": {
                    color: "#000000ff",
                    background: "transparent",
                  },
                },
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  WebkitTextFillColor: "rgba(255,255,255,0.7) !important",
                  transition: "background-color 9999s ease-out 0s !important",
                },
                "& input:-webkit-autofill:focus": {
                  WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
                  WebkitTextFillColor: "rgba(255,255,255,0.7) !important",
                },
              }}
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
                                "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",

                              boxShadow: "0 6px 18px rgba(43, 122, 255, 0.18)",
                              border: "none",
                              "&:hover": { filter: "brightness(0.95)" },
                              borderRadius: "999px",
                              px: 1.5,
                            }
                          : {
                              position: "relative",
                              overflow: "hidden",
                              borderRadius: 10,
                              textTransform: "none",
                              fontWeight: 700,
                              px: 3,
                              py: 0.9,
                              minWidth: 96,
                              // color: "#1b1a1aff",
                              color: "#fff",
                              // subtle translucent base so backdropFilter works through
                              background:
                                "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                              border: "1px solid rgba(255,255,255,0.14)",
                              boxShadow:
                                "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
                              backdropFilter: "blur(6px) saturate(120%)",
                              WebkitBackdropFilter: "blur(6px) saturate(120%)",

                              // moving sheen + subtle color wash via pseudo elements
                              "&::before": {
                                content: '""',
                                position: "absolute",
                                left: "-40%",
                                top: "-60%",
                                width: "220%",
                                height: "220%",
                                background:
                                  "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.16), rgba(255,255,255,0) 18%), linear-gradient(90deg, rgba(123,97,255,0.10), rgba(41,182,246,0.10))",
                                transform: "rotate(20deg)",
                                transition:
                                  "transform 560ms cubic-bezier(.2,.9,.2,1), opacity 300ms",
                                opacity: 0.95,
                                pointerEvents: "none",
                              },
                              "&::after": {
                                content: '""',
                                position: "absolute",
                                inset: 0,
                                borderRadius: 12,
                                boxShadow: "inset 0 -8px 24px rgba(0,0,0,0.08)",
                                pointerEvents: "none",
                              },

                              // hover/tap states
                              "&:hover": {
                                transform: "translateY(-5px) scale(1.02)",
                                boxShadow: "0 18px 40px rgba(41,182,246,0.14)",
                                "&::before": {
                                  transform: "rotate(20deg) translateX(8%)",
                                },
                              },
                              "&:active": {
                                transform: "translateY(-1px) scale(0.995)",
                                boxShadow: "0 8px 20px rgba(11,14,46,0.08)",
                              },
                            }
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
                    sx: {
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                      // overflow: "hidden",
                      color: "#fff",
                      background: "transparent",
                      backdropFilter: "blur(8px) saturate(120%)",
                      WebkitBackdropFilter: "blur(8px) saturate(120%)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",

                      "& .MuiOutlinedInput-root": {
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 3,
                        "& fieldset": { border: "none" },
                        "&:hover fieldset": { border: "none" },
                        "&.Mui-focused fieldset": { border: "none" },
                        "& input": {
                          color: "#000000ff",
                          background: "transparent",
                        },
                      },

                      "& input:-webkit-autofill": {
                        WebkitBoxShadow:
                          "0 0 0 1000px transparent inset !important",
                        WebkitTextFillColor: "rgba(255,255,255,0.7) !important",
                        transition:
                          "background-color 9999s ease-out 0s !important",
                      },
                      "& input:-webkit-autofill:focus": {
                        WebkitBoxShadow:
                          "0 0 0 1000px transparent inset !important",
                        WebkitTextFillColor: "rgba(255,255,255,0.7) !important",
                      },
                    },
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
                            "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                          borderRadius: "999px",
                        }
                      : {
                          borderRadius: "999px",
                          position: "relative",
                          overflow: "hidden",
                          // borderRadius: 10,
                          textTransform: "none",
                          fontWeight: 700,
                          px: 3,
                          py: 0.9,
                          minWidth: 96,
                          // color: "#1b1a1aff",
                          color: "#fff",
                          // subtle translucent base so backdropFilter works through
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                          border: "1px solid rgba(255,255,255,0.14)",
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(11,14,46,0.06)",
                          backdropFilter: "blur(6px) saturate(120%)",
                          WebkitBackdropFilter: "blur(6px) saturate(120%)",

                          // moving sheen + subtle color wash via pseudo elements
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            left: "-40%",
                            top: "-60%",
                            width: "220%",
                            height: "220%",
                            background:
                              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.16), rgba(255,255,255,0) 18%), linear-gradient(90deg, rgba(123,97,255,0.10), rgba(41,182,246,0.10))",
                            transform: "rotate(20deg)",
                            transition:
                              "transform 560ms cubic-bezier(.2,.9,.2,1), opacity 300ms",
                            opacity: 0.95,
                            pointerEvents: "none",
                          },
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            inset: 0,
                            borderRadius: 12,
                            boxShadow: "inset 0 -8px 24px rgba(0,0,0,0.08)",
                            pointerEvents: "none",
                          },

                          // hover/tap states
                          "&:hover": {
                            transform: "translateY(-5px) scale(1.02)",
                            boxShadow: "0 18px 40px rgba(41,182,246,0.14)",
                            "&::before": {
                              transform: "rotate(20deg) translateX(8%)",
                            },
                          },
                          "&:active": {
                            transform: "translateY(-1px) scale(0.995)",
                            boxShadow: "0 8px 20px rgba(11,14,46,0.08)",
                          },
                        }
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
