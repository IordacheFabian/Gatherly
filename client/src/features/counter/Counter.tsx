import {
  Box,
  Button,
  ButtonGroup,
  List,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { useStore } from "../../lib/hooks/useStore";
import { observer } from "mobx-react-lite";

const Counter = observer(function Counter() {
  const { counterStore } = useStore();

  return (
    <Box display={"flex"} justifyContent="space-between">
      <Box>
        <Typography variant="h4" gutterBottom>
          {counterStore.title}
        </Typography>
        <Typography variant="h6">The count is: {counterStore.count}</Typography>

        <ButtonGroup sx={{ mt: 3, width: "100%" }} variant="contained">
          <Button onClick={() => counterStore.decrement()} color="error">
            Decrement
          </Button>
          <Button onClick={() => counterStore.increment()} color="primary">
            Increment
          </Button>
          <Button onClick={() => counterStore.increment(5)} color="secondary">
            Increment by 5
          </Button>
        </ButtonGroup>
      </Box>
      <Paper sx={{ width: "40%", paddingLeft: 5, paddingRight: 5, py: 2 }}>
        <Typography variant="h6">
          Event Count: {counterStore.eventCount}
        </Typography>
        <List>
          {counterStore.events.map((event, index) => (
            <ListItemText key={index}>{event}</ListItemText>
          ))}
        </List>
      </Paper>
    </Box>
  );
});

export default Counter;
