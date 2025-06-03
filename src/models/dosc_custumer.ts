import mongoose, { Schema, Document, Types } from 'mongoose';

interface DocumentoArquivo {
  url: string;
  key: string;
}

export interface DocumentCustomer extends Document {
  customer_id: Types.ObjectId;
  name: string;
  email?: string;
  status?: string;
  rg_frente?: DocumentoArquivo;
  rg_verso?: DocumentoArquivo;
  cnh_frente?: DocumentoArquivo;
  cnh_verso?: DocumentoArquivo;
  comprovante_residencia?: DocumentoArquivo;
  contrato_social?: DocumentoArquivo;
  createdAt: Date;
  updatedAt: Date;
}

const documentCustomerSchema = new Schema<DocumentCustomer>({
  customer_id: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  name: { type: String, required: true },
  email: { type: String },
  status: { type: String, default: 'em análise',num:['em análise', 'aprovado', 'reprovado'] },
  rg_frente: {
    url: String,
    key: String
  },
  rg_verso: {
    url: String,
    key: String
  },
  cnh_frente: {
    url: String,
    key: String
  },
  cnh_verso: {
    url: String,
    key: String
  },
  comprovante_residencia: {
    url: String,
    key: String
  },
  contrato_social: {
    url: String,
    key: String
  }
}, {
  timestamps: true
});

const DocumentCustomerModel = mongoose.model<DocumentCustomer>('DocumentCustomer', documentCustomerSchema);
export default DocumentCustomerModel;
