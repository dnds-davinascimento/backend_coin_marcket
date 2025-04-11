import mongoose, { Schema, Document } from "mongoose";

interface IOrder extends Document {
  order_id_Nuvem: string;
  sequencia_ideal: number;
  recibo_ideal: string;
  store_id: string;
  cpfCnpj: string;
  total: number;
  products: {
    productId: string;
    name:string;
    quantity: number;
    price: number;
    discount: number;
  }[];
  paymentDetails: {
    installments: number;
    method: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    province: string;
    zipcode: string;
  };
  status: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    order_id_Nuvem: { type: String, required: true },
    sequencia_ideal: { type: Number, required: false },
    recibo_ideal: { type: String, required: true },
    store_id: { type: String, required: true },
    cpfCnpj: { type: String, required: true },
    name: { type: String, required: true },
  
    total: { type: Number, required: true },
    products: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
      },
    ],
    paymentDetails: {
      installments: { type: Number, required: true },
      method: { type: String, required: true },
    },
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      zipcode: { type: String, required: true },
    },
    status: { type: String, default: "pendente" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
