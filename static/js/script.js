const Card = document.getElementById('Card') //Select the card element from the DOM
const Count = 1008; // Set the total number of Pokemon to fetch
const Types_Color = {  // Define an object that maps each Pokemon type to a color
	normal: 'rgb(168, 168, 120)',
	fire: 'rgb(240, 128, 48)',
	water: 'rgb(104, 144, 240)',
	grass: 'rgb(120, 200, 80)',
	electric: 'rgb(248, 208, 48)',
	ice: 'rgb(152, 216, 216)',
	fighting: 'rgb(192, 48, 40)',
	poison: 'rgb(160, 64, 160)',
	ground: 'rgb(224, 192, 104)',
	flying: 'rgb(168, 144, 240)',
	psychic: 'rgb(248, 88, 136)',
	bug: 'rgb(168, 184, 32)',
	rock: 'rgb(184, 160, 56)',
	ghost: 'rgb(112, 88, 152)',
	dragon: 'rgb(112, 56, 248)',
	dark: 'rgb(112, 88, 72)',
	steel: 'rgb(184, 184, 208)',
	fairy: 'rgb(238, 153, 172)'
};

const primary_types = Object.keys(Types_Color) // Create an array of all the Pokemon types

const Generate_ID = async () => {  //Define a function to generate the Pokemon IDs and info
    const pokemonData = []
    for(let j = 1; j <= Count; j++) {
      const data = await Pokemon_Info(j)
      pokemonData.push(data)
    }
    pokemonData.sort((a, b) => a.id - b.id) // sort the array by ID
    pokemonData.forEach((data) => {
      generatePokemonCard(data)
    })
  }

const Pokemon_Info = async (id) => { // Define a function to fetch Pokemon info from the API
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`
    const res = await fetch(url)
    const data = await res.json()
    generatePokemonCard(data)
}

const getPokemonSpecies = async (id) => { // Define a function to fetch the Pokemon species and get its generation
	const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
	const data = await response.json();
	const Generation = data.generation.name;
	return Generation
  }
const getPokemonCategory = async (id) =>{ // Define a function to fetch the Pokemon species and get its category
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  const data = await response.json();
  const category = data.genera.find(genus => genus.language.name === 'en').genus;
  return category
}

  const getStrengths = async (types) => { // Define a function to fetch the strengths of a Pokemon's types
    let strengths = []
    for (const type of types) {
        const res = await fetch(type.type.url)
        const data = await res.json()
        strengths = [...strengths, ...data.damage_relations.double_damage_to.map((type) => type.name)]
    }
    return [...new Set(strengths)]
}

const getWeaknesses = async (types) => { // Define a function to fetch the weaknesses of a Pokemon's types
    let weaknesses = []
    for (const type of types) {
        const res = await fetch(type.type.url)
        const data = await res.json()
        weaknesses = [...weaknesses, ...data.damage_relations.double_damage_from.map((type) => type.name)]
    }
    return [...new Set(weaknesses)]
}

const getRegion = (gen) => { // Define a function to get the region of a Pokemon's generation
  switch (gen) {
    case 'generation-i':
      return 'Kanto';
    case 'generation-ii':
      return 'Johto';
    case 'generation-iii':
      return 'Hoenn';
    case 'generation-iv':
      return 'Sinnoh';
    case 'generation-v':
      return 'Unova';
    case 'generation-vi':
      return 'Kalos';
    case 'generation-vii':
      return 'Alola';
    case 'generation-viii':
      return 'Galar';
    default:
      return 'Unknown';
  }
};

function Zoom(img){ // Define a function to show a zoomed-in image of a Pokemon
  var Zoom_img = document.getElementById("Zoom_img");
  Zoom_img.src = img.src;
  document.querySelector('.Zoom').style.display = 'block';
}
function HideZoom(){ // Define a function to hide the zoomed-in image of a Pokemon
  document.querySelector('.Zoom').style.display = 'none';  
}

const generatePokemonCard = async (pokemon) => { // Define a function to generate a Pokemon card with its info
    const new_pokemon = document.createElement('div')
    new_pokemon.classList.add('new_pokemon')

    const name = pokemon.name[0].toUpperCase() + pokemon.name.slice(1) // Get the capitalized name of the Pokemon
    const id = pokemon.id.toString().padStart(3,"0") // Get the ID of the Pokemon with leading zeros
    const types = pokemon.types.map(type=> type.type.name) // Get an array of the Pokemon's types
    const height = pokemon.height // Get the height of the Pokemon
    const weight = pokemon.weight // Get the weight of the Pokemon
    const category = await getPokemonCategory(pokemon.id) // Get the category of the Pokemon's species
    const strengths = await getStrengths(pokemon.types); // Get the strengths of the Pokemon's types
    const weaknesses = await getWeaknesses(pokemon.types); // Get the weaknesses of the Pokemon's types
    const primary_type = primary_types.find(primary_type => types.indexOf(primary_type)> -1) // Get the primary type of the Pokemon
    const updated_primary = primary_type[0].toUpperCase() + primary_type.slice(1) // Get the capitalized primary type of the Pokemon
    const color = Types_Color[primary_type]

    new_pokemon.style.backgroundColor = color
    const Gen = (await getPokemonSpecies(pokemon.id)).toUpperCase();
    const lower_gen = Gen.toLowerCase();
    const region = getRegion(lower_gen);

    const HTML = `
      <div class = "Image">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png" alt="${name}" onclick="Zoom(this)">
      </div>
      <div class = "base_details">
        <span class = "ID"> #${id}</span>
        <h2 class = "Name">${name}</h2>
        <small class = "Type"><b>Primary Type: </b><span>${updated_primary}</span> </small><br>
        <small class = "All"><b>Secondary Type: </b><span>${types[1]}</span></small><br>
        <small class="Category"><b>Category: </b><span>${category}</span></small><br>
        <small class="Height"><b>Height: </b><span>${height} dm</span></small><br>
        <small class="Weight"><b>Weight: </b><span>${weight} hg</span></small><br>
        <small class="Generation"><b>Generation: </b><span>${Gen}</span></small><br>
        <small class="Region"><b>Region: </b><span>${region}</span></small><br>
        <small class="Strengths"><b>Strengths: </b><span>${strengths.join(', ')}</span></small><br>
        <small class="Weaknesses"><b>Weaknesses: </b><span>${weaknesses.join(', ')}</span></small><br>
      </div>
      `
      new_pokemon.innerHTML = HTML
      Card.appendChild(new_pokemon)
} 
 
document.getElementById("searchButton").addEventListener("click", searchPokemon);
function searchPokemon() {
    const searchQuery = document.getElementById("searchInput").value;
    fetch(`https://pokeapi.co/api/v2/pokemon/${searchQuery}`)
      .then(response => response.json())
      .then(data => {
        // Display the search results
        displayPokemon(data);
      })
  }

  async function displayPokemon(data) {
    const new_pokemon = document.getElementById("Search_Card");
    new_pokemon.classList.add('new_pokemon')
    const primary_type = (data.types[0].type.name)
    const Secondary_type = (data.types[1].type.name)
    const color = Types_Color[primary_type]
    new_pokemon.style.backgroundColor = color
    new_pokemon.innerHTML = `
    <div class = "Image">
      <img src="${data.sprites.front_default}"><br>
    </div>
      <div class="base_details">
        <span class = "ID"> #${data.id}</span><br>
        <h2 class = "Name">${data.name}</h2><br>
        <small class = "Type"><b>Primary Type: </b><span>${primary_type}</span> </small><br>
        <small class = "All"><b>Secondary Type: </b><span>${Secondary_type}</span> </small><br>
        <small class="Height"><b>Height: </b><span>${data.height} dm</span></small><br>
        <small class="Weight"><b>Weight: </b><span>${data.weight} hg</span></small><br>
      </div>
    `;
    Search_Card.appendChild(new_pokemon)
  }

  function hide(){
    var div = document.getElementById("Card");
    var div1 = document.getElementById("Search_Card");
    if (div.style.display === "none") {
      div.style.display = "flex";
    } else {
      div.style.display = "none";
    }
  }
  Generate_ID();
  