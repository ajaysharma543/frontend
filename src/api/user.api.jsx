import axiosclient from './api';

const authapi = {
  signup: (data) => axiosclient.post('/users/register', data),
  getcurrentuser: () => axiosclient.get('/users/getcurrentuser'),
  login: (data) => axiosclient.post('/users/login', data),
  logout: () => axiosclient.post('/users/logout'),
  getallusers: () => axiosclient.get('/users/getallusers'),
};

export default authapi;
