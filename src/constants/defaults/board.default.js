export default {
  get LETTERS() {
    const arr = [
      { value: 'ا', count: 4, point: 1, },
      { value: 'ب', count: 3, point: 1, },
      { value: 'پ', count: 1, point: 2, },
      { value: 'ت', count: 1, point: 1, },
      { value: 'ث', count: 1, point: 10, },
      { value: 'ج', count: 1, point: 2, },
      { value: 'چ', count: 1, point: 3, },
      { value: 'ح', count: 1, point: 4, },
      { value: 'خ', count: 1, point: 1, },
      { value: 'د', count: 1, point: 1, },
      { value: 'ذ', count: 1, point: 3, },
      { value: 'ر', count: 1, point: 1, },
      { value: 'ز', count: 1, point: 1, },
      { value: 'ژ', count: 1, point: 10, },
      { value: 'س', count: 3, point: 1, },
      { value: 'ش', count: 1, point: 1, },
      { value: 'ص', count: 1, point: 3, },
      { value: 'ض', count: 1, point: 4, },
      { value: 'ط', count: 1, point: 4, },
      { value: 'ظ', count: 1, point: 5, },
      { value: 'ع', count: 1, point: 3, },
      { value: 'غ', count: 1, point: 5, },
      { value: 'ف', count: 1, point: 3, },
      { value: 'ق', count: 1, point: 2, },
      { value: 'ک', count: 1, point: 2, },
      { value: 'ل', count: 1, point: 1, },
      { value: 'م', count: 1, point: 1, },
      { value: 'ن', count: 1, point: 1, },
      { value: 'و', count: 1, point: 2, },
      { value: 'ه', count: 1, point: 2, },
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