import UserRepository from 'repositories/user.repository';

export default {
  async run() {
    const userSessions = await UserRepository.getRedisSessions();
    const sessions = userSessions.map((userSession) => {
      return userSession.substr(13);
    });
    const now = new Date();
    sessions.map(async (session) => {
      UserRepository.setLastOnlineBySession({ session, lastOnline: now }).catch((error) => {
        console.error(`Users Last Online Syncer Error: ${error}`);
      });
    });
  },
};
