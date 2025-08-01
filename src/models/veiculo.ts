//modells de Veiculo
import { Schema, model, Document } from 'mongoose';
interface IVeiculo extends Document {
    placa: string;
    modelo: string;
    ano: number;
    cor: string;
    status: 'disponivel' | 'em_transporte' | 'manutencao';
    nome: string;
    capacidadePeso: number; // em kg
    capacidadeVolume: number; // em m³
    createdAt: Date;
    updatedAt: Date;
}

const veiculoSchema = new Schema<IVeiculo>({
    placa: { type: String, required: true, unique: true },
    modelo: { type: String, required: true },
    ano: { type: Number, required: true },
    cor: { type: String, required: true },
    status: {
        type: String,
        enum: ['disponivel','em_transporte', 'manutencao'],
        default: 'disponivel'
    },
    nome: { type: String, required: true },
    capacidadePeso: { type: Number, required: true }, // em kg
    capacidadeVolume: { type: Number, required: true }, // em m³
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Veiculo = model<IVeiculo>('Veiculo', veiculoSchema);
export default Veiculo;
export { IVeiculo }; // Exportando a interface para uso em outros arquivos