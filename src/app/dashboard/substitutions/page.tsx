import { prisma } from "@/lib/prisma";

export default async function ClientSubstitutionsPage() {
  const groups = await prisma.substitutionGroup.findMany({
    include: { items: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">
          Alimenti sostitutivi
        </h1>
        <p className="mt-1 text-stone-600">
          Alimenti equivalenti tra loro: puoi scambiarli liberamente nel tuo
          piano mantenendo l&apos;equilibrio nutrizionale.
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="text-stone-500">Nessun gruppo disponibile al momento.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <div
              key={group.id}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <h2 className="font-semibold text-stone-900">{group.name}</h2>
              {group.description && (
                <p className="mt-1 text-sm text-stone-600">{group.description}</p>
              )}
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between text-sm text-stone-700"
                  >
                    <span>{item.name}</span>
                    <span className="text-stone-500">{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
