import UserRepository from 'repositories/user.repository'
import messages from 'src/constants/defaults/messages.default'
import status from 'src/constants/enums/status.enum'

export default {
  async registerInstagramUser({
                                id,
                                full_name,
                                bio,
                                is_business,
                                profile_picture,
                                username,
                                website,
                              }, accessToken) {
    let user = await UserRepository.findByInstagramId(id)
    let data = {}
    data.username = username
    data.fullName = full_name
    data.avatar = profile_picture
    data.oauth = {
      instagram: {
        fullName: full_name,
        bio,
        isBusiness: is_business,
        username,
        website,
        accessToken
      }
    }

    if (!user) {
      data.oauth.instagram.id = id
      return UserRepository.registerUser(data)
    }

    return UserRepository.findOneAndUpdate(user._id, data)
  }
}