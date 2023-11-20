import React, { useEffect, useState } from "react";
import { useSpotifyAuth } from "../context/SpotifyAuthContext";

import axios from "axios";

const SpotifyLogin = () => {
    const { spotifyAccessToken, updateCredentials } = useSpotifyAuth();
    const client_id = process.env.REACT_APP_CLIENT_ID; // Replace with your client id
    // console.log(client_id);
    const client_secret = process.env.REACT_APP_CLIENT_SECRET; // Replace with your client secret
    // console.log(client_secret);
    const redirect_uri = "http://localhost:3000/callback"; // Replace with your redirect uri

    const generateRandomString = (length) => {
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
            ""
        );
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const storedState = localStorage.getItem("spotify_auth_state");

        // console.log("Code from URL:", code);
        // console.log("State from URL:", state);
        // console.log("Stored state:", storedState);

        if (code && state && state === storedState) {
            handleCallback(code, state);
            localStorage.removeItem("spotify_auth_state");
        }
    }, []);

    const handleLogin = () => {
        const state = generateRandomString(16);
        localStorage.setItem("spotify_auth_state", state);
        const scope = "user-read-private user-read-email";

        window.location.href =
            "https://accounts.spotify.com/authorize?" +
                new URLSearchParams({
                    response_type: "code",
                    client_id: client_id,
                    scope: scope,
                    redirect_uri: redirect_uri,
                    state: state,
                }).toString();
    };

    const handleCallback = (code, receivedState) => {
        const authOptions = {
            method: "POST",
            url: "https://accounts.spotify.com/api/token",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                Authorization: "Basic " + btoa(client_id + ":" + client_secret),
            },
            data: new URLSearchParams({
                code: code,
                redirect_uri: redirect_uri,
                grant_type: "authorization_code",
            }).toString(),
        };

        axios(authOptions)
            .then((response) => {
                const { access_token: accessToken, refresh_token: refreshToken } =
                    response.data;
                updateCredentials(accessToken, refreshToken);
            })
            .catch((error) => {
                console.error("Error getting access token", error);
            });
    };

    // Component render
    return (
        <div>
            {spotifyAccessToken ? (
                <p>Logged in!</p>
            ) : (
                    <button onClick={handleLogin}>Login to Spotify</button>
                )}
        </div>
    );
};

export default SpotifyLogin;
