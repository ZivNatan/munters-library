import { TestBed } from '@angular/core/testing';
import { BooksStore } from './books.store';
import { BooksService } from '../../core/services/books.service';
import { Book } from '../../core/models/book.model';
import { BehaviorSubject } from 'rxjs';

class BooksServiceMock {
  private subj = new BehaviorSubject<Book[]>([]);
  books$ = this.subj.asObservable();

  // signals in real service — here keep simple
  isLoading = () => false as any;
  loadError = () => null as any;

  initInitialBooks() {}

  setBooks(list: Book[]) {
    this.subj.next(list);
  }

  add() {}
  update() {}
  delete() {}
}

describe('BooksStore', () => {
  let facade: BooksStore;
  let booksService: BooksServiceMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BooksStore,
        { provide: BooksService, useClass: BooksServiceMock },
      ],
    });

    facade = TestBed.inject(BooksStore);
    booksService = TestBed.inject(BooksService) as unknown as BooksServiceMock;
  });

  it('filters by title (case-insensitive)', () => {
    booksService.setBooks([
      { id: '1', title: 'Angular Basics', author: 'A', publicationDate: 2020 },
      { id: '2', title: 'React Guide', author: 'B', publicationDate: 2021 },
    ]);

    facade.searchCtrl.setValue('angular');

    expect(facade.filteredBooks().map((b: Book) => b.id)).toEqual(['1']);
  });

  it('sorts by publicationDate desc', () => {
    booksService.setBooks([
      { id: '1', title: 'A', author: 'A', publicationDate: 2020 },
      { id: '2', title: 'B', author: 'B', publicationDate: 2022 },
      { id: '3', title: 'C', author: 'C', publicationDate: 2021 },
    ]);

    facade.setSortKey('publicationDate');
    facade.toggleSortDir(); // default asc -> desc

    expect(facade.sortedBooks().map((b: Book) => b.id)).toEqual(['2', '3', '1']);
  });

  it('paginates results based on pageSize/pageIndex', () => {
    booksService.setBooks(
      Array.from({ length: 10 }).map((_, i) => ({
        id: String(i + 1),
        title: `T${i + 1}`,
        author: 'A',
        publicationDate: 2020,
      }))
    );

    facade.setPageSize(6);
    expect(facade.totalPages()).toBe(2);

    expect(facade.pagedBooks().length).toBe(6);

    facade.nextPage();
    expect(facade.pagedBooks().map((b:Book) => b.id)).toEqual(['7', '8', '9', '10']);
  });
});
