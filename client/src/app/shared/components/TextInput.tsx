import { TextField, type TextFieldProps } from "@mui/material";
import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";

type Props<T extends FieldValues> = {} & UseControllerProps<T> & TextFieldProps;

export default function TextInput<T extends FieldValues>(props: Props<T>) {
  const { field, fieldState } = useController({ ...props });
  return (
    <TextField
      {...props}
      {...field}
      value={field.value || ""}
      fullWidth
      variant="outlined"
      // ensure outline uses rounded corners and interior is rounded too

      sx={{
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.9)",
        // this targets the outlined border itself
        "& .MuiOutlinedInput-notchedOutline": {
          borderRadius: 3,
          borderColor: "linear-gradient(90deg, #7b61ff 0%, #29b6f6 100%)",
        },
      }}
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
    />
  );
}
