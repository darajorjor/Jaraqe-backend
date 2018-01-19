import uuid from 'uuid/v4'
import mongoose from 'src/dao/connections/mongo'
import status from 'src/constants/enums/status.enum'
import genderTypes from 'src/constants/enums/genderTypes.enum'

const UserSchema = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  fullName: String,
  gender: {
    type: Boolean,
    enum: Object.values(genderTypes)
  },
  avatar: String,
  session: {
    index: true,
    trim: true,
    sparse: true,
    default: uuid,
    type: String,
    unique: true,
    allowNull: false,
  },
  email: String,
  phone: String,
  status: {
    type: String,
    enum: Object.values(status.USER),
    default: status.USER.ACTIVE,
  },
  lastOnline: Date,
  oauth: {
    instagram: {},
  }
}, { timestamps: true });

UserSchema.pre('save', function (next) {
  if (!this.fullName && this.oauth.instagram.fullName) {
    this.fullName = this.oauth.instagram.fullName
  }
  if (!this.username && this.oauth.instagram.username) {
    this.username = this.oauth.instagram.username
  }

  next()
})

const User = mongoose.model('User', UserSchema)

export default User;
