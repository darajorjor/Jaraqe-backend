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

    return user.update(data)
  }
}