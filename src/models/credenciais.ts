/* models para credenciar idealsoft */
import mongoose, { Schema, Document } from "mongoose";

export interface Credenciais extends Document {
  api: string;
  serie: string;
  codFilial: string;
  senha: string;
  credencial_user_id: string;
}

const credenciaisSchema: Schema = new Schema({
  credencial_user_id: { type: Schema.Types.ObjectId, ref: "CredencialUser", required: true },
  api: { type: String, required: true },
  serie: { type: String, required: true },
  codFilial: { type: String, required: true },
  senha: { type: String, required: true },
});

export default mongoose.model<Credenciais>("Credenciais", credenciaisSchema);
