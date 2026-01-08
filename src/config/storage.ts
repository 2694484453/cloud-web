export const storageUser = (token:string, username:string) => {
  localStorage.setItem('username', username);
  localStorage.setItem("userinfo", JSON.stringify({
    'username': username,
    'token': token
  }));
}

export const getUserInfo = () => {
  return JSON.parse(localStorage.getItem('userinfo'));
}

export const storageAccount = (username:string, password:string) => {
  localStorage.setItem('userAccount', JSON.stringify({
    'username': username,
    'password': password
  }));
}

export const getUserAccount = () => {
  return JSON.parse(localStorage.getItem('userAccount'));
}

export const cleanUser = () => {
  localStorage.removeItem('username');
  localStorage.removeItem('userinfo');
}

