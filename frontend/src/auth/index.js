import { API } from '../config';


export const signup = user => {
    //console.log(name, email, password);
    return fetch(`${API}/signup`, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => {
            return response.json();
    })
    .catch(err => {
        console.log(err);
    });
};

export const signin = user => {
    //console.log(email, password);
    return fetch(`${API}/signin`, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(response => {
            return response.json();
    })
    .catch(err => {
        console.log(err);
    });
};

//For Saving The User & Token In The Local Storage
export const authenticate = (data, next) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('jwt', JSON.stringify(data));
        next();
    }
};

//For Signout
export const signout = (next) => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('jwt');
        next();
        return fetch(`${API}/signout`, {
            method: "GET",
        })
        .then(response => {
            console.log('signout', response);
        })
        .catch(err => console.log(err));
    }
};

//Show & hide signin signout links conditionally
export const isAuthenticated = () => {
    if (typeof window == 'undefined') {
        return false;
    }
    if (localStorage.getItem('jwt')) {
        return JSON.parse(localStorage.getItem('jwt'));
    } else {
        return false;
    }
};