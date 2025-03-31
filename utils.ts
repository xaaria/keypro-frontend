
/** Some constants and utils */

export const API_URL = "http://localhost:8000"


export function getAuthFromLocalStorage() : { id: number | undefined, token: string | undefined } {
   const ls = window.localStorage;
   const id = Number(ls.getItem('id'));
   const token = ls.getItem('token');
    if(!!id && !!token) {
        return { id, token };
    }
    else {
        return { id: undefined, token: undefined };
    }
}

export function setAuthToLocalStorage(id: number, token: string) {
    try {
        const ls = window.localStorage;
        ls.setItem("id", ""+id);
        ls.setItem("token", token);
    } catch {
        return undefined;
    }
}