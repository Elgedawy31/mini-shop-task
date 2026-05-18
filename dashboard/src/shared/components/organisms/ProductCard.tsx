import { Badge } from "@/shared/components/atoms/badge";
import { Button } from "@/shared/components/atoms/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/atoms/card";

export type ProductCardProps = {
  name: string;
  price: string;
  imageUrl?: string;
  status?: "active" | "draft" | "archived";
  onEdit?: () => void;
};

const statusLabel: Record<NonNullable<ProductCardProps["status"]>, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};

export function ProductCard({
  name,
  price,
  imageUrl,
  status = "active",
  onEdit,
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="aspect-square w-full object-cover"
          loading="lazy"
        />
      ) : null}
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="line-clamp-2 text-base">{name}</CardTitle>
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {statusLabel[status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold">{price}</p>
      </CardContent>
      <CardFooter>
        <Button type="button" variant="outline" className="w-full" onClick={onEdit}>
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
