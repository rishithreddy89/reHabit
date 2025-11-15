import mongoose from 'mongoose';

const shopItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['theme', 'skin', 'accessory', 'effect'], 
    required: true 
  },
  price: { type: Number, required: true },
  icon: { type: String, required: true },
  rarity: { 
    type: String, 
    enum: ['common', 'rare', 'epic', 'legendary'], 
    default: 'common' 
  },
  levelRequired: { type: Number, default: 1 },
  isAvailable: { type: Boolean, default: true },
  preview: String, // Preview image or animation
  colors: {
    primary: String,
    secondary: String,
    accent: String
  }
}, {
  timestamps: true
});

export default mongoose.model('ShopItem', shopItemSchema);
