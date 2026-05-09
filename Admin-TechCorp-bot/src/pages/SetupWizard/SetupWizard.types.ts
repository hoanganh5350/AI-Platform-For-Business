
export interface BusinessDataForm {
  businessName: string;
  representative?: string;
  email?: string;
  phone?: string;
  industry?: string;
  website?: string;
  description: string;
  goal?: string;
  /** Dynamic extra fields added by admin: { [id]: value } */
  customFields?: Record<string, string>;
  /** Title mapping for each custom field: { [id]: title } */
  customFieldTitles?: Record<string, string>;
}

export interface UIBlockForm {
  name: string;
  parent?: string;
  description?: string;
  /** Absolute URL / deeplink to this feature */
  absoluteUrl?: string;
  _id?: string;
}
