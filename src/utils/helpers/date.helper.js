export default {
  getAge(birthDate) {
    const birthday = new Date(birthDate)
    const ageDifMs = Date.now() - birthday.getTime()
    const ageDate = new Date(ageDifMs)
    const age = Math.abs(ageDate.getUTCFullYear() - 1970)
    return age
  },
}
