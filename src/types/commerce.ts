export interface CartItem {
  id: string;
  variantId: string;
  artworkId: string;
  artworkSlug: string;
  artworkTitle: string;
  artistName: string;
  imageStorageKey: string | null;
  variantLabel: string | null;
  variantKind: string;
  quantity: number;
  unitPriceMinor: number;
  unitPriceMinorAtAdd: number;
  priceChanged: boolean;
  requiresShipping: boolean;
  reservedUntilUtc: string | null;
  isAvailable: boolean;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotalMinor: number;
  currency: string;
  requiresShipping: boolean;
  itemCount: number;
}
