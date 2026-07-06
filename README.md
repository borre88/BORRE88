# NutriPlan

Area riservata (servizio premium) per i clienti in percorso nutrizionale:
ricette curate e alimenti sostitutivi, gestiti da un pannello amministrativo
dedicato al nutrizionista.

## Stack tecnico

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Prisma 6](https://www.prisma.io/) + SQLite (facile da usare in locale;
  passare a Postgres/MySQL in produzione cambiando solo `DATABASE_URL` e il
  `provider` in `prisma/schema.prisma`)
- [NextAuth v5](https://authjs.dev/) (Credentials provider, sessioni JWT)

## Funzionalità

- **Autenticazione con ruoli**: `ADMIN` (nutrizionista) e `CLIENT`.
- **Accesso premium controllato**: ogni cliente ha un flag `isActive` che il
  nutrizionista attiva/disattiva manualmente dal pannello admin (nessun
  pagamento online integrato in questa versione).
- **Pannello admin** (`/admin`): gestione clienti (creazione account,
  attivazione/disattivazione, eliminazione), gestione ricette (CRUD),
  gestione gruppi di alimenti sostitutivi (CRUD) e panoramica del
  **Longevity Score** di tutti i clienti.
- **Area cliente** (`/dashboard`): consultazione ricette e alimenti
  sostitutivi, visibile solo se l'account è attivo.
- **Longevity Score** (`/dashboard/longevity`): questionario premium che
  valuta 5 aree (allenamento, nutrizione e integrazione, sonno, gestione
  dello stress, prevenzione), ciascuna su una scala da 1 a 20, per un
  punteggio complessivo su 100. In base alle risposte l'app genera un
  feedback automatico con le aree su cui concentrarsi, visibile sia al
  cliente sia al nutrizionista (`/admin/longevity`), che vede anche i dati
  aggiuntivi (massimali, integratori assunti, ultimi esami) e lo storico dei
  punteggi.

## Requisiti

- Node.js 20+
- npm

## Setup locale

1. Installa le dipendenze:

   ```bash
   npm install
   ```

2. Copia il file di esempio delle variabili d'ambiente e personalizzalo:

   ```bash
   cp .env.example .env
   ```

   In particolare imposta:
   - `AUTH_SECRET`: genera un valore casuale con `openssl rand -base64 32`.
   - `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD`: credenziali del primo
     account amministratore (il nutrizionista). **Cambia la password dopo il
     primo accesso.**

3. Crea il database e applica le migrazioni:

   ```bash
   npx prisma migrate dev
   ```

4. Popola il database con l'account admin e alcuni dati di esempio (ricette,
   gruppi di sostituzione, un cliente demo):

   ```bash
   npx prisma db seed
   ```

5. Avvia il server di sviluppo:

   ```bash
   npm run dev
   ```

   L'app è disponibile su [http://localhost:3000](http://localhost:3000).

## Credenziali di esempio dopo il seed

- **Admin (nutrizionista)**: l'email/password impostate in `.env`
  (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- **Cliente demo**: `cliente.demo@example.com` / `Cliente123!`

## Script disponibili

- `npm run dev` — avvia il server di sviluppo
- `npm run build` — build di produzione
- `npm run start` — avvia il server con la build di produzione
- `npm run lint` — esegue ESLint
- `npx prisma studio` — GUI per esplorare/modificare il database
- `npx prisma migrate dev` — applica migrazioni in sviluppo
- `npx prisma db seed` — ri-esegue il seed (idempotente per l'admin e il
  cliente demo)

## Note per la produzione

- SQLite va bene per iniziare, ma per un deploy con più utenti concorrenti è
  consigliato passare a Postgres: cambia `provider` in
  `prisma/schema.prisma` e `DATABASE_URL`, poi rilancia
  `npx prisma migrate deploy`.
- Imposta `AUTH_SECRET` con un valore sicuro e diverso da quello di sviluppo.
- Il flag di attivazione (`isActive`) sostituisce per ora un vero sistema di
  pagamento: l'attivazione dell'accesso premium è manuale, gestita
  dall'admin dopo aver ricevuto il pagamento del cliente con altri mezzi
  (bonifico, ecc.). Un'integrazione di pagamento online (es. Stripe) può
  essere aggiunta in un secondo momento.
