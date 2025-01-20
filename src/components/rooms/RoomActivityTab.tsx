import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface RoomActivityTabProps {
  activityLogs: any[];
  isLoading?: boolean;
}

export const RoomActivityTab = ({ activityLogs, isLoading }: RoomActivityTabProps) => {
  if (isLoading) {
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
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

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
                <pre className="text-sm whitespace-pre-wrap max-w-md">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </TableCell>
              <TableCell>
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
          {activityLogs.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                No activity logs found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};