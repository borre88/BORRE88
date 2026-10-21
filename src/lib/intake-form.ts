export interface IntakeFieldOption {
  value: string;
  label: string;
}

export interface IntakeFieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "date" | "select" | "number";
  options?: IntakeFieldOption[];
}

export interface IntakeSectionDef {
  key: string;
  label: string;
  fields: IntakeFieldDef[];
}

export const INTAKE_SECTIONS: IntakeSectionDef[] = [
  {
    key: "anagrafica",
    label: "Dati anagrafici",
    fields: [
      { key: "nome", label: "Nome", type: "text" },
      { key: "cognome", label: "Cognome", type: "text" },
      { key: "data_nascita", label: "Data di nascita", type: "date" },
      {
        key: "sesso",
        label: "Sesso",
        type: "select",
        options: [
          { value: "maschio", label: "Maschio" },
          { value: "femmina", label: "Femmina" },
        ],
      },
      { key: "email", label: "Email", type: "text" },
      { key: "telefono", label: "Telefono", type: "text" },
      { key: "indirizzo", label: "Indirizzo", type: "text" },
      { key: "citta", label: "Città", type: "text" },
      { key: "cap", label: "CAP", type: "text" },
      { key: "professione", label: "Professione", type: "text" },
    ],
  },
  {
    key: "obiettivo",
    label: "Motivazioni e obiettivo",
    fields: [
      { key: "obiettivo_principale", label: "Qual è il tuo obiettivo principale?", type: "textarea" },
      { key: "note", label: "Altro che vuoi farci sapere", type: "textarea" },
    ],
  },
  {
    key: "stile_vita",
    label: "Storia e stile di vita",
    fields: [
      { key: "lavoro", label: "Che lavoro fai? È sedentario o attivo?", type: "text" },
      { key: "ore_sonno", label: "Quante ore dormi in media a notte?", type: "number" },
      { key: "livello_stress", label: "Livello di stress percepito (1-10)", type: "number" },
    ],
  },
  {
    key: "abitudini_alimentari",
    label: "Abitudini alimentari",
    fields: [
      { key: "pasti_al_giorno", label: "Quanti pasti fai al giorno?", type: "number" },
      {
        key: "dieta_particolare",
        label: "Segui una dieta particolare?",
        type: "select",
        options: [
          { value: "nessuna", label: "Nessuna" },
          { value: "vegetariana", label: "Vegetariana" },
          { value: "vegana", label: "Vegana" },
          { value: "senza_glutine", label: "Senza glutine" },
          { value: "senza_lattosio", label: "Senza lattosio" },
          { value: "altro", label: "Altro" },
        ],
      },
      { key: "cibi_preferiti", label: "Cibi che ami", type: "textarea" },
      { key: "cibi_evitati", label: "Cibi che non mangi o non ti piacciono", type: "textarea" },
    ],
  },
  {
    key: "storia_clinica",
    label: "Storia clinica e farmaci",
    fields: [
      { key: "patologie", label: "Patologie note (anche pregresse)", type: "textarea" },
      { key: "farmaci", label: "Farmaci che assumi regolarmente", type: "textarea" },
      { key: "interventi", label: "Interventi chirurgici rilevanti", type: "textarea" },
    ],
  },
  {
    key: "allergie",
    label: "Allergie e disturbi",
    fields: [
      { key: "allergie_intolleranze", label: "Allergie o intolleranze alimentari", type: "textarea" },
      { key: "disturbi_intestinali", label: "Disturbi intestinali o digestivi", type: "textarea" },
    ],
  },
  {
    key: "antropometria",
    label: "Antropometria",
    fields: [
      { key: "peso_kg", label: "Peso attuale (kg)", type: "number" },
      { key: "altezza_cm", label: "Altezza (cm)", type: "number" },
    ],
  },
  {
    key: "attivita_fisica",
    label: "Attività fisica",
    fields: [
      { key: "tipo", label: "Che tipo di attività fisica pratichi?", type: "text" },
      { key: "frequenza_settimanale", label: "Quante volte a settimana?", type: "number" },
      { key: "da_quanto", label: "Da quanto tempo ti alleni con continuità?", type: "text" },
    ],
  },
];

export interface IntakeFormData {
  anagrafica?: Record<string, string>;
  obiettivo?: Record<string, string>;
  stile_vita?: Record<string, string>;
  abitudini_alimentari?: Record<string, string>;
  storia_clinica?: Record<string, string>;
  allergie?: Record<string, string>;
  antropometria?: Record<string, string>;
  attivita_fisica?: Record<string, string>;
  consenso?: { privacy?: boolean; dati_salute?: boolean };
  [sectionKey: string]: Record<string, string> | { privacy?: boolean; dati_salute?: boolean } | undefined;
}
