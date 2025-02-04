import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface RoomActivityTabProps {
  activityLogs: any[];
  isLoading?: boolean;
}

export const RoomActivityTab = ({ activityLogs, isLoading }: RoomActivityTabProps) => {
  const isMobile = useIsMobile();

  const formatDetails = (details: any) => {
    if (!details) return "No details available";
    
    const formattedDetails = [];
    if (details.name) formattedDetails.push(`Item: ${details.name}`);
    if (details.quantity) formattedDetails.push(`Quantity: ${details.quantity}`);
    if (details.maintenance_quantity) formattedDetails.push(`Needs Maintenance: ${details.maintenance_quantity}`);
    if (details.replacement_quantity) formattedDetails.push(`Needs Replacement: ${details.replacement_quantity}`);
    
    return formattedDetails.join(", ");
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              {!isMobile && <TableHead>Timestamp</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                {!isMobile && <TableCell><Skeleton className="h-4 w-28" /></TableCell>}
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
            {!isMobile && <TableHead>Timestamp</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {activityLogs?.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.profiles?.username || 'Unknown User'}</TableCell>
              <TableCell className="capitalize">{log.action}</TableCell>
              <TableCell className="max-w-xs overflow-hidden text-ellipsis">
                {formatDetails(log.details)}
              </TableCell>
              {!isMobile && (
                <TableCell>
                  {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                </TableCell>
              )}
            </TableRow>
          ))}
          {activityLogs.length === 0 && (
            <TableRow>
              <TableCell 
                colSpan={isMobile ? 3 : 4} 
                className="text-center py-4 text-gray-500"
              >
                No activity logs found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};