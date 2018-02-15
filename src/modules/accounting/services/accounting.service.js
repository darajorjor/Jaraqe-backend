import config from 'src/config/app.config'
import ZarinpalCheckout from 'zarinpal-checkout'

const zarinpal = ZarinpalCheckout.create(config.zarinpalApiKey, true)

export default {
  async getPaymentLink({ amount, callBackUrl, description }) {
    const response = await zarinpal.PaymentRequest({
      Amount: amount,
      CallbackURL: callBackUrl,
      Description: description,
      Email: 'hey@jaraqe.com',
      Mobile: '09120000000',
    })

    if (response.status === 100) {
      const {
        authority,
        url,
      } = response

      return url
    } else {
      throw new Error(response.status)
    }
  },

  async verifyPayment({ amount, Authority }) {
    const result = await zarinpal.PaymentVerification({
      Amount: amount,
      Authority,
    })

    return result.status !== -21;
  },
}