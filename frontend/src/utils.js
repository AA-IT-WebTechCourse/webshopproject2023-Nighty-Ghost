export const getToken = () => {
    const TOKEN_KEY = "tokens"
    if (typeof window !== 'undefined') {
        const value = localStorage.getItem(TOKEN_KEY);
        if (!value) return
        const tokens = JSON.parse(value)
        return tokens
      }
      else {
        return
      }
};

export const checkAuth = async () => {
    const tokens = getToken();
    console.log("checkAuth: ", tokens);

    if (tokens) {
        const res = await fetch("/api/me/", {
            headers: {
                Authorization: `Bearer ${tokens.access}`,
            },
        });

        if (res.ok) {
            
            console.log("User is authenticated", true);
            return true;
        } else {
            
            console.log("User is not authenticated");
            return false;
        }
        
    } else {
        console.error("Tokens or access token is undefined");
        return false;
    }
};
