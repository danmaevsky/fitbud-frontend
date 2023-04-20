// authFetch will handle sending accessToken, and if fails, retries request after using refreshToken to mint new accessToken
// if still failure, then simply fail

export default async function authFetch(url, options, navigate) {
    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${window.localStorage.accessToken}`,
    };
    return fetch(url, options)
        .then((res) => {
            if (res.status === 401) {
                throw new Error("401");
            } else {
                return res;
            }
        })
        .catch(async (err) => {
            if (err.message === "401") {
                // mint new token
                let mintOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken: window.localStorage.refreshToken }),
                };
                return fetch(`${process.env.REACT_APP_GATEWAY_URI}/account/newToken`, mintOptions)
                    .then((res) => {
                        if (res.status === 200) {
                            // successfully minted
                            return res.json();
                        } else {
                            throw new Error(res.status);
                        }
                    })
                    .then((json) => {
                        window.localStorage.accessToken = json.accessToken;
                        options.headers["Authorization"] = `Bearer ${json.accessToken}`;
                    })
                    .then(() => {
                        return fetch(url, options);
                    })
                    .catch((error) => {
                        if (error.message === "401") {
                            window.localStorage.clear();
                            window.sessionStorage.clear();
                            navigate("/");
                        }
                    });
            }
        });
}
