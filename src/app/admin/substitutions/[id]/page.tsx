import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import {
  addItemAction,
  deleteGroupAction,
  deleteItemAction,
  updateGroupAction,
} from "../actions";
import { GroupForm } from "../group-form";
import { AddItemForm } from "../item-form";

export default async function EditGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const group = await prisma.substitutionGroup.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!group) notFound();

  const boundUpdate = updateGroupAction.bind(null, group.id);
  const boundDelete = deleteGroupAction.bind(null, group.id);
  const boundAddItem = addItemAction.bind(null, group.id);

  return (
    <div className="flex flex-col gap-8">
      <Link href="/admin/substitutions" className="text-sm text-emerald-700 hover:underline">
        &larr; Torna ai gruppi
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">{group.name}</h1>
        <form action={boundDelete}>
          <ConfirmSubmitButton
            confirmMessage={`Eliminare il gruppo "${group.name}" e tutti i suoi alimenti?`}
            className="rounded-full border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Elimina gruppo
          </ConfirmSubmitButton>
        </form>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900">Dettagli gruppo</h2>
        <div className="mt-4">
          <GroupForm
            action={boundUpdate}
            submitLabel="Salva modifiche"
            defaultValues={{ name: group.name, description: group.description ?? "" }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900">Alimenti nel gruppo</h2>

        <ul className="mt-4 divide-y divide-stone-100">
          {group.items.length === 0 && (
            <li className="py-3 text-sm text-stone-500">Nessun alimento aggiunto ancora.</li>
          )}
          {group.items.map((item) => {
            const boundDeleteItem = deleteItemAction.bind(null, group.id, item.id);
            return (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-stone-900">{item.name}</p>
                  <p className="text-xs text-stone-500">
                    {item.quantity}
                    {item.notes ? ` · ${item.notes}` : ""}
                  </p>
                </div>
                <form action={boundDeleteItem}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Rimuovi
                  </button>
                </form>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-stone-100 pt-6">
          <h3 className="text-sm font-semibold text-stone-900">Aggiungi alimento</h3>
          <div className="mt-3">
            <AddItemForm action={boundAddItem} />
          </div>
        </div>
      </div>
    </div>
  );
}
