"use strict";

const API_PATH = "/api/user";

function fetchCredentials(url) {
  return fetch(url)
    .then((res) => res.json())
    .catch((e) => console.error(e));
}

async function fillUserData() {
  const jwtField = document.getElementById("jwt");
  const userIdField = document.getElementById("userId");

  const data = await fetchCredentials(API_PATH);

  jwtField.innerText = data.jwt;
  userIdField.innerText = data.userId;
}

document.addEventListener("DOMContentLoaded", function (event) {
  fillUserData();
});
