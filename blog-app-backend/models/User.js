import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({

  username: { type: String, unique: true, sparse: true },
  password: { type: String },
  isAdmin: { type: Boolean, default: false },

  //google auth info
  googleId: { type: String, unique: true, sparse: true },
  displayName: String,
  email: String,
  profilePic: String

});



//checking if password is changed, only then hash
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});


export default mongoose.model('User', userSchema);
