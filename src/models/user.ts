import mongoose, { Schema, Document } from 'mongoose';

// Interface para Permissões
interface PermissionSchema {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}
// Interface para o documento do User
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  cargo?: string;
  telefone?: string;
  permissions: {
    cliente: PermissionSchema;
    };
    paymentAlert:boolean;
  user_store_id: mongoose.Schema.Types.ObjectId;
}

// Schema do usuário
const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    paymentAlert:{type:Boolean, default: false},
    cargo: {type: String, required: false},
    telefone: { type: String, required: false },


    permissions: {
      user: { type: new Schema({
          view: { type: Boolean, default: false },
          create: { type: Boolean, default: false },
          edit: { type: Boolean, default: false },
          delete: { type: Boolean, default: false }
        }) },
      product: { type: new Schema({
          view: { type: Boolean, default: false },
          create: { type: Boolean, default: false },
          edit: { type: Boolean, default: false },
          delete: { type: Boolean, default: false }
        }) },
      order: { type: new Schema({
          view: { type: Boolean, default: false },
          create: { type: Boolean, default: false },
          edit: { type: Boolean, default: false },
          delete: { type: Boolean, default: false }
        }) },
      delivery: { type: new Schema({
          view: { type: Boolean, default: false },
          create: { type: Boolean, default: false },
          edit: { type: Boolean, default: false },
          delete: { type: Boolean, default: false }
        }) },
      route: { type: new Schema({
          view: { type: Boolean, default: false },
          create: { type: Boolean, default: false },
          edit: { type: Boolean, default: false },
          delete: { type: Boolean, default: false }
        }) },
      
    },

    user_store_id: { type: Schema.Types.ObjectId, ref: 'Store',require:true },
  
  },
  { timestamps: true } // Criar campos createdAt e updatedAt
);

// Exportar o modelo
const User = mongoose.model<IUser>('User', userSchema);

export default User;
