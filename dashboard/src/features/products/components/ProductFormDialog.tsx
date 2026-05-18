import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/atoms/dialog";
import { Button } from "@/shared/components/atoms/button";
import { Input } from "@/shared/components/atoms/input";
import { Label } from "@/shared/components/atoms/label";
import { Textarea } from "@/shared/components/atoms/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/atoms/select";
import { Badge } from "@/shared/components/atoms/badge";
import { ImageUpload } from "@/shared/components/molecules/ImageUpload";
import type { Category, Product, ProductPayload } from "../types/product";

type ProductFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  initialProduct?: Product | null;
  isSaving?: boolean;
  onSubmit: (payload: ProductPayload, imageFile?: File) => Promise<void> | void;
};

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  isActive: boolean;
};

function toFormState(product?: Product | null): ProductFormState {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    categoryId: product?.categoryId ?? "none",
    isActive: product?.isActive ?? true,
  };
}

function buildProductPayload(
  form: ProductFormState,
  initialProduct?: Product | null
): ProductPayload {
  const normalizedName = form.name.trim();
  const normalizedDescription = form.description.trim();
  const normalizedPrice = Number(form.price);
  const normalizedCategoryId = form.categoryId === "none" ? null : form.categoryId;

  if (!initialProduct) {
    return {
      name: normalizedName,
      description: normalizedDescription,
      price: normalizedPrice,
      categoryId: normalizedCategoryId,
      isActive: form.isActive,
    };
  }

  const payload: ProductPayload = {};

  if (normalizedName !== initialProduct.name) payload.name = normalizedName;
  if (normalizedDescription !== initialProduct.description)
    payload.description = normalizedDescription;
  if (normalizedPrice !== initialProduct.price) payload.price = normalizedPrice;
  if (normalizedCategoryId !== initialProduct.categoryId) payload.categoryId = normalizedCategoryId;
  if (form.isActive !== initialProduct.isActive) payload.isActive = form.isActive;

  return payload;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  categories,
  initialProduct,
  isSaving = false,
  onSubmit,
}: ProductFormDialogProps) {
  const [form, setForm] = useState<ProductFormState>(() => toFormState(initialProduct));
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (open) {
      setForm(toFormState(initialProduct));
      setSelectedFiles([]);
    }
  }, [initialProduct, open]);

  const handleSubmit = async () => {
    const payload = buildProductPayload(form, initialProduct);

    await onSubmit(payload, selectedFiles[0]);
  };

  const isDisabled = !form.name.trim() || !form.price || Number(form.price) <= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialProduct ? "Edit product" : "Create product"}</DialogTitle>
          <DialogDescription>
            Keep catalogue data clean and consistent for the mobile storefront.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product name</Label>
              <Input
                id="product-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Signature tote bag"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea
                id="product-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Short, polished copy for mobile shoppers."
                className="min-h-36"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-price">Price</Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, price: event.target.value }))
                  }
                  placeholder="499.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, categoryId: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium">Catalogue visibility</p>
                <Badge variant={form.isActive ? "default" : "secondary"}>
                  {form.isActive ? "Active" : "Hidden"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={form.isActive ? "default" : "outline"}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, isActive: true }))}
                >
                  Active
                </Button>
                <Button
                  variant={!form.isActive ? "default" : "outline"}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, isActive: false }))}
                >
                  Hidden
                </Button>
              </div>
            </div>

            {initialProduct?.imageUrl ? (
              <div className="space-y-2 rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="font-medium">Current image</p>
                <img
                  src={initialProduct.imageUrl}
                  alt={initialProduct.name}
                  className="h-48 w-full rounded-xl object-cover"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>Upload image</Label>
              <ImageUpload
                maxFiles={1}
                onFilesChange={setSelectedFiles}
                hasPrimaryPhoto={Boolean(initialProduct?.imageUrl)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 sm:pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isDisabled || isSaving}>
            {isSaving ? "Saving..." : initialProduct ? "Save changes" : "Create product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
