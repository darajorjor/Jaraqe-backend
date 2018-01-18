import { Sequelize, sequelize } from 'connections/postgres'
import deviceType from 'src/constants/enums/deviceTypes.enum'

const Device = sequelize.define('device', {
  id: {
    primaryKey: true,
    allowNull: false,
    unique: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  token: {
    allowNull: false,
    unique: true,
    type: Sequelize.STRING,
  },
  unique_id: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  type: {
    allowNull: false,
    type: Sequelize.ENUM(
      deviceType.ANDROID,
      deviceType.IOS,
      deviceType.WEB_APP,
    ),
  },
  app_version: {
    allowNull: false,
    type: Sequelize.STRING,
  },
  device_info: {
    allowNull: false,
    type: Sequelize.JSONB,
    defaultValue: {},
  },
  additional_data: {
    allowNull: false,
    type: Sequelize.JSONB,
    defaultValue: {},
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})

export default Device
