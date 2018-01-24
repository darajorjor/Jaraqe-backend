import UserRepository from 'repositories/user.repository'
import messages from 'src/constants/defaults/messages.default'
import friendRequestTypes from 'src/constants/enums/friendRequestTypes.enum'
import status from 'src/constants/enums/status.enum'
import uuid from 'uuid/v4'

export default {
  async getUser(id, selfId) {
    let user = await UserRepository.findById(id)

    if (!user) throw new Error(messages.USER_NOT_FOUND)

    user = user.toObject()

    if (user.friends.find(i => i.toString() === selfId)) {
      user.isFriend = true
    }

    return user
  },

  async getSelfUser(id) {
    let user = await UserRepository.findById(id)
      .populate('friends')
      .populate('friendRequests.user')

    if (!user) throw new Error(messages.USER_NOT_FOUND)
    user = user.toObject()

    user.friendRequests = user.friendRequests.filter((fr) => fr.requestType === friendRequestTypes.RECEIVED && fr.status === 'PENDING')
    user.friends = user.friends.map(fr => {
      fr.isFriend = true

      return fr
    })

    return user
  },

  async addFriend(userId, targetUserId) {
    const user = await UserRepository.findById(userId)
    if (!user) throw new Error(messages.USER_NOT_FOUND)

    // checking if there is already a friend request to that user
    if (user.friendRequests.find(fr => fr.status === status.FRIEND_REQUEST.PENDING && fr.user.toString() === targetUserId)) {
      throw new Error(messages.FRIEND_REQUEST_ALREADY_SENT)
    }

    const friendRequestId = uuid()
    user.friendRequests.push({
      id: friendRequestId,
      user: targetUserId,
      requestType: friendRequestTypes.SENT,
    })

    const targetUser = await UserRepository.findById(targetUserId)
    if (!targetUser) throw new Error(messages.USER_NOT_FOUND)

    targetUser.friendRequests.push({
      id: friendRequestId,
      user: userId,
      requestType: friendRequestTypes.RECEIVED,
    })

    await targetUser.save()
    return user.save()
  },

  async removeFriend(userId, targetUserId) {
    const user = await UserRepository.findById(userId)
    if (!user) throw new Error(messages.USER_NOT_FOUND)

    user.friends = user.friends.filter(friend => friend.toString() !== targetUserId)

    const targetUser = await UserRepository.findById(targetUserId)
    if (!targetUser) throw new Error(messages.USER_NOT_FOUND)

    targetUser.friends = targetUser.friends.filter(friend => friend.toString() !== userId)

    await targetUser.save()
    return user.save()
  },

  async respondToFriendRequest(userId, friendRequestId, accept) {
    const user = await UserRepository.findById(userId)
    if (!user) throw new Error(messages.USER_NOT_FOUND)

    const friendRequestIndex = user.friendRequests.findIndex(fr => fr.id === friendRequestId)
    if (!user.friendRequests[friendRequestIndex]) throw new Error(messages.FRIEND_REQUEST_NOT_FOUND)

    const { user: targetUserId } = user.friendRequests[friendRequestIndex]
    const targetUser = await UserRepository.findById(targetUserId)

    await targetUser.respondToFriendRequest(friendRequestId, accept ? status.FRIEND_REQUEST.ACCEPTED : status.FRIEND_REQUEST.DECLINED)
    await user.respondToFriendRequest(friendRequestId, accept ? status.FRIEND_REQUEST.ACCEPTED : status.FRIEND_REQUEST.DECLINED)

    return user
  },

  async searchUsers(query, userId) {
    let results = await UserRepository.search(query)

    results = results.map(r => {
      r = r.toObject()
      if (r.friends.find(f => f.toString() === userId)) {
        r.isFriend = true
      }

      return r
    })

    return results
  },

  async registerInstagramUser({ id, full_name, bio, is_business, profile_picture, username, website, }, accessToken) {
    let user = await UserRepository.findByInstagramId(id)
    let data = {}
    data.username = username
    data.fullName = full_name
    data.avatar = profile_picture
    data.oauth = {
      instagram: {
        id,
        fullName: full_name,
        bio,
        isBusiness: is_business,
        username,
        website,
        accessToken
      }
    }

    if (!user) {
      return UserRepository.registerUser(data)
    }

    return UserRepository.findOneAndUpdate({ _id: user._id }, data)
  }
}