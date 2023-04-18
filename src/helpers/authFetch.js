// authFetch will handle sending accessToken, and if fails, retries request after using refreshToken to mint new accessToken
// if still failure, then simply fail

export default async function authFetch() {
    let options = arguments[1];
    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${window.localStorage.accessToken}`,
    };
    return fetch(arguments[0], options)
        .then((res) => {
            if (res.status === 401) {
                console.log("first 401 in auth fetch");
                throw new Error("401");
            } else {
                return res;
            }
        })
        .catch(async (err) => {
            if (err.message === "401") {
                console.log("catching 401");
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
                        console.log("should be here", json.accessToken);
                        window.localStorage.accessToken = json.accessToken;
                        options.headers["Authorization"] = `Bearer ${json.accessToken}`;
                    })
                    .then(() => {
                        return fetch(arguments[0], options);
                    });
            }
        });
}
