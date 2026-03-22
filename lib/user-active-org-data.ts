import type { Prisma } from "@prisma/client";

/**
 * Prisma `user.update({ data })` uses `XOR<UserUpdateInput, UserUncheckedUpdateInput>`.
 * The scalar FK `activeOrgId` only exists on the unchecked input; an inline object
 * often fails type inference. Use this helper as `data` instead.
 */
export function userActiveOrgUpdateData(
  organizationId: string,
): Prisma.UserUncheckedUpdateInput {
  return { activeOrgId: organizationId };
}
