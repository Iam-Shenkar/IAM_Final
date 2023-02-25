const {
  Schema,
  model,
} = require('mongoose');

const accountSchema = new Schema({
  name: {
    type: String,
    required: true,
    immutable: true,
  },
  plan: {
    type: String,
    default: 'free',
  },
  creationDate: {
    type: Date,
    default: new Date(),
  },
  suspensionTime: {
    type: Number,
    default: 0,
  },
  suspensionDate: {
    type: Date,
    default: 0,
  },
  status: {
    type: String,
    default: 'pending',
  },
  assets: {
    credits: {
      type: Number,
      default: 0,
    },
    seats: {
      type: Number,
      default: 0,
    },
    usedSeats: {
      type: Number,
      default: 0,
    },
    features: [String],
  },
  toggle: {
    type: String,
    default: 'inclusive',
    enum: ['inclusive', 'exclusive'],
    required: true,
  },
}, { collection: 'account' });

const account = model('account', accountSchema);

module.exports = account;
