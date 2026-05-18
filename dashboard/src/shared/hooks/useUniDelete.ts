import { useState } from "react";

interface UniDeleteConfig {
  /**
   * The item being deleted (for display purposes)
   */
  itemName: string;

  /**
   * The type of item being deleted (e.g., "product", "user", "platform")
   */
  itemType: string;

  /**
   * The delete function that returns a promise
   */
  onDelete: () => Promise<void>;

  /**
   * Optional callback called after successful deletion
   */
  onSuccess?: () => void;

  /**
   * Optional callback called when deletion fails
   */
  onError?: (error: any) => void;

  /**
   * Custom title for the dialog
   */
  title?: string;

  /**
   * Custom description for the dialog
   */
  description?: string;

  /**
   * Custom confirm button text
   */
  confirmText?: string;

  /**
   * Custom cancel button text
   */
  cancelText?: string;

  /**
   * Whether to show the warning icon
   */
  showIcon?: boolean;

  /**
   * Additional context for error logging
   */
  errorContext?: Record<string, any>;
}

export interface UniDeleteProps extends UniDeleteConfig {
  /**
   * Whether the delete dialog is open
   */
  open: boolean;

  /**
   * Callback to control the dialog open state
   */
  onOpenChange: (open: boolean) => void;
}

/**
 * Hook for managing UniDelete state
 *
 * @example
 * ```tsx
 * const deleteProduct = useUniDelete()
 *
 * const handleDelete = (product: Product) => {
 *   deleteProduct.open({
 *     itemName: product.name,
 *     itemType: 'product',
 *     onDelete: () => deleteProductMutation.mutateAsync(product.id),
 *     onSuccess: () => toast.success('Product deleted successfully'),
 *     errorContext: { productId: product.id }
 *   })
 * }
 *
 * return (
 *   <>
 *     <Button onClick={() => handleDelete(product)}>Delete</Button>
 *     <UniDelete {...deleteProduct.props} />
 *   </>
 * )
 * ```
 */
export function useUniDelete() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<UniDeleteConfig | null>(null);

  const open = (deleteConfig: UniDeleteConfig) => {
    setConfig(deleteConfig);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    // Clear config after animation completes
    setTimeout(() => setConfig(null), 300);
  };

  const props: UniDeleteProps | null = config
    ? {
        ...config,
        open: isOpen,
        onOpenChange: (open) => {
          if (!open) close();
        },
      }
    : null;

  return {
    open,
    close,
    props,
    isOpen,
  };
}
