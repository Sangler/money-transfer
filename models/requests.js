const RequestSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'AUser', required: true }, // who made request
  fromCurrency: { type: String, required: true },  // e.g. CAD
  toCurrency: { type: String, required: true },    // e.g. VND
  amountSent: { type: Number, required: true },
  amountReceived: { type: Number },
  exchangeRate: { type: Number }, // snapshot at request time
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed'], 
    default: 'pending' 
  },
  admin: { type: Schema.Types.ObjectId, ref: 'Admin' }, // who approved/rejected
  proofImage: { type: Schema.Types.ObjectId, ref: 'ProofImage' }, // link to Cloudinary storage
  notes: String, // admin notes or rejection reason
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', RequestSchema);
