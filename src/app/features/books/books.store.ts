import { Injectable, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { BooksService } from '../../core/services/books.service';
import { Book } from '../../core/models/book.model';

@Injectable()
export class BooksStore {
  private readonly booksService = inject(BooksService);

  // UI state
  readonly isLoading = this.booksService.isLoading;
  readonly loadError = this.booksService.loadError;

  readonly searchCtrl = new FormControl<string>('', { nonNullable: true });

  readonly sortKey = signal<'author' | 'publicationDate' | 'catalogNumber'>('author');
  readonly sortDir = signal<'asc' | 'desc'>('asc');

  readonly pageSize = signal(50);
  readonly pageIndex = signal(0);

  readonly isFormOpen = signal(false);
  readonly editingBook = signal<Book | null>(null);

  // derived state
  private readonly filteredBooks$ = combineLatest([
    this.booksService.books$,
    this.searchCtrl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([books, search]) => {
      const q = search.trim().toLowerCase();
      if (!q) return books;
      return books.filter(b => b.title.toLowerCase().includes(q));
    })
  );

  readonly filteredBooks = toSignal(this.filteredBooks$, { initialValue: [] as Book[] });

  readonly sortedBooks = computed(() => {
    const key = this.sortKey();
    const dir = this.sortDir();
    const copy = [...this.filteredBooks()];

    copy.sort((a: any, b: any) => {
      const av = a[key] ?? '';
      const bv = b[key] ?? '';
      if (av < bv) return dir === 'asc' ? -1 : 1;
      if (av > bv) return dir === 'asc' ? 1 : -1;
      return 0;
    });

    return copy;
  });

  readonly totalPages = computed(() => {
    const total = this.sortedBooks().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });

  readonly pagedBooks = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.sortedBooks().slice(start, start + this.pageSize());
  });

  constructor() {
    this.booksService.initInitialBooks();
  }

  // UI actions
  openAdd() {
    this.editingBook.set(null);
    this.isFormOpen.set(true);
  }

  openEdit(book: Book) {
    this.editingBook.set(book);
    this.isFormOpen.set(true);
  }

  closeForm() {
    this.isFormOpen.set(false);
    this.editingBook.set(null);
  }

  saveBook(book: Book) {
    if (this.editingBook()) this.booksService.update(book);
    else this.booksService.add(book);

    this.closeForm();
  }

  setSortKey(v: 'author' | 'publicationDate' | 'catalogNumber') {
    this.sortKey.set(v);
    this.pageIndex.set(0);
  }

  toggleSortDir() {
    this.sortDir.update(d => (d === 'asc' ? 'desc' : 'asc'));
    this.pageIndex.set(0);
  }

  setPageSize(v: number) {
    this.pageSize.set(v);
    this.pageIndex.set(0);
  }

  nextPage() {
    this.pageIndex.update(i => Math.min(i + 1, this.totalPages() - 1));
  }

  prevPage() {
    this.pageIndex.update(i => Math.max(0, i - 1));
  }

  deleteBook(id: string) {
    this.booksService.delete(id);
  }

  toggleCheckedOut(book: Book) {
    const updated: Book = { ...book, isCheckedOut: !book.isCheckedOut };
    this.booksService.update(updated);
  }
}
