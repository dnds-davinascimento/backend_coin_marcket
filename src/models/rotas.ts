// src/models/rotas.ts
import mongoose, { Schema, Document } from "mongoose";
export interface IRota extends Document  {
    numero: string;
    motorista: {
        nome: string;
        id: string;
    }
    veiculo: {
        id: string;
        nome: string;
        placa: string;
        modelo: string;
        cor: string;
        ano: number;
    };
    link_da_Rota_maps?: string;
    data: Date;
    entregas: {
        id: string;
        nome: string;
        descricao: string;
        numero_nf: string;
        sequencia: number;
        status_entrega: 'pendente' | 'em_transporte' | 'entregue' | 'devolvido' | 'cancelada';
        link_da_localizacao?: string;
        endereco_entrega: {
            logradouro: string;
            numero: string;
            bairro: string;
            descricaoCidade: string;
            estado: string;
            cep: string;
        };
    }[];
    status: 'pendente' | 'em_transporte' | 'concluida' | 'cancelada';
    createdAt: Date;
    updatedAt: Date;
}



const rotaSchema = new Schema<IRota>({
    motorista: {
        nome: { type: String, required: true },
        id: { type: String, required: true }
    },
    data: { type: Date, required: true },
    link_da_Rota_maps: { type: String },
    numero: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    entregas: [{
        id: { type: String, required: true },
        nome: { type: String, required: true },
        descricao: { type: String, required: true },
        sequencia: { type: Number, required: true },
        status_entrega: {
            type: String,
            enum: ['pendente', 'em_transporte', 'entregue', 'devolvido', 'cancelada'],
            default: 'pendente'
        },
        link_da_localizacao: { type: String },
        endereco_entrega: {
            logradouro: { type: String, required: true },
            numero: { type: String, required: true },
            bairro: { type: String, required: true },
            descricaoCidade: { type: String, required: true },
            estado: { type: String, required: true },
            cep: { type: String, required: true }
        }
    }],
    status: {
        type: String,
        enum: ['pendente', 'em_transporte', 'concluida', 'cancelada'],
        default: 'pendente'
    }
}, {
    timestamps: true
});


const RotaStoreModel = mongoose.model<IRota>('RotaStore', rotaSchema);
export default RotaStoreModel;
