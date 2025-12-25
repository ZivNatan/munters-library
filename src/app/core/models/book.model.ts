export interface Book {
  id: string;
  title: string;
  author: string;
  publicationDate: number; // year
  description?: string;
  isCheckedOut?: boolean; 
  catalogNumber?: number; 

}
