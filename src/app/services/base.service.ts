import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OnlineOfflineService } from './online-offline.service';
import { Observable } from 'rxjs';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseService<T extends {id:string}> {

  private db!: Dexie;
  private table!: Dexie.Table<T, any>;

  protected http: HttpClient
  protected onlineOfflineServiceService: OnlineOfflineService

  constructor(
    protected injector: Injector,
    protected nomeTabela: string,
    protected urlAPI: string,
  ) { 
    this.http = this.injector.get(HttpClient);
    this.onlineOfflineServiceService = this.injector.get(OnlineOfflineService);

    this.ouvirStatusConexao();
    this.iniciarIndexedDb();
  }

  private iniciarIndexedDb() {
    this.db = new Dexie('db-seguros');
    this.db.version(1).stores({
      [this.nomeTabela]: 'id'
    });
    this.table = this.db.table(this.nomeTabela);
  }

  // Salva registro pela API
  private cadastrarAPI(tabela: T) {
    this.http.post(this.urlAPI + `/api/${this.nomeTabela}`, tabela)
        .subscribe({
          complete() {
            alert("Registro cadastrado com sucesso");
          },
          error(err) {
            console.error("Erro ao cadastrar registro", err);
          }  
        });
  }

  // Salva registro no IndexedDb
  private async cadastrarIndexedDb(tabela: T) {
    try{
      await this.table.add(tabela);
      const todosTabelas: T[] = await this.table.toArray();
      console.log("Registro salvo no IndexedDb", todosTabelas);
    }catch(err){
      console.error("Erro ao incluir registro no IndexedDb", err);
    }
  }

  // Envia os registros que estão no IndexedDb para API
  // E depois remove-os do IndexedDb
  private async enviarIndexedDbParaApi() {
    const todosTabelas: T[] = await this.table.toArray();

    todosTabelas.forEach(async (tabela) => {
      this.cadastrarAPI(tabela);
      await this.table.delete(tabela.id);
      console.log(`Registro com o id: ${tabela.id} foi excluido do IndexedDb com sucesso.`);
    });
  }


  // Verifica se é necessário salvar o registro na API ou no IndexedDb
  public cadastrar(tabela: T) {
    if(this.onlineOfflineServiceService.isOnline) {
      this.cadastrarAPI(tabela);
    } else {
      this.cadastrarIndexedDb(tabela);
    }
  }

  // Lista os registros salvos na API e no IndexedDb
  public listar(): Observable<T[]>{
    return this.http.get<T[]>(this.urlAPI + `/api/${this.nomeTabela}`);
  }

  // Detecta se há conexão ou não
  private ouvirStatusConexao():void {
    this.onlineOfflineServiceService.statusConexao
        .subscribe((online:any) => {
              if(online) {
                this.enviarIndexedDbParaApi();
              } else {
                console.warn("Sem Conexão com API");
              }
          }
        )
  }
}
