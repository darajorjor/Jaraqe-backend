import { Sequelize, sequelize } from 'connections/postgres'
import userAdditionalData from 'src/constants/defaults/userAdditionalData.default'
import genderTypes from 'src/constants/enums/genderTypes.enum'
import status from 'src/constants/enums/status.enum'
import dateHelper from 'src/utils/helpers/date.helper'

const User = sequelize.define('user',
  {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    first_name: {
      type: Sequelize.STRING,
    },
    last_name: {
      type: Sequelize.STRING,
    },
    full_name: {
      type: Sequelize.VIRTUAL,
      get: function get() {
        const additionalData = this.get('additional_data');
        if (additionalData && additionalData.instagram) {
          return additionalData.instagram.fullName || additionalData.instagram.username
        }
        return undefined;
      },
    },
    phone_number: {
      type: Sequelize.STRING,
    },
    gender: {
      type: Sequelize.ENUM(genderTypes.MALE, genderTypes.FEMALE, genderTypes.UNDEFINED),
      defaultValue: genderTypes.UNDEFINED,
    },
    avatars: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: [],
    },
    settings: {
      type: Sequelize.JSONB,
      defaultValue: {},
    },
    session: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: Sequelize.ENUM(
        status.USER.ACTIVE,
        status.USER.INACTIVE,
        status.USER.SUSPENDED,
        status.USER.PENDING,
      ),
      defaultValue: status.USER.PENDING,
    },
    additional_data: {
      type: Sequelize.JSONB,
      defaultValue: userAdditionalData,
    },
    last_online: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    wallet: {
      type: Sequelize.VIRTUAL,
      set: function set(balance) { // DO NOT USE ARROW FUNCTIONS HERE!!!
        this.setDataValue('wallet', balance)
      },
    },
    is_registered: {
      type: Sequelize.VIRTUAL,
      get: function get() { // DO NOT USE ARROW FUNCTIONS HERE!!!
        return !!this.get('first_name')
      },
    },
    avatar: {
      type: Sequelize.VIRTUAL,
      get: function get() {
        if (this.get('has_avatar') === true) {
          const avatars = this.get('avatars')
          return `avatars/${avatars[avatars.length - 1]}`
        }
        return `avatars/default-${this.get('gender') === genderTypes.MALE ? 'male' : 'female'}.jpg`
      },
    },
    has_avatar: {
      type: Sequelize.VIRTUAL,
      get: function get() {
        const avatars = this.get('avatars')
        return avatars !== undefined ? avatars.length !== 0 : false
      },
    },
    age: {
      type: Sequelize.VIRTUAL,
      get: function get() {
        const age = dateHelper.getAge(this.get('additional_data').birth_date)
        return age
      },
    },
  },
  {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  })

export default User
