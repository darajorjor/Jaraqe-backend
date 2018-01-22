import uuid from 'uuid/v4'
import mongoose from 'src/dao/connections/mongo'
import statuses from 'src/constants/enums/status.enum'
import genderTypes from 'src/constants/enums/genderTypes.enum'
import friendRequestTypes from 'src/constants/enums/friendRequestTypes.enum'
import messages from 'src/constants/defaults/messages.default'

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
    enum: Object.values(statuses.USER),
    default: statuses.USER.ACTIVE,
  },
  lastOnline: Date,
  oauth: {
    instagram: {},
  },
  friends: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    allowNull: false,
  }],
  friendRequests: [{
    _id: false,
    id: {
      type: String,
      allowNull: false,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      allowNull: false,
    },
    requestType: {
      type: String,
      enum: Object.values(friendRequestTypes)
    },
    status: {
      type: String,
      enum: Object.values(statuses.FRIEND_REQUEST),
      default: statuses.FRIEND_REQUEST.PENDING
    }
  }],
}, { timestamps: true });

UserSchema.methods = {
  respondToFriendRequest(friendRequestId, status) {
    const targetUserFriendRequestIndex = this.friendRequests.findIndex(fr => fr.id === friendRequestId)
    if (!this.friendRequests[targetUserFriendRequestIndex]) throw new Error(messages.FRIEND_REQUEST_NOT_FOUND)

    this.friendRequests[targetUserFriendRequestIndex].status = status

    if (status === statuses.FRIEND_REQUEST.ACCEPTED) {
      this.friends.push(this.friendRequests[targetUserFriendRequestIndex].user)
    }

    return this.save()
  },
}

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
