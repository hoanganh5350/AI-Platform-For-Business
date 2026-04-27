export interface BusinessDataForm {
  businessName: string;
  representative?: string;
  contact?: string;
  industry?: string;
  website?: string;
  description: string;
  goal?: string;
}

export interface UIBlockForm {
  name: string;
  parent?: string;
  description?: string;
  _id?: string;
}
