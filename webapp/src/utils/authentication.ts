export function authHeader(): Headers {
    // return authorization header with basic auth credentials
    let user = JSON.parse(localStorage.getItem('user') || "");

    if (user && user.authdata) {
        return new Headers({ 'Authorization': 'Basic ' + user.authdata })
    } else {
        return new Headers();
    }
}

export function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

export function isLoggedIn(): boolean {
    return (localStorage.getItem('user') != null);
}

export function login(username: String, password: String) {
    const requestOptions = {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Authorization': 'Basic ' + window.btoa(username + ':' + password)
        },
    };

    return fetch('/api/security/authenticate', requestOptions)
        .then(handleAuthResponse)
        .then(retVal => {
            // login successful if there's a user in the response
            if (retVal) {
                // store user details and basic auth credentials in local storage
                // to keep user logged in between page refreshes
                retVal.authdata = window.btoa(username + ':' + password);
                localStorage.setItem('user', JSON.stringify(retVal));
            }

            return retVal;
        });
}

export function handleResponse(response: Response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                logout();
                location.reload();
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}

function handleAuthResponse(response: Response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                logout();
            }

            const error = "Invalid credentials";
            return Promise.reject(error);
        }

        return data;
    });
}