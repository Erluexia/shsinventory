import { Badge } from "@/components/ui/badge";

type RoomStatus = 'active' | 'maintenance' | 'inactive';

const getStatusColor = (status: RoomStatus) => {
  switch (status) {
    case 'active':
      return 'bg-green-500 hover:bg-green-600';
    case 'maintenance':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'inactive':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
};

export const RoomStatusBadge = ({ status }: { status: RoomStatus }) => {
  return (
    <Badge className={getStatusColor(status)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};