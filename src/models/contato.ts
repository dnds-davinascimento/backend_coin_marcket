/* models para credenciar idealsoft */
import mongoose, { Schema, Document } from "mongoose";

export interface Contato extends Document {
    nome: string;
    email: string;
    telefone: string;
    assunto: string;
    mensagem: string;
}

const contatoSchema: Schema = new Schema({

    nome: { type: String, required: true },
    email: { type: String, required: true },
    telefone: { type: String, required: true },
    assunto: { type: String, required: true },
    mensagem: { type: String, required: true },
});

export default mongoose.model<Contato>("contato", contatoSchema);
