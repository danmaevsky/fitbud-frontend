export default function IsUserLogged() {
    return Boolean(window.localStorage.profile && window.localStorage.accessToken && window.localStorage.refreshToken);
}
