
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
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RoomActivityTabProps {
  activityLogs: any[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const RoomActivityTab = ({ activityLogs, isLoading, onRefresh }: RoomActivityTabProps) => {
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
      <div className="space-y-4">
        <div className="flex justify-end mb-4">
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
        <div className="rounded-md border">
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
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recent Activity</h3>
        <Button 
          variant="outline" 
          size="icon"
          onClick={onRefresh}
          className="h-10 w-10"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">User</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
              <TableHead>Details</TableHead>
              {!isMobile && <TableHead className="w-[180px]">Timestamp</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityLogs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  {log.profiles?.username || 'Unknown User'}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset">
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs overflow-hidden text-ellipsis">
                  {formatDetails(log.details)}
                </TableCell>
                {!isMobile && (
                  <TableCell className="text-muted-foreground">
                    {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {activityLogs.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={isMobile ? 3 : 4} 
                  className="h-24 text-center text-muted-foreground"
                >
                  No activity logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
