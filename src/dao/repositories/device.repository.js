import uuidV4 from 'uuid/v4'
import { Device } from 'models'

export default {
  async findDevice({ uniqueId, type }) {
    return Device.findOne({ unique_id: uniqueId, type })
  },

  async findByToken(token) {
    return Device.findOne({ token })
  },

  async createDevice({ uniqueId, type, appVersion, deviceInfo }) {
    const device = new Device({
      uniqueId: uniqueId,
      type,
      token: uuidV4(),
      deviceInfo: deviceInfo,
      appVersion: appVersion,
      versionHistory: [{
        appVersion,
        date: new Date(),
      }]
    })
    return device.save()
  },

  async updateDevice({ deviceId, updateData }) {
    return Device.update({ id: deviceId }, { $set: updateData })
  },

  async disableUserDevice({ userId, deviceId }) {
    // const res = await UserDevice.update(
    //   { status: status.USER_DEVICE.INACTIVE },
    //   { where: { user_id: userId, device_id: deviceId }, returning: true })
    // return res[1][0]
  },

}
