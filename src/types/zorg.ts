export interface ZorgDefinition {
  term_fr: string;
  term_nl: string;
  uitleg: string;
  url: string;
}

export interface ZorgContact {
  naam: string;
  nummer: string;
  email?: string;
  details: string;
  tijden: string;
}

export interface ZorgCategory {
  id: string;
  label_nl: string;
  label_fr: string;
  description: string;
  related_definitions: string[];
  related_contacts: string[];
}

export interface ZorgData {
  categories: ZorgCategory[];
  definitions: Record<string, ZorgDefinition>;
  contacten: Record<string, ZorgContact>;
  annuaires: Record<string, { naam: string; url: string; uitleg: string }>;
}
