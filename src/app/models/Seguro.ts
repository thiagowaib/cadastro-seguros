import { MarcaCarro } from "./MarcaCarro";

export class Seguro {
    // Dados Carro
    marcaCarro!: MarcaCarro;
    modeloCarro!: string;
    placaCarro!: string;

    // Dados Proprietário
    nomeProprietario!: string;
    sobrenomeProprietario!: string;
    dataNascimentoProprietario!: string;
}