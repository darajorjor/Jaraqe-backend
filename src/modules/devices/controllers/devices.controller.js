import DeviceRepository from 'repositories/device.repository'
import transformDevice from '../transformers/device.transformer'

export default {

  async registerDevice(req, res, next) {
    try {
      const {
        uniqueId,
        type,
        appVersion,
        deviceInfo,
      } = req.body

      let device = await DeviceRepository.findDevice({ uniqueId, type })
      if (!device) {
        device = await DeviceRepository.createDevice({ uniqueId, type, appVersion, deviceInfo })
      } else {
        device.app_version = appVersion
        device.device_info = deviceInfo
        device.additional_data.versionHistory.push({
          appVersion,
          date: new Date(),
        })
        device = await DeviceRepository.updateDevice({
          deviceId: device.id,
          updateData: device.toJSON(),
        })
      }

      return res.build.success(transformDevice(device), res.messages.DEVICE_CREATED)
    } catch (error) {
      switch (error.message) {
        default:
          return next(error)
      }
    }
  },

}
