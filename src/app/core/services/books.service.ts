import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, finalize, catchError, of, take } from 'rxjs';
import { Book } from '../models/book.model';
import initialBooks from '../data/books.json';
import { OpenLibraryApiService } from './open-library-api.service';


@Injectable({ providedIn: 'root' })
export class BooksService {
  private readonly booksSubject = new BehaviorSubject<Book[]>([]);
  readonly books$ = this.booksSubject.asObservable();
  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);


  private initialized = false;

  constructor(private readonly api: OpenLibraryApiService) {}

initInitialBooks() {
  if (this.initialized) return;
  this.initialized = true;

  this.isLoading.set(true);
  this.loadError.set(null);

  const query = 'software';

  this.api.search(query, 30).pipe(
    take(1),
    catchError((err) => {
      this.loadError.set('Failed to load books from API. Using local data.');
      return of((initialBooks as Book[]).map(b => ({ ...b })));
    }),
    finalize(() => this.isLoading.set(false))
  ).subscribe((books) => {
    const safe = books?.length ? books : (initialBooks as Book[]).map(b => ({ ...b }));
    this.booksSubject.next(safe);
  });
}


  getSnapshot(): Book[] {
    return this.booksSubject.value;
  }

  getById(id: string): Book | undefined {
    return this.booksSubject.value.find(b => b.id === id);
  }

  add(book: Book): void {
    this.booksSubject.next([...this.booksSubject.value, book]);
  }

  update(book: Book): void {
    this.booksSubject.next(this.booksSubject.value.map(b => (b.id === book.id ? book : b)));
  }

  delete(id: string): void {
    this.booksSubject.next(this.booksSubject.value.filter(b => b.id !== id));
  }

  toggleCheckout(id: string): void {
    this.booksSubject.next(
      this.booksSubject.value.map(b => b.id === id ? { ...b, isCheckedOut: !b.isCheckedOut } : b)
    );
  }
}
