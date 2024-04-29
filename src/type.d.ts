declare namespace App {
    interface Session {
        user?: {
            name?: string;
            email?: string;
        };
        expires?: string;
        //access_token?: string;  // Add this line to include the access_token in the session type
       // refresh_token?:string;
    }
}
