# NutriPlan

Area riservata (servizio premium) per i clienti in percorso nutrizionale:
ricette curate e alimenti sostitutivi, gestiti da un pannello amministrativo
dedicato al nutrizionista.

## Stack tecnico

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Prisma 6](https://www.prisma.io/) + PostgreSQL
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
- Un database PostgreSQL (in locale, oppure un servizio gratuito come
  [Neon](https://neon.tech) o [Supabase](https://supabase.com))

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
   - `DATABASE_URL`: connection string del tuo database Postgres (locale o
     di un servizio come Neon/Supabase).
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

## Deploy in produzione (Vercel + Postgres)

L'app è pronta per essere pubblicata online su [Vercel](https://vercel.com),
la piattaforma ufficiale per Next.js. Il comando `npm run build` esegue già
`prisma migrate deploy` prima della build, quindi ogni deploy applica
automaticamente le migrazioni del database.

1. **Crea un database Postgres** su un servizio con piano gratuito, ad
   esempio [Neon](https://neon.tech) o [Supabase](https://supabase.com).
   Copia la connection string (per Neon/Supabase, se disponibile, usa la
   variante "pooled"/"connection pooling", pensata per ambienti serverless
   come Vercel).

2. **Importa il repository su Vercel**: vai su
   [vercel.com/new](https://vercel.com/new), collega il tuo account GitHub e
   seleziona questo repository (`borre88/BORRE88`). Vercel riconosce
   automaticamente che è un progetto Next.js.

3. **Imposta le variabili d'ambiente** nel pannello Vercel (Project Settings
   → Environment Variables), le stesse del file `.env`:
   - `DATABASE_URL` — la connection string ottenuta al punto 1
   - `AUTH_SECRET` — genera un valore sicuro con `openssl rand -base64 32`
     (diverso da quello usato in sviluppo)
   - `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` — credenziali del primo
     account amministratore

4. **Avvia il deploy.** Vercel esegue `npm install` (che genera il client
   Prisma tramite lo script `postinstall`) e poi `npm run build` (che
   applica le migrazioni e compila l'app). Al termine l'app è online
   sull'URL fornito da Vercel (es. `nutriplan.vercel.app`).

5. **Popola l'account amministratore**: dopo il primo deploy, esegui una
   volta il seed puntando alla produzione (dal tuo computer, con
   `DATABASE_URL` impostata sulla stringa di produzione):

   ```bash
   DATABASE_URL="<connection string di produzione>" npx prisma db seed
   ```

   Questo crea l'account admin (e i dati di esempio, se il database è
   vuoto). È idempotente: si può rilanciare senza duplicare l'admin.

6. **Dominio personalizzato (opzionale)**: da Project Settings → Domains su
   Vercel puoi collegare un dominio tuo (es. `app.tuostudio.it`) invece
   dell'URL `*.vercel.app`.

### Note per la produzione

- Imposta `AUTH_SECRET` con un valore sicuro e diverso da quello di sviluppo.
- Il flag di attivazione (`isActive`) sostituisce per ora un vero sistema di
  pagamento: l'attivazione dell'accesso premium è manuale, gestita
  dall'admin dopo aver ricevuto il pagamento del cliente con altri mezzi
  (bonifico, ecc.). Un'integrazione di pagamento online (es. Stripe) può
  essere aggiunta in un secondo momento.
- Ogni deploy su Vercel esegue automaticamente `prisma migrate deploy`: le
  modifiche allo schema del database si aggiornano da sole ad ogni push
  sul branch collegato, senza passaggi manuali.
