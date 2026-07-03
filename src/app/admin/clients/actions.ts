"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type ClientFormState = {
  error?: string;
  success?: string;
};

export async function createClientAction(
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 6) {
    return {
      error: "Compila nome, email e una password di almeno 6 caratteri.",
    };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Esiste già un account con questa email." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "CLIENT",
      isActive: true,
    },
  });

  revalidatePath("/admin/clients");
  return { success: `Cliente ${name} creato correttamente.` };
}

export async function toggleClientActiveAction(clientId: string, isActive: boolean) {
  await prisma.user.update({
    where: { id: clientId },
    data: { isActive },
  });
  revalidatePath("/admin/clients");
}

export async function deleteClientAction(clientId: string) {
  await prisma.user.delete({ where: { id: clientId } });
  revalidatePath("/admin/clients");
}
