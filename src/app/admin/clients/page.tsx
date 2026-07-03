import { prisma } from "@/lib/prisma";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { NewClientForm } from "./client-form";
import { deleteClientAction, toggleClientActiveAction } from "./actions";

export default async function AdminClientsPage() {
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">Clienti</h1>
        <p className="mt-1 text-stone-600">
          Crea account per i tuoi clienti e gestisci l&apos;attivazione
          dell&apos;accesso premium.
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900">Nuovo cliente</h2>
        <p className="mt-1 text-sm text-stone-600">
          Comunica queste credenziali al cliente dopo la creazione.
        </p>
        <div className="mt-4">
          <NewClientForm />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Stato</th>
              <th className="px-4 py-3 font-medium">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-stone-500">
                  Nessun cliente ancora registrato.
                </td>
              </tr>
            )}
            {clients.map((client) => {
              const toggleAction = toggleClientActiveAction.bind(
                null,
                client.id,
                !client.isActive,
              );
              const deleteAction = deleteClientAction.bind(null, client.id);
              return (
                <tr key={client.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 text-stone-900">{client.name}</td>
                  <td className="px-4 py-3 text-stone-600">{client.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        client.isActive
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                          : "rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600"
                      }
                    >
                      {client.isActive ? "Attivo" : "Non attivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <form action={toggleAction}>
                        <button
                          type="submit"
                          className="text-sm font-medium text-emerald-700 hover:underline"
                        >
                          {client.isActive ? "Disattiva" : "Attiva"}
                        </button>
                      </form>
                      <form action={deleteAction}>
                        <ConfirmSubmitButton
                          confirmMessage={`Eliminare l'account di ${client.name}? L'operazione è irreversibile.`}
                          className="text-sm font-medium text-red-600 hover:underline"
                        >
                          Elimina
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
