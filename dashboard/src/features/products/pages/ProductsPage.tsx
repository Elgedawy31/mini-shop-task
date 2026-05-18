import { useMemo, useState } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { PageHeader } from "@/shared/components/organisms/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/atoms/card";
import { Button } from "@/shared/components/atoms/button";
import { Input } from "@/shared/components/atoms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/atoms/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/atoms/dropdown-menu";
import { ConfirmationModal } from "@/shared/components/molecules/ConfirmationModal";
import { Skeleton } from "@/shared/components/atoms/skeleton";
import { Badge } from "@/shared/components/atoms/badge";
import { formatCurrency, formatDateTime } from "@/shared/utils/format";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import {
  useCategories,
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useToggleProductActive,
  useUpdateProduct,
  useUploadProductImage,
} from "../hooks/useProducts";
import { ProductFormDialog } from "../components/ProductFormDialog";
import type { Product, ProductPayload } from "../types/product";

function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productToArchive, setProductToArchive] = useState<Product | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const query = useMemo(
    () => ({
      page,
      limit: 8,
      search: debouncedSearch || undefined,
      category: category === "all" ? undefined : category,
      includeInactive: true,
    }),
    [category, debouncedSearch, page]
  );

  const { data, isLoading, isFetching } = useProducts(query);
  const { data: categoryData } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const toggleMutation = useToggleProductActive();
  const uploadMutation = useUploadProductImage();

  const totalPages = data
    ? Math.max(1, Math.ceil(data.pagination.total / data.pagination.limit))
    : 1;

  const handleSaveProduct = async (payload: ProductPayload, imageFile?: File) => {
    const hasFieldChanges = Object.keys(payload).length > 0;

    if (editingProduct && !imageFile && !hasFieldChanges) {
      setIsDialogOpen(false);
      setEditingProduct(null);
      return;
    }

    const imageResponse = imageFile ? await uploadMutation.mutateAsync(imageFile) : null;
    const finalPayload = {
      ...payload,
      ...(imageResponse ? { imageUrl: imageResponse.imageUrl } : {}),
    };

    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id, payload: finalPayload });
    } else {
      await createMutation.mutateAsync(finalPayload);
    }

    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-8 p-1">
      <PageHeader
        title="Products"
        description="Manage catalogue content, visibility, and imagery for the mobile storefront."
        actions={[
          {
            label: "Add product",
            icon: Plus,
            onClick: () => {
              setEditingProduct(null);
              setIsDialogOpen(true);
            },
          },
        ]}
      />

      <Card className="border-border/60">
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Catalogue</CardTitle>
            <p className="text-sm text-muted-foreground">
              {data?.pagination.total ?? 0} products total {isFetching ? "• Refreshing..." : ""}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search products"
                className="pl-10"
              />
            </div>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categoryData?.items.map((item) => (
                  <SelectItem key={item.id} value={item.slug}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-2xl" />
            ))
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-border/70">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Updated</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.items.map((product) => (
                      <tr key={product.id} className="border-t border-border/60 align-top">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-muted">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{product.name}</p>
                              <p className="line-clamp-2 max-w-md text-muted-foreground">
                                {product.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">{product.category?.name ?? "Unassigned"}</td>
                        <td className="px-4 py-4 font-medium">{formatCurrency(product.price)}</td>
                        <td className="px-4 py-4">
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Hidden"}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {formatDateTime(product.updatedAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setIsDialogOpen(true);
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    toggleMutation.mutate({
                                      id: product.id,
                                      isActive: !product.isActive,
                                    })
                                  }
                                >
                                  {product.isActive ? "Hide from shop" : "Make active"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => setProductToArchive(product)}
                                >
                                  Archive
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {data?.pagination.page ?? 1} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ProductFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categories={categoryData?.items ?? []}
        initialProduct={editingProduct}
        isSaving={createMutation.isPending || updateMutation.isPending || uploadMutation.isPending}
        onSubmit={handleSaveProduct}
      />

      <ConfirmationModal
        open={Boolean(productToArchive)}
        onOpenChange={(open) => {
          if (!open) setProductToArchive(null);
        }}
        title="Archive product"
        description="This will soft-delete the product and hide it from the customer catalogue."
        confirmText="Archive"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!productToArchive) return;
          await deleteMutation.mutateAsync(productToArchive.id);
          setProductToArchive(null);
        }}
      />
    </div>
  );
}

export default ProductsPage;
