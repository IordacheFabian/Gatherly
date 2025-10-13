import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import Select, { type SelectProps } from "@mui/material/Select";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
} from "@mui/material";

type Props<T extends FieldValues> = {
  items: { text: string; value: string }[];
  label: string;
} & UseControllerProps<T> &
  Partial<SelectProps>;

export default function SelectInput<T extends FieldValues>(props: Props<T>) {
  const { field, fieldState } = useController({ ...props });

  return (
    <FormControl fullWidth error={!!fieldState.error}>
      <InputLabel>{props.label}</InputLabel>
      <Select
        value={field.value || ""}
        label={props.label}
        onChange={field.onChange}
        sx={{ textTransform: "capitalize", borderRadius: 3 }}
      >
        {props.items.map((item) => (
          <MenuItem
            key={item.value}
            value={item.value}
            sx={{
              textTransform: "capitalize",
              borderRadius: 3,
              py: 1,
              m: 1,
              ":hover": {
                background: "linear-gradient(90deg, #7b61ff 0%, #29b6f6 100%)",
                color: "common.white",
              },
            }}
          >
            {item.text}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{fieldState.error?.message}</FormHelperText>
    </FormControl>
  );
}
