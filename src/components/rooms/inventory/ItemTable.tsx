import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "good":
      return <CheckCircle className="text-green-500" />;
    case "needs_maintenance":
      return <Wrench className="text-yellow-500" />;
    case "needs_replacement":
      return <AlertCircle className="text-red-500" />;
    default:
      return null;
  }
};

interface ItemTableProps {
  items: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export const ItemTable = ({ items, onEdit, onDelete }: ItemTableProps) => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items?.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <Badge
                    variant={
                      item.status === "good"
                        ? "default"
                        : item.status === "needs_maintenance"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {item.status?.replace("_", " ")}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(item)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};