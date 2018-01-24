export default {
  get LETTERS() {
    const arr = [
      { value: 'ا', count: 5, point: 1, },
      { value: 'ب', count: 5, point: 1, },
      { value: 'پ', count: 3, point: 2, },
      { value: 'ت', count: 5, point: 1, },
      { value: 'ث', count: 2, point: 10, },
      { value: 'ج', count: 4, point: 2, },
      { value: 'چ', count: 2, point: 3, },
      { value: 'ح', count: 1, point: 4, },
      { value: 'خ', count: 2, point: 1, },
      { value: 'د', count: 5, point: 1, },
      { value: 'ذ', count: 1, point: 3, },
      { value: 'ر', count: 5, point: 1, },
      { value: 'ز', count: 4, point: 1, },
      { value: 'ژ', count: 1, point: 10, },
      { value: 'س', count: 5, point: 1, },
      { value: 'ش', count: 4, point: 1, },
      { value: 'ص', count: 1, point: 3, },
      { value: 'ض', count: 1, point: 4, },
      { value: 'ط', count: 1, point: 4, },
      { value: 'ظ', count: 1, point: 5, },
      { value: 'ع', count: 3, point: 3, },
      { value: 'غ', count: 2, point: 5, },
      { value: 'ف', count: 3, point: 3, },
      { value: 'ق', count: 3, point: 2, },
      { value: 'ک', count: 4, point: 2, },
      { value: 'ل', count: 3, point: 1, },
      { value: 'م', count: 5, point: 1, },
      { value: 'ن', count: 4, point: 1, },
      { value: 'و', count: 3, point: 2, },
      { value: 'ه', count: 5, point: 2, },
      { value: 'ی', count: 5, point: 1, },
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