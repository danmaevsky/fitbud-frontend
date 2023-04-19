export default function IsUserLogged() {
    return window.localStorage.profile && window.localStorage.accessToken && window.localStorage.refreshToken;
}
