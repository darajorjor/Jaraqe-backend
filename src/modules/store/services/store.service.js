import SettingRepo from 'repositories/setting.repository'
import UserRepo from 'repositories/user.repository'
import messages from 'src/constants/defaults/messages.default'
import coinTransactionTypes from 'src/constants/enums/coinTransactions.enum'

export default {
  async purchase({ itemName, userId }) {
    // coins?
    const item = await this.isAvailable(itemName, 'swapPlus')

    if (!item) throw new Error(messages.ITEM_NOT_FOUND)

    // does he have enough coins?
    const user = await UserRepo.findById(userId)

    if (user.getCoins() < item.price) {
      throw new Error(messages.NOT_ENOUGH_BALANCE)
    }

    // buy it
    user.addTransaction({
      type: coinTransactionTypes.PURCHASE,
      recordId: item.name,
      amount: -item.price,
    })
    user.powerUps.swapPlus += item.count

    return user.save()
  },

  async isAvailable(itemName, category) {
    const store = await SettingRepo.get('store')

    return store[category].find(i => i.name === itemName)
  },

  async addCoin({ userId, value, recordId }) {
    const user = await UserRepo.findById(userId)

    const finalUser = await user.addTransaction({
      type: coinTransactionTypes.CHARGE,
      amount: value,
      recordId,
    })

    finalUser.coins = finalUser.getCoins()

    return finalUser
  },
}