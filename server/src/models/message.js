import mongoose from 'mongoose';
const Schema = mongoose.Schema;

let MessageSchema = new Schema({
  text:{
    type: String
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  createdAt: {
    type: Schema.Types.Date,
    default: Date.now()
  }
})

MessageSchema.pre('find', async (next) => {
  // console.log('message findAll');
  next()
})

export default mongoose.model('message', MessageSchema);