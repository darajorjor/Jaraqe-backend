import { Sequelize, sequelize } from 'connections/postgres'
import status from 'src/constants/enums/status.enum'

const UserDevice = sequelize.define('userDevice',
  {
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    device_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM(
        status.USER_DEVICE.ACTIVE,
        status.USER_DEVICE.INACTIVE,
      ),
      defaultValue: status.USER_DEVICE.ACTIVE,
    },
  },
  {
    tableName: 'user_devices',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  })

export default UserDevice
