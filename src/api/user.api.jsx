import axiosclient from "./api";

const authapi = {
  signup: (data) => axiosclient.post("/users/register", data),
  getcurrentuser: () => axiosclient.get("/users/getcurrentuser"),
  login: (data) => axiosclient.post("/users/login", data),
  logout: () => axiosclient.post("/users/logout"),
getallusers : () => axiosclient.get("/users/getallusers"),
 accesschat: (userid) =>
    axiosclient.post("/chat/access", { userid }),
 fetchchat: () =>
    axiosclient.get("/chat/fetch"),
  sendmessage: (data) =>
    axiosclient.post("/message", data),
   getmessage: (chatId) =>
    axiosclient.get(`/message/${chatId}`),
    markasread: (chatId) =>
    axiosclient.patch(`/message/read/${chatId}`),
    deletemessage: (messageId) =>
    axiosclient.delete(`/message/${messageId}`),
}

export default authapi;