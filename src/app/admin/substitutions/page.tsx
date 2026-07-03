import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createGroupAction } from "./actions";
import { GroupForm } from "./group-form";

export default async function AdminSubstitutionsPage() {
  const groups = await prisma.substitutionGroup.findMany({
    include: { _count: { select: { items: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">
          Alimenti sostitutivi
        </h1>
        <p className="mt-1 text-stone-600">
          Crea gruppi di alimenti equivalenti che i clienti potranno scambiare
          liberamente nel piano.
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900">Nuovo gruppo</h2>
        <div className="mt-4">
          <GroupForm action={createGroupAction} submitLabel="Crea gruppo" />
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="text-stone-500">Nessun gruppo creato ancora.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/admin/substitutions/${group.id}`}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-colors hover:border-emerald-300"
            >
              <h3 className="font-semibold text-stone-900">{group.name}</h3>
              {group.description && (
                <p className="mt-1 text-sm text-stone-600">{group.description}</p>
              )}
              <p className="mt-3 text-xs text-stone-500">
                {group._count.items} alimenti
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
