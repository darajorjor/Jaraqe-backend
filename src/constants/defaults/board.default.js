export default {
  get LETTERS() {
    const arr = [
      { value: 'ا', count: 12, point:  1, },
      { value: 'ی', count: 10, point:  1, },
      { value: 'ن', count: 8, point:  1, },
      { value: 'ر', count: 7, point:  1, },

      { value: 'ب', count: 7, point:  2, },
      { value: 'ت', count: 6, point:  2, },
      { value: 'د', count: 5, point:  2, },
      { value: 'س', count: 5, point: 2, },
      { value: 'ل', count: 5, point:  2, },
      { value: 'م', count: 5, point:  2, },
      { value: 'و', count: 4, point:  2, },
      { value: 'ه', count: 4, point:  2, },

      { value: 'ز', count: 4, point:  3, },
      { value: 'ش', count: 4, point: 3, },
      { value: 'ف', count: 4, point: 3, },
      { value: 'ک', count: 3, point: 3, },

      { value: 'ج', count: 3, point: 4, },
      { value: 'خ', count: 3, point: 4, },
      { value: 'ع', count: 3, point: 4, },
      { value: 'ق', count: 2, point: 4, },
      { value: 'گ', count: 2, point: 4, },

      { value: 'پ', count: 2, point: 5, },

      { value: 'ح', count: 2, point: 6, },

      { value: 'غ', count: 1, point: 7, },
      { value: 'ط', count: 1, point: 7, },

      { value: 'چ', count: 1, point: 8, },
      { value: 'ص', count: 1, point: 8, },
      { value: 'ض', count: 1, point: 8, },

      { value: 'ث', count: 1, point:  9, },
      { value: 'ژ', count: 1, point:  9, },
      { value: 'ذ', count: 1, point:  9, },

      { value: 'ظ', count: 1, point: 10, },
    ]
    let finalArray = []

    arr.forEach(({ count, value, point }) => {
      for (let i = 0; i < count; i++) {
        finalArray.push({
          value,
          point,
        })
      }
    })

    return finalArray
  },
}