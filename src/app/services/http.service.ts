import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient
  ) { }

  public post(url: string, params, options = {}): Observable<any> {
    options = {
      ...options,
      headers: new HttpHeaders({
        'user-key': 'f46de8e48c904f11d18e5b432e96933f',
        Accept: 'application/json',
      })
    }
    return this.http.post(url, params, options)
  }
}
