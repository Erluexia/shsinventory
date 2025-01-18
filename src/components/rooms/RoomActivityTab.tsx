import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const RoomActivityTab = ({ activityLogs }: { activityLogs: any[] }) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activityLogs?.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.profiles?.username || 'Unknown User'}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>
                <pre className="text-sm">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </TableCell>
              <TableCell>
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};