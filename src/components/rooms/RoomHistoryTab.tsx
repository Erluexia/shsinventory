import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const RoomHistoryTab = ({ itemHistory }: { itemHistory: any[] }) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Previous Status</TableHead>
            <TableHead>New Status</TableHead>
            <TableHead>Previous Quantity</TableHead>
            <TableHead>New Quantity</TableHead>
            <TableHead>Changed At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itemHistory?.map((history) => (
            <TableRow key={history.id}>
              <TableCell>{history.items?.name}</TableCell>
              <TableCell>{history.previous_status}</TableCell>
              <TableCell>{history.new_status}</TableCell>
              <TableCell>{history.previous_quantity}</TableCell>
              <TableCell>{history.new_quantity}</TableCell>
              <TableCell>
                {new Date(history.created_at).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};