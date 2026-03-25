import axiosclient from './api';

const Messageapi = {
  sendmessage: (data) => axiosclient.post('/message', data),
  getmessage: (chatId) => axiosclient.get(`/message/${chatId}`),
  markasread: (chatId) => axiosclient.patch(`/message/read/${chatId}`),
  deletemessage: (messageId) => axiosclient.delete(`/message/${messageId}`),
};

export default Messageapi;
