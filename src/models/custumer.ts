import mongoose, { Schema, Document, Types } from 'mongoose';
import { enderecoSchema, IEndereco } from "./endereco";

// Interface para o valor de compras mensais
interface IMonthlyPurchase {
    month: Date;
    amount: number;
}

// Interface para o histórico de transações
interface ITransactionHistory {
    date: Date;
    amount: number;
    type: string;
    description: string;
    user?: string;
}

// Interface principal do Customer
interface ICustomer extends Document {
    name: string;
    email?: string;
    password: string; // Senha do cliente (opcional, se necessário)
    type?: string;
    indicador_IE?: number; // Indicador IE
    phone?: string;
    taxId?: string; // CPF/CNPJ
    stateRegistration?: string; // Inscrição Estadual
    tier?: string; // Nível do cliente
    monthlyPurchases: IMonthlyPurchase[];
    creditBalance: number;
    transactionHistory: ITransactionHistory[];
    cashbackBalance: number;
    store: Types.ObjectId; // Referência à loja
    endereco: IEndereco[]; // Array de endereços
    createdAt: Date;
    updatedAt: Date;
    thumbnail?:{
        url: string;
        key?: string;
      }; // URL da imagem do cliente
}

const monthlyPurchaseSchema = new Schema<IMonthlyPurchase>({
    month: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
});

const transactionHistorySchema = new Schema<ITransactionHistory>({
    date: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    user: {
        type: String
    }
});

const customerSchema = new Schema<ICustomer>({
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    thumbnail: {
        key: {
          type: String,
          required: false,
        },
        url: {
          type: String,
          required: false,
        },
      },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        trim: true,
        select: false // Não retornar a senha por padrão
    },
    type: {
        type: String,
        enum: ['individual', 'company'],
        default: 'individual'
    },
    indicador_IE: {
        type: Number,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    taxId: {
        type: String,
        trim: true
    },
    stateRegistration: {
        type: String,
        trim: true
    },
    tier: {
        type: String,
        enum: ['regular', 'premium', 'vip'],
        default: 'regular'
    },
    monthlyPurchases: [monthlyPurchaseSchema],
    creditBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    transactionHistory: [transactionHistorySchema],
    cashbackBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    endereco: [enderecoSchema], // Array de endereços
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Índices para melhor performance
customerSchema.index({ name: 1 });
customerSchema.index({ email: 1 }, { unique: true, sparse: true });
customerSchema.index({ taxId: 1 }, { unique: true, sparse: true });
customerSchema.index({ store: 1 });

const Customer = mongoose.model<ICustomer>('Customer', customerSchema);

export {
    Customer,
    customerSchema,
    ICustomer,
    IMonthlyPurchase,
    ITransactionHistory
};