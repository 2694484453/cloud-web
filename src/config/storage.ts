export const storageUser = (token, username) => {
  localStorage.setItem('username', username);
  localStorage.setItem("userinfo", JSON.stringify({
    'username': username,
    'token': token
  }));
}

export const cleanUser = () => {
  localStorage.removeItem('username');
  localStorage.removeItem('userinfo');
}
