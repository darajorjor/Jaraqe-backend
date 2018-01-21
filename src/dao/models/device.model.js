import mongoose from 'src/dao/connections/mongo'
import deviceTypes from 'src/constants/enums/deviceTypes.enum'

const DeviceSchema = new mongoose.Schema({
  token: {
    type: String,
    allowNull: false,
    unique: true,
  },
  unique_id: {
    type: String,
    allowNull: false,
  },
  type: {
    allowNull: false,
    enum: Object.values(deviceTypes)
  },
  appVersion: {
    allowNull: false,
    type: String,
  },
  versionHistory: [{
    appVersion: String,
    date: Date,
  }],
  deviceInfo: {},
}, { timestamps: true });

DeviceSchema.method = {
  //
};

const Device = mongoose.model('Device', DeviceSchema);

export default Device;
