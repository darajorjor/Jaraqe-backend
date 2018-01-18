import uuidV4 from 'uuid/v4'
import { Device, UserDevice } from 'models'
import status from 'src/constants/enums/status.enum'

export default {

  async findDevice({ uniqueId, type }) {
    return Device.findOne({ where: { unique_id: uniqueId, type } })
  },

  async findByToken(token) {
    return Device.findOne({ where: { token } })
  },

  async createDevice({ uniqueId, type, appVersion, deviceInfo }) {
    const device = Device.build({
      unique_id: uniqueId,
      type,
      token: uuidV4(),
      device_info: deviceInfo,
      app_version: appVersion,
      additional_data: {
        versionHistory: [{
          appVersion,
          date: new Date(),
        }],
      },
    })
    return device.save()
  },

  async updateDevice({ deviceId, updateData }) {
    const res = await Device.update(updateData, { where: { id: deviceId }, returning: true })
    return res[1][0]
  },

  async disableUserDevice({ userId, deviceId }) {
    const res = await UserDevice.update(
      { status: status.USER_DEVICE.INACTIVE },
      { where: { user_id: userId, device_id: deviceId }, returning: true })
    return res[1][0]
  },

}
