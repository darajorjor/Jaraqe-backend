import SettingRepo from 'repositories/setting.repository'
import storeService from '../services/store.service'
import messages from 'src/constants/defaults/messages.default'
import accountingService from 'src/modules/accounting/services/accounting.service'
import UserRepo from 'repositories/user.repository'
import coinTransactionTypes from 'src/constants/enums/coinTransactions.enum'
import { transformSelfProfile } from 'src/modules/users/transformers/user.transformer'

export default {
  async getStoreInfo(req, res, next) {
    try {
      const storeSetting = await SettingRepo.get('store')

      return res.build.success(storeSetting)
    } catch (error) {
      switch (error.message) {
        default:
          return next(error);
      }
    }
  },

  async purchaseItem(req, res, next) {
    try {
      const { itemName } = req.body
      const { user: { id: userId } } = req

      const user = await storeService.purchase({ itemName, userId })

      return res.build.success(user)
    } catch (error) {
      switch (error.message) {
        case messages.ITEM_NOT_FOUND:
          return res.build.notFound(messages.ITEM_NOT_FOUND)
        case messages.NOT_ENOUGH_BALANCE:
          return res.build.forbidden(messages.NOT_ENOUGH_BALANCE)
        default:
          return next(error);
      }
    }
  },

  async purchaseCoin(req, res, next) {
    try {
      const { itemName } = req.query
      const { user: { id: userId } } = req
      const { Authority, Status } = req.query

      const item = await storeService.isAvailable(itemName, 'coins')
      if (!item) {
        return res.build.notFound(messages.ITEM_NOT_FOUND)
      }

      if (Authority) {
        if (Status === 'NOK') {
          return res.redirect(`jaraqe://login?user=${JSON.stringify({
              user: transformSelfProfile(savedUser),
              status: 'nok',
            }
          )}`)
        }
        if (accountingService.verifyPayment({ userId, amount: item.price, Authority })) {
          const savedUser = await storeService.addCoin({ userId, value: item.count, recordId: Authority })

          return res.redirect(`jaraqe://login?user=${JSON.stringify({
              user: transformSelfProfile(savedUser),
              status: 'ok',
            }
          )}`)
        } else {
          return next(new Error('Payment Error'))
        }
      }

      const url = (req.protocol + '://' + req.get('host') + req.originalUrl)
      const paymentLink = await accountingService.getPaymentLink({
        amount: item.price,
        callBackUrl: url,
        description: item.title,
      })

      return res.redirect(paymentLink)
    } catch (error) {
      switch (error.message) {
        default:
          return next(error);
      }
    }
  },
}
