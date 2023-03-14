import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { MarcaCarro } from '../models/MarcaCarro';

interface CarResponse {
  Makes: Array<any>;
}

@Injectable({
  providedIn: 'root'
})
export class MarcaCarroService {

  private API_CARROS = 'https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getMakes';
  constructor(
    private http: HttpClient
  ) { }

  private mapMarcas(marcas: any): MarcaCarro[] {
    return marcas.map((marca: any) => ({
        codigo: marca.make_id,
        nome: marca.make_display
    }))
  }

  public getMarcas(ano:string='2017') {
    return this.http.jsonp(this.API_CARROS+'&year='+ano, 'callback')
                    .pipe(
                      map((res: any) => this.mapMarcas(res.Makes))
                    )
  }
}
