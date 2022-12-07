//So this code has some bugs especially the last pages but i couldnt figure out how to fix that but i did my best to make it work\\

const appEl = document.getElementById("app");
const nextBtn = document.getElementById("button-next");
const prevBtn = document.getElementById("button-prev");
const homeBtn = document.getElementById("button-home");
const srchBar = document.getElementById("search-text");
const srchBtn = document.getElementById("search-button");

//Url object\\
let apiUrls = {
  main: "https://pokeapi.co/api/v2/pokemon/",
  next: "",
  prev: "",
  count: 0,
};

//Function that sets the url based on what data we are viewing\\
function setPage(data) {
  apiUrls.next = data.next;
  apiUrls.count = data.count;

  //Calculating last page number\\
  const lastPage = Math.floor(apiUrls.count / 20) * 20;

  //If there is no previous then it will go to last page\\
  apiUrls.prev =
    data.previous ||
    `https://pokeapi.co/api/v2/pokemon/?offset=${lastPage}&limit=20`;
}

//Function for searching pokemon\\
async function searchPokemon(event) {
  //Getting all pokemon data\\
  const apiData = await getApi(
    "https://pokeapi.co/api/v2/pokemon/?offset=0&limit=1154"
  );

  let value = event.target.value.toLowerCase();
  //Using filter to loop and filter pokemon object to return all pokemon that has the value of input field in their names\\
  const searchedPokemon = apiData.results.filter((pokemon) => {
    return pokemon.name.includes(value);
  });

  //Loops the searched filtered pokemon to create a card and display it for each one\\
  let searchedPokemonElement = searchedPokemon.map((pokemon) =>
    createCard(pokemon)
  );

  //Resolving the promise for getting the searched pokemon\\
  searchedPokemonElement = await Promise.all(searchedPokemonElement);

  //Removing the innerhtml so it doesnt add to the others that are already displayed\\
  cardsContainer.innerHTML = "";

  //Unpacking and appending the searched pokemon elements\\
  cardsContainer.append(...searchedPokemonElement);
}

//Adding eventlistener and the calling the searchPokemon function oninput\\
srchBar.addEventListener("input", searchPokemon);

//Fetching the api and returning the api data\\
async function getApi(url) {
  const apiResponse = await fetch(url);

  const apiData = await apiResponse.json();

  return apiData;
}

//Adding eventlistener to nextbtn which calls displayPokemon to display the next portion of the data\\
nextBtn.addEventListener("click", () => displayPokemon(apiUrls.next));

//Adding eventlistener to homebtn which calls function to take you back to main page\\
homeBtn.addEventListener("click", () => displayPokemon(apiUrls.main));

//Adding eventlistener to prevbtn that goes to the previous portion of data\\
prevBtn.addEventListener("click", () => displayPokemon(apiUrls.prev));

//async Function for creating the pokemon card with html elements and also getting promise from fetching the url\\
async function createCard(pokemon) {
  //Destructuring the pokemon object\\
  let { name, url } = pokemon;

  //Creating the elements for the card\\
  const pokeCard = document.createElement("div");
  const pokeName = document.createElement("h2");
  const pokeImg = document.createElement("img");

  //Fetching the url api inside of the pokemon object to get more info\\
  const pokeDetails = await getApi(url);

  //Setting the source of the img element to the pokemon img url\\
  pokeImg.src = pokeDetails.sprites.other["official-artwork"].front_default;

  pokeName.textContent = `${pokeDetails.id}: ${name.toUpperCase()}`;

  //Click event for displaying additional info on each pokemon card\\
  pokeCard.addEventListener("click", () => displayDetails(pokeDetails));
  pokeCard.className = "card";

  pokeCard.append(pokeName, pokeImg);

  return pokeCard;
}

//Cards container\\
const cardsContainer = document.createElement("div");
cardsContainer.className = "poke-list";
cardsContainer.style = "margin-top: 5rem;";
appEl.append(cardsContainer);

//Function for displaying details when clicked\\
async function displayDetails(details) {
  srchBar.value = "";

  //Destructuring the details\\
  let {
    base_experience,
    height,
    weight,
    id,
    name,
    stats,
    types,
    sprites,
    abilities,
  } = details;

  //Getting the urls for each ability\\
  const abilityUrls = abilities.map((ability) => {
    return ability.ability.url;
  });

  //Getting the data from the ability api\\
  const getAbilityData = abilityUrls.map(async (data) => {
    const fullData = await getApi(data);

    return fullData.effect_entries;
  });

  //Getting effect_entries and resolving promises made above\\
  let effect_entries = await getAbilityData;
  effect_entries = await Promise.all(effect_entries);

  //Getting the short description for the abilities\\//Ps i realized some of these turned out to be german and couldnt fix it so idk :P
  let effectData = effect_entries.map((effect) => {
    return effect[1].short_effect;
  });

  //Adding the details to be displayed when this function is called\\
  cardsContainer.innerHTML = `
  <div class="card-big">
    <h2>${id}: ${name.toUpperCase()}</h2>
    <img src="${sprites.other["official-artwork"].front_default}">
      <div class="card-stats">
        <div class="info">
          <h3 class="height">${height}</h3>
          <h3 class="weight">${weight}</h3>
          <h3 class="xp">${base_experience}</h3>
        </div>
        <div class="ability">
          <div class="ability-text">
            ${abilities
              .map((ability) => `<h2>${ability.ability.name}</h2>`)
              .join("")}
          </div>
          <div class="ability-desc">
           ${effectData
             .map((effect) => `<h2 id="effect">${effect}</h2>`)
             .join("")}</div>
          </div>
        <div class="types"><h1>Types:</h1>${types
          .map((type) => `<h4>${type.type.name}</h4>`)
          .join("")}
        </div>
        <div class="stats">${stats
          .map(
            (stat) =>
              `<h3>${stat.stat.name}</h3><h3 class="stat">${stat.base_stat}</h3><hr>`
          )
          .join("")}
        </div>
      </div>
  </div>`;

  //Small little detail for stats\\
  const statElement = document.querySelectorAll(".stat");
  for (const stat of statElement) {
    if (stat.textContent > 80) {
      stat.style.color = "green";
    } else if (stat.textContent < 50) {
      stat.style.color = "red";
    } else {
      stat.style.color = "lightblue";
    }
  }
}

//Function for displaying the pokemon cards with data\\
async function displayPokemon(url) {
  //Storing data in var\\
  const pokemonData = await getApi(url);

  //Mapping the pokemon data var and calling createCard for each one\\
  let pokeEls = pokemonData.results.map((pokemon) => createCard(pokemon));

  //Calling setPage on to display the portion of data that we want\\
  setPage(pokemonData);

  //Resolving the promises inside of the createcard function to display properly\\
  pokeEls = await Promise.all(pokeEls);

  cardsContainer.innerHTML = "";
  cardsContainer.append(...pokeEls);
}

//Diplaying the pokedex\\
displayPokemon(apiUrls.main);
