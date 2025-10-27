import { TextField, Typography, type TextFieldProps } from "@mui/material";
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";

type Props<T extends FieldValues> = {} & UseControllerProps<T> & TextFieldProps;

export default function TextInput<T extends FieldValues>(props: Props<T>) {
  const { field, fieldState } = useController({ ...props });
  return (
    <>
      <TextField
        {...props}
        {...field}
        value={field.value || ""}
        fullWidth
        // variant="outlined"
       
        sx={{
          borderRadius: 3,
          // overflow: "hidden",
          color: "#fff",
          background: "transparent", 
          backdropFilter: "blur(8px) saturate(120%)",
          WebkitBackdropFilter: "blur(8px) saturate(120%)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",

          backgroundColor: fieldState.invalid
          ? "rgba(255, 80, 80, 0.15)" // red tint when invalid ❌
          : field.value && !fieldState.invalid
          ? "rgba(76, 175, 80, 0.15)" // green tint when valid ✅
          : "transparent", // default: transparent

          
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

          "& .MuiFormHelperText-root": {
            color: fieldState.error
              ? "rgba(255,120,120,0.9)"
              : "rgba(255,255,255,0.7)",
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
          error={!!fieldState.error}
            // helperText={fieldState.error?.message}
          />
        {fieldState.error && (
          <Typography variant="caption" color="error">
            {fieldState.error?.message}
          </Typography>
      )}
    </>
  );
}
