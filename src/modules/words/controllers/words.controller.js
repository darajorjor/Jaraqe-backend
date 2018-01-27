import wordService from '../services/word.service'

export default {

  async getWordsInfo(req, res, next) {
    try {
      const { words } = req.query

      const wordInfos = await wordService.getWordsInfo(words)

      return res.build.success(wordInfos)
    } catch (error) {
      switch (error.message) {
        default:
          return next(error);
      }
    }
  }

}
