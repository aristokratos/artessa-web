export type UserRole = "Customer" | "Curator" | "Admin";

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  emailVerified: boolean;
  role: UserRole;
  /** False until the email is verified — an order cannot be placed (AUTH-04). */
  canPurchase: boolean;
}
