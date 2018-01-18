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
    if (user) {
      throw new Error(messages.ALREADY_REGISTERED)
    }

    user = {}
    user.avatars = [profile_picture]
    user.additional_data = {
      instagram: {
        fullName: full_name,
        bio,
        isBusiness: is_business,
        username,
        website,
        accessToken
      }
    }
    user.status = status.USER.ACTIVE
    return UserRepository.registerUser(user)
  }
}