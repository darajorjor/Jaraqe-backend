import { Board } from '../models'

export default {
  selectBoard() {
    return Board.findOne()
  },

  methods: {
    //
  }
}
