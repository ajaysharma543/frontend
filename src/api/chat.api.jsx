import axiosclient from './api';

const Chatapi = {
  accesschat: (userid) => axiosclient.post('/chat/access', { userid }),
  fetchchat: () => axiosclient.get('/chat/fetch'),
  creategroupchat: (data) => axiosclient.post('/chat/group', data),
  renamegroup : (data) => axiosclient.put("/chat/rename", data),
  removefromgroup : (data) => axiosclient.put("/chat/groupremove",data),
  addtogroup : (data) => axiosclient.put("/chat/groupadd",data)
};

export default Chatapi;
