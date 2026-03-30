import axiosclient from './api';

const authapi = {
  signup: (data) => axiosclient.post('/users/register', data),
  getcurrentuser: () => axiosclient.get('/users/getcurrentuser'),
  login: (data) => axiosclient.post('/users/login', data),
  logout: () => axiosclient.post('/users/logout'),
  getallusers: () => axiosclient.get('/users/getallusers'),
 getsearchuser: (search = "") =>
axiosclient.get("/users/getallusers", {
  params: { search }
}),
  updateprofile: (data) => axiosclient.patch("/users/update-profile", data),
  updateaccountdetails: (data) => axiosclient.patch("/users/change-avatar", data),
removeavatar: () => axiosclient.patch("/users/remove-avatar"),
};

export default authapi;