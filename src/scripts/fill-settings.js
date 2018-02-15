import { Setting } from 'models'

(async () => {
  await Setting.remove({})

  const store = new Setting({
    name: 'store',
    data: {
      swapPlus: [
        {
          name: 'swap-plus-2',
          title: '2x تعویض پلاس',
          img: '',
          count: 2,
          price: 20,
        },
        {
          name: 'swap-plus-5',
          title: '5x تعویض پلاس',
          img: '',
          count: 5,
          price: 45,
        },
        {
          name: 'swap-plus-20',
          title: '20x تعویض پلاس',
          img: '',
          count: 20,
          price: 180,
        }
      ],
      coins: [
        {
          name: 'coin-100',
          title: '100x سکه',
          img: '',
          count: 100,
          price: 2000,
        },
        {
          name: '200x سکه',
          title: '5x تعویض پلاس',
          img: '',
          count: 200,
          price: 3800,
        },
        {
          name: 'coin-1000',
          title: '1000x سکه',
          img: '',
          count: 1000,
          price: 9000,
        }
      ]
    },
  })

  await store.save()

  console.log('Success')
  process.exit(0)
})()