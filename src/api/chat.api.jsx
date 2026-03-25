import axiosclient from './api';

const Chatapi = {
  accesschat: (userid) => axiosclient.post('/chat/access', { userid }),
  fetchchat: () => axiosclient.get('/chat/fetch'),
  creategroupchat: (data) => axiosclient.post('/chat/group', data),
};

export default Chatapi;
