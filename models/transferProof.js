const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProofImageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'AUser', required: true },
  request: { type: Schema.Types.ObjectId, ref: 'Request' }, // optional link
  imageUrl: { type: String, required: true }, // Cloudinary URL
  publicId: { type: String, required: true }, // Cloudinary public ID (for deletion)
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProofImage', ProofImageSchema);


