import { Routes } from '@angular/router';
import { BooksListPageComponent } from './pages/books-list-page/books-list-page.component';
import { BookDetailsPageComponent } from './components/book-details-page/book-details-page.component';

export const BOOKS_ROUTES: Routes = [
  { path: '', component: BooksListPageComponent },
  { path: ':id', component: BookDetailsPageComponent },
];
