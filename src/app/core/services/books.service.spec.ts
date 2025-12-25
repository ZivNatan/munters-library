import { TestBed } from '@angular/core/testing';
import { filter, of, take, throwError } from 'rxjs';
import { BooksService } from './books.service';
import { OpenLibraryApiService } from './open-library-api.service';
import { Book } from '../models/book.model';

describe('BooksService (with API init)', () => {
  let service: BooksService;

  const apiMock = {
    search: jasmine.createSpy('search'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BooksService,
        { provide: OpenLibraryApiService, useValue: apiMock },
      ],
    });

    service = TestBed.inject(BooksService);
    apiMock.search.calls.reset();
  });

it('should load initial books from API and stop loading', (done) => {
  const apiBooks: Book[] = [
    { id: '1', title: 'A', author: 'X', publicationDate: 2020, isCheckedOut: false },
  ];

  apiMock.search.and.returnValue(of(apiBooks));

  service.initInitialBooks();

  expect(apiMock.search).toHaveBeenCalled();
  expect(service.isLoading()).toBeFalse();
  expect(service.loadError()).toBeNull();

  service.books$.subscribe((books) => {
    if (books.length) {
      expect(books).toEqual(apiBooks);
      done();
    }
  });
});


it('should fallback to local JSON when API fails and set loadError', (done) => {
  apiMock.search.and.returnValue(throwError(() => new Error('boom')));

  service.initInitialBooks();

  expect(apiMock.search).toHaveBeenCalledTimes(1);
  expect(service.isLoading()).toBeFalse();
  expect(service.loadError()).toContain('Failed to load books');

  service.books$
    .pipe(
      filter((books) => books.length > 0),
      take(1)
    )
    .subscribe((books) => {
      expect(books.length).toBeGreaterThan(0);
      done();
    });
});
;


  it('should not call API twice if initInitialBooks called multiple times', () => {
    apiMock.search.and.returnValue(of([]));

    service.initInitialBooks();
    service.initInitialBooks();
    service.initInitialBooks();

    expect(apiMock.search).toHaveBeenCalledTimes(1);
  });
});
