import requestify from 'requestify'

export default {
  async query(word) {
    const response = await requestify.get(`https://fa.wikipedia.org/w/api.php?action=query&format=json&prop=langlinks&list=&meta=&titles=Project%3AarticleA%7Carticle_B&generator=search&llprop=&lllang=fa&lldir=ascending&gsrsearch=${word}`)

    response.getBody()

    const { query: { pages } } = JSON.parse(response.body)

    return Object.values(pages).map(({ pageid, title }) => ({ pageId: pageid, title })).filter(({ title }) => word === title)
  },
}