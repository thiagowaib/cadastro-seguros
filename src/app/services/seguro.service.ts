import { Injectable, Injector } from '@angular/core';
import { Seguro } from '../models/Seguro';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class SeguroService extends BaseService<Seguro> {

  constructor(
    protected injectorChild: Injector
  ) { 
    super(injectorChild, 'seguros', 'http://localhost:9000')
  }


  
}
