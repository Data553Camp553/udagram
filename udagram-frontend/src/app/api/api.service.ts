import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpRequest,
  HttpEvent,
} from "@angular/common/http";
import { environment } from "../../environments/environment";
import { map } from "rxjs/operators";

const API_HOST = environment.apiHost;

@Injectable({
  providedIn: "root",
})
export class ApiService {
  httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  token: string;

  constructor(private readonly _http: HttpClient) {}

  static handleError(error: Error) {
    alert(error.message);
  }

  setAuthToken(token) {
    this.httpOptions.headers = this.httpOptions.headers.append(
      "Authorization",
      `jwt ${token}`
    );
    this.token = token;
  }

  get(endpoint): Promise<any> {
    const url = `${API_HOST}${endpoint}`;
    const req = this._http.get(url, this.httpOptions);

    return req.toPromise().catch((e) => {
      ApiService.handleError(e);
      throw e;
    });
  }

  post(endpoint, data): Promise<any> {
    const url = `${API_HOST}${endpoint}`;
    return this._http
      .post<HttpEvent<any>>(url, data, this.httpOptions)
      .toPromise()
      .catch((e) => {
        ApiService.handleError(e);
        throw e;
      });
  }

  async upload(endpoint: string, file: File, payload: any): Promise<any> {
    const signed_url = (await this.get(`${endpoint}/signed-url/${file.name}`))
      .url;

    const headers = new HttpHeaders({ "Content-Type": file.type });
    const req = new HttpRequest("PUT", signed_url, file, {
      headers: headers,
      reportProgress: true, // track progress
    });
    return new Promise((resolve) => {
      this._http.request(req).subscribe((resp) => {
        if (resp && (<any>resp).status && (<any>resp).status === 200) {
          resolve(this.post(endpoint, payload));
        }
      });
    });
  }
}
