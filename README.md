# Nutrition & Performance

Web app per il servizio di personal training e nutrizione del Dott. Borrelli Simone.
Due aree riservate:

- **Area Personal Trainer**: gestione clienti, rilevazioni periodiche (sonno, FC a
  riposo, VO2max, massimali, peso), grafici di andamento.
- **Area Cliente**: ricettario, allenamenti a casa, calcolo cena fuori, i propri dati
  di salute registrati dal trainer.

## Stack tecnico

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript + Tailwind CSS 4
- [Supabase](https://supabase.com/) (database Postgres, autenticazione, Row Level
  Security)
- Deploy su [Vercel](https://vercel.com/), collegato al repository GitHub

## Setup locale

1. Installa le dipendenze:

   ```bash
   npm install
   ```

2. Crea `.env.local` con le chiavi del progetto Supabase (vedi `.env.example`):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXT_PUBLIC_SITE_URL=
   RESEND_API_KEY=
   EMAIL_FROM=
   CRON_SECRET=
   ```

   Le prime due si trovano su Supabase in *Project Settings → API keys*. La
   `SUPABASE_SERVICE_ROLE_KEY` è la chiave segreta "service_role" (stessa pagina):
   serve solo lato server per creare gli account dei clienti, non va mai esposta al
   browser. `RESEND_API_KEY`/`EMAIL_FROM`/`CRON_SECRET` servono per il promemoria
   email settimanale (vedi sezione dedicata più sotto) — senza `RESEND_API_KEY`
   l'app funziona comunque, semplicemente non invia quell'email.

3. Avvia il server di sviluppo:

   ```bash
   npm run dev
   ```

   L'app è disponibile su [http://localhost:3000](http://localhost:3000).

## Come aggiungere nuove ricette, allenamenti e voci "cena fuori"

Questi contenuti vivono in Supabase e si modificano dal **Table Editor** di Supabase
(Studio), senza toccare il codice:

1. Vai su [supabase.com](https://supabase.com/dashboard), apri il progetto, sezione
   **Table Editor**.
2. Per una nuova ricetta: apri la tabella `recipes` → **Insert row** → compila
   `name`, `meal` (`colazione` / `pranzo` / `cena` / `spuntino`), `goal`
   (`definizione` / `mantenimento` / `massa`), `kcal`, `protein_g`, `carbs_g`,
   `fat_g`, `time_minutes`, `emoji` (facoltativo), `ingredients` e `steps` (liste di
   testo, un elemento per riga nell'editor).
3. Per un nuovo allenamento: inserisci una riga in `workouts` (`equipment`:
   `nessuno` / `manubri` / `elastici`; `goal`: `generale` / `forza` /
   `dimagrimento`), poi aggiungi i suoi esercizi in `workout_exercises` con lo
   stesso `workout_id`.
4. Per una nuova voce "cena fuori": inserisci una riga in `dining_dishes`, scegliendo
   `category_id` tra quelli esistenti in `dining_categories` (o creane uno nuovo lì
   prima).

Le modifiche compaiono nell'app al primo caricamento successivo (nessun deploy
necessario).

## Promemoria email settimanale

Ogni lunedì mattina (8:00 UTC) l'app invia automaticamente a tutti i clienti con un
account collegato un'email che li invita a compilare il check-in settimanale
(`/cliente/check-in`). Per attivarlo:

1. Crea un account gratuito su [resend.com](https://resend.com) (fino a 3.000
   email/mese gratis) e genera una **API Key** da *API Keys* nel pannello.
2. Su Vercel, in *Settings → Environment Variables*, aggiungi:
   - `RESEND_API_KEY`: la chiave appena creata
   - `CRON_SECRET`: una stringa segreta a tua scelta (protegge l'endpoint da invii
     non autorizzati)
   - `EMAIL_FROM` (facoltativo): all'inizio puoi lasciare il mittente di test di
     Resend; per una consegna più affidabile e professionale, verifica un tuo
     dominio in Resend (*Domains → Add Domain*, aggiungendo pochi record DNS) e poi
     imposta qui un indirizzo come `Nutrition & Performance <no-reply@tuodominio.it>`.
3. Rifai il deploy: Vercel legge automaticamente `vercel.json` e programma la
   chiamata settimanale da solo, non serve altro.

Puoi cambiare giorno/orario modificando `schedule` in `vercel.json` (formato cron,
orario UTC).

## Sicurezza dei dati (Row Level Security)

Ogni cliente vede solo le proprie rilevazioni; il trainer vede solo i propri
clienti. Le regole sono applicate a livello di database (RLS di Postgres), quindi
valgono anche se qualcuno provasse a interrogare l'API direttamente. Vedi i commenti
nelle migration Supabase del progetto per il dettaglio delle policy.

## Note per la produzione (GDPR)

L'app registra dati sanitari reali (sonno, frequenza cardiaca, VO2max, peso,
massimali). Prima di usarla con clienti veri:

- Far verificare/completare da un consulente privacy i testi segnaposto in
  `src/app/consenso/page.tsx` (informativa privacy e consenso al trattamento dei
  dati sulla salute, art. 9 GDPR).
- Verificare la region del progetto Supabase (deve restare in UE).
- Valutare l'attivazione di un provider email personalizzato (SMTP) in Supabase per
  l'invio affidabile delle email di impostazione password ai clienti, oltre al
  servizio email di default incluso nel piano gratuito.
