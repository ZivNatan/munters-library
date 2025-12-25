import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { BookFormComponent } from '../../components/book-form/book-form.component';
import { BooksStore } from '../../books.store';

@Component({
  selector: 'app-books-list-page',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, BookFormComponent],
  providers: [BooksStore],
  templateUrl: './books-list-page.component.html',
  styleUrl: './books-list-page.component.scss',
})
export class BooksListPageComponent {
  readonly vm = inject(BooksStore);
  private readonly router = inject(Router);

  goToDetails(id: string) {
    this.router.navigate(['/books', id]);
  }
}
