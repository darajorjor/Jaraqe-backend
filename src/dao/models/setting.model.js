import mongoose from 'connections/mongo'

const SettingSchema = new mongoose.Schema({
  name: String,
  data: {},
}, { timestamps: true })

const Setting = mongoose.model('Setting', SettingSchema)

export default Setting
