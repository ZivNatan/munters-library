import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { Book } from '../models/book.model';

type OpenLibrarySearchResponse = {
  docs: Array<{
    key?: string;
    title?: string;
    author_name?: string[];
    first_publish_year?: number;
  }>;
};

@Injectable({ providedIn: 'root' })
export class OpenLibraryApiService {
  private readonly baseUrl = 'https://openlibrary.org';

  constructor(private readonly http: HttpClient) {}

  /** Search books and map them into our Book model */
  search(query: string, limit = 30) {
    const params = new HttpParams()
      .set('q', query) 
      .set('limit', String(limit));

    return this.http
      .get<OpenLibrarySearchResponse>(`${this.baseUrl}/search.json`, { params })
      .pipe(
        map(res =>
          (res.docs ?? [])
            .filter(d => !!d.title)
            .map((d, idx): Book => ({
              id: (d.key?.replace('/works/', '') ?? `ol-${query}-${idx}`),
              title: d.title ?? 'Unknown title',
              author: d.author_name?.[0] ?? 'Unknown author',
              publicationDate: d.first_publish_year ?? 0,
    
            }))
        )
      );
  }
}
