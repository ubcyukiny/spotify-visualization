import React, { useEffect, useState } from "react";
import { useSpotifyAuth } from "../../context/SpotifyAuthContext";
import "./SpotifyLogin.css";    
import axios from "axios";

const artists = [
  "Taylor Swift",
  "Bad Bunny",
  "The Weeknd",
  "Drake",
  "Peso Pluma",
  "Feid",
  "Travis Scott",
  "SZA",
  "Karol G",
  "Lana Del Rey",
  "Marshmello",
  "Doja Cat",
  "David Guetta",
  "Billie Eilish",
  "Bruno Mars",
  "Eminem",
  "Kanye West",
  "Sia",
  "Miley Cyrus",
  "Calvin Harris",
  "Post Malone",
  "Shakira",
  "Maroon 5",
  "Olivia Rodrigo",
  "Imagine Dragons",
  "Sam Smith",
  "Harry Styles",
  "Katy Perry",
  "Adele",
  "Lady Gaga",
  "21 Savage",
  "Tate McRae",
  "Elton John",
  "Kendrick Lamar",
  "Nicki Minaj",
  "Future",
  "J Balvin",
  "Queen",
  "Mariah Carey",
  "Selena Gomez",
  "Daddy Yankee",
  "Khalid",
  "Metro Boomin",
  "Arctic Monkeys",
  "Jack Harlow",
  "Justin Bieber",
  "Rihanna",
  "Ed Sheeran",
  "Ariana Grande",
  "Dua Lipa",
  "Coldplay",
  "Camila Cabello",
  "Shawn Mendes",
  "Halsey",
  "Zedd",
  "The Chainsmokers",
  "Ava Max",
  "Lewis Capaldi",
  "Lil Nas X",
  "Jason Derulo",
  "Demi Lovato",
  "Bebe Rexha",
  "Anne-Marie",
  "Niall Horan",
  "Lauv",
  "Lizzo",
  "Jonas Brothers",
  "Alec Benjamin",
  "BTS",
  "BLACKPINK",
  "G-Eazy",
  "Alan Walker",
  "Kygo",
  "Martin Garrix",
  "Rita Ora",
  "Charlie Puth",
  "Selena Gomez",
  "Cardi B",
  "Megan Thee Stallion",
  "DaBaby",
  "Roddy Ricch",
  "Lil Uzi Vert",
  "Juice WRLD",
  "Trippie Redd",
  "Lil Baby",
  "Machine Gun Kelly",
  "AJR",
  "Glass Animals",
  "Tones and I",
  "Surfaces",
  "Powfu",
  "SAINt JHN",
  "Arizona Zervas",
  "BENEE",
  "Young T & Bugsey",
  "Joji",
  "Trevor Daniel",
  "Lil Mosey",
  "Pop Smoke",
  "Don Toliver",
  "NAV",
  "Rod Wave",
  "YUNGBLUD",
  "Lewis Capaldi",
  "Lauv",
];


const ArtistScroll = ({ artists }) => {
  const numberOfRows = 6;
  const artistsPerRow = Math.ceil(artists.length / numberOfRows);

  const rows = Array(numberOfRows)
    .fill()
    .map((_, rowIndex) => {
      const rowArtists = artists.slice(
        rowIndex * artistsPerRow,
        (rowIndex + 1) * artistsPerRow
      );
      return (
        <div className={`scroll-row row${rowIndex + 1}`} key={rowIndex}>
          {rowArtists.map((artist, index, array) => {
            const nameParts = artist.split(" ");
            return nameParts.map((part, partIndex) => (
              <React.Fragment key={`${index}-${partIndex}`}>
                <span className="artist-name-part">{part.toUpperCase()}</span>
                {partIndex === nameParts.length - 1 &&
                  index !== array.length - 1 && (
                    <span className="artist-separator" />
                  )}
              </React.Fragment>
            ));
          })}
        </div>
      );
    });

  return <div className="scrolling-artist-names">{rows}</div>;
};


const SpotifyLogin = () => {
    const { spotifyAccessToken, updateCredentials } = useSpotifyAuth();
    const client_id = process.env.REACT_APP_CLIENT_ID; 
    const client_secret = process.env.REACT_APP_CLIENT_SECRET; 
    const redirect_uri = window.location.origin + "/callback"; 
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

    return (
      <div className="login-container">
        <div className="left-bar">
          <div className="top-label">G18</div>
        </div>
        {spotifyAccessToken ? (
          <p>Logged in!</p>
        ) : (
          <div className="login-button-container">
             <button onClick={handleLogin} className="spotify-btn">
              Login with Spotify
            </button>
          </div>
        )}
        <ArtistScroll artists={artists} />
      </div>
    );
};

export default SpotifyLogin;
