import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, distinctUntilChanged } from 'rxjs';
import { BooksService } from '../../../../core/services/books.service';
import { Book } from '../../../../core/models/book.model';
import { signal } from '@angular/core';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { BookFormComponent } from '../book-form/book-form.component';

@Component({
  selector: 'app-book-details-page',
  standalone: true,
  imports: [ModalComponent, BookFormComponent],
  templateUrl: './book-details-page.component.html',
  styleUrl: './book-details-page.component.scss',
})
export class BookDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly booksService = inject(BooksService);

  readonly books = toSignal(this.booksService.books$, {
    initialValue: [] as Book[],
  });

  private readonly bookId$ = this.route.paramMap.pipe(
    map(pm => pm.get('id') ?? ''),
    distinctUntilChanged()
  );

  readonly bookId = toSignal(this.bookId$, { initialValue: '' });

  readonly book = computed<Book | null>(() => {
    const id = this.bookId();
    if (!id) return null;

    return this.books().find(b => b.id === id) ?? null;
  });

  readonly isEditOpen = signal(false);
  readonly isLoading = this.booksService.isLoading;


   constructor() {
    this.booksService.initInitialBooks();
  }

  openEdit() {
    if (!this.book()) return;
    this.isEditOpen.set(true);
  }

  closeEdit() {
    this.isEditOpen.set(false);
  }

  saveEditedBook(updated: Book) {
    this.booksService.update(updated);
    this.closeEdit();
  }


  back() {
    this.router.navigate(['/books']);
  }

  delete() {
    const b = this.book();
    if (!b) return;
    this.booksService.delete(b.id);
    this.back();
  }

  toggleCheckout() {
    const b = this.book();
    if (!b) return;
    this.booksService.toggleCheckout(b.id);
  }
}
