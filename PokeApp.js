let paginaActual = 1;
let totalPaginas = 0;
const windowSize = 10; // Tamaño de la ventana de la barra de paginación

function generarPaginacion(startPage, endPage, totalPaginas) {
  const paginationList = document.getElementById('pagination-list');
  paginationList.innerHTML = ''; // Limpiar la lista de páginas

  const nextButton = crearBotonPagina('Siguiente');

  if (paginaActual > 1) {
    const previousButton = crearBotonPagina('Anterior');
    paginationList.appendChild(previousButton);
    const paginaAnterior = paginaActual - 1;
  }

  paginationList.appendChild(crearBotonPagina(1));

  if (startPage > 2) {
    paginationList.appendChild(crearElementoEllipsis());
  }

  for (let i = startPage + 1; i <= endPage; i++) {
    paginationList.appendChild(crearBotonPagina(i));
  }

  if (endPage < totalPaginas - 1) {
    paginationList.appendChild(crearElementoEllipsis());
  }

  if (paginaActual < totalPaginas) {
    console.log("ultimos botones");
    if (endPage < totalPaginas) {
      paginationList.appendChild(crearBotonPagina(totalPaginas, true));
    }
    paginationList.appendChild(nextButton);
  }

}


function crearBotonPagina(numero, esUltima = false) {
  const pageItem = document.createElement('li');
  pageItem.className = 'page-item';
  pageItem.innerHTML = `<a class="page-link" href="#">${numero}</a>`;

  switch (numero) {
    case 'Anterior':
      numero = paginaActual - 1;
      break;
    case 'Siguiente':
      numero = paginaActual + 1;
      break;
    default:
      break;
  }

  if (esUltima) {
    pageItem.addEventListener('click', () => {
      cambiarPagina(numero);
      console.log("ultima");
      generarPaginacion(numero - windowSize, numero, totalPaginas, windowSize);
    });
  } else {
    pageItem.addEventListener('click', () => {
      cambiarPagina(numero);
      let startPage = 1;
      const halfWindowSize = Math.floor(windowSize / 2);
      let endPage = Math.min(windowSize, totalPaginas);

      if (totalPaginas > windowSize) {
        if (paginaActual <= halfWindowSize) {
          startPage = 1;
          endPage = windowSize;
          console.log("hola if 1");
        } else if (paginaActual > totalPaginas - halfWindowSize) {
          startPage = totalPaginas - windowSize + 1;
          endPage = totalPaginas;
          console.log("hola if 2");
        } else {
          startPage = paginaActual - halfWindowSize;
          endPage = paginaActual + halfWindowSize;
          console.log("hola if 3");
        }
      }

      generarPaginacion(startPage, endPage, totalPaginas, windowSize);
    });
  }

  return pageItem;
}


function crearElementoEllipsis() {
  const ellipsisItem = document.createElement('li');
  ellipsisItem.className = 'page-item';
  ellipsisItem.innerHTML = '<a class="page-link" href="#">...</a>';
  return ellipsisItem;
}

function obtenerCantidadTotalPokemones() {
  fetch('https://pokeapi.co/api/v2/pokemon?limit=1')
    .then(response => response.json())
    .then(data => {
      const totalPokemones = data.count;
      console.log(" total pokemones" + totalPokemones);
      const pokemonPorPagina = 30; // Cantidad de Pokémon a mostrar por página
      const totalPages = Math.ceil(totalPokemones / pokemonPorPagina);
      totalPaginas = totalPages;
      const paginationList = document.getElementById('pagination-list');

      let startPage = 1;
      const halfWindowSize = Math.floor(windowSize / 2);
      let endPage = Math.min(windowSize, totalPaginas);

      generarPaginacion(startPage, endPage, totalPaginas, windowSize);
      // Llamada inicial para mostrar la primera página
      cambiarPagina(1);
    })
    .catch(error => {
      console.error('Error al obtener la cantidad total de Pokémon:', error);
    });
}


//bien 
function cambiarPagina(pagina) {
  console.log("cambiar pagina fun" + pagina);
  paginaActual = pagina;
  const pokemonPorPagina = 30; // Cantidad de Pokémon a mostrar por página
  const offset = (pagina - 1) * pokemonPorPagina;
  const limit = pokemonPorPagina;
  obtenerPokemones(offset, limit);
  console.log("pagina actual" + paginaActual);
}

function obtenerPokemones(offset, limit) {
  const pokemonContainer = document.getElementById('pokemon-container');
  pokemonContainer.innerHTML = ''; // Limpiar el contenedor de Pokémon

  fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
    .then(response => response.json())
    .then(data => {
      data.results.forEach(pokemon => {
        fetch(pokemon.url)
          .then(response => response.json())
          .then(pokemonData => {
            // Crear un contenedor de tarjeta para cada Pokémon
            const cardContainer = document.createElement('div');
            cardContainer.className = 'col';
            cardContainer.innerHTML = `
                <div class="col text-center">
                  <div class="card shadow-sm">
                    <img class="bd-placeholder-img card-img-top imageContainer" src="${pokemonData.sprites.front_default}" width="100%" height="100%">
                    <div class="card-body cardColor">
                      <p class="card-text Letra1">${pokemonData.name}</p>
                      <div class="align-items-center">
                        <div class="btn-group">
                          <button type="button" class="btn btn-primary my-2" onclick="mostrarDetalles('${pokemonData.name}')">ver mas informacion</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            pokemonContainer.appendChild(cardContainer);
          })
          .catch(error => {
            console.error(error);
          });
      });
    })
    .catch(error => {
      console.error(error);
    });
}

function mostrarDetalles(pokemonName) {
  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    .then(response => response.json())
    .then(data => {
      mostrarModal(data);
    })
    .catch(error => {
      console.error('Error al obtener los detalles del Pokémon:', error);
    });
}

function mostrarModal(pokemonData) {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-details');

  // Obtener la descripción del Pokémon en español
  const pokemonSpeciesURL = pokemonData.species.url;
  fetch(pokemonSpeciesURL)
    .then(response => response.json())
    .then(data => {
      const pokemonDescription = data.flavor_text_entries.find(entry => entry.language.name === 'es').flavor_text;

      // Actualizar el contenido del modal con la descripción obtenida
      modalContent.innerHTML = `
        <div class="card shadow align-items-center" style="width: 100%;">
          <h2 class="cardColor text-center Letra1" style="width: 100%;">${pokemonData.name}</h2>
          <img class="imageContainer" src="${pokemonData.sprites.front_default}" alt="${pokemonData.name}" width="70%" height="70%">
          <div class="fondo align-items-center" style="width: 100%;">
          <br>
          </div>

          <div class="descripcion align-items-center" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
          <p>Altura: ${(pokemonData.height / 10).toFixed(2)} m</p>
          <p>Peso: ${(pokemonData.weight / 10).toFixed(2)} kg</p>
          </div>
          <h3 class="cardColor2 text-center Letra1" style="width: 100%;">Descripción:</h3>
          <p class="text-center descripcion">${pokemonDescription}</p>
          <h3 class="cardColor2 text-center Letra1" style="width: 100%;">Tipo:</h3>
          <div class="descripcion align-items-center" style="width: 100%; display: flex; justify-content: center;">
          <ul>
            ${pokemonData.types.map(type => `<li>${type.type.name}</li>`).join('')}
          </ul>
          </div>
          <h3 class="cardColor2 text-center Letra1" style="width: 100%;">Habilidades:</h3>
          <div class="descripcion align-items-center" style="width: 100%; display: flex; justify-content: center;">
          <ul>
            ${pokemonData.abilities.map(ability => `<li>${ability.ability.name}</li>`).join('')}
          </ul>
          </div>
          <h3 class="cardColor2 text-center Letra1" style="width: 100%;">Movimientos:</h3>
          <div class="descripcion align-items-center" style="width: 100%; display: flex; justify-content: center;">
          <ul >
            ${pokemonData.moves.slice(0, 3).map(move => `<li>${move.move.name}</li>`).join('')}
          </ul>
          </div>
          
          
        </div>
      `;

      modal.style.display = 'block';
    })
    .catch(error => {
      console.log('Error al obtener la descripción del Pokémon:', error);
    });

  const closeButton = document.getElementsByClassName('close')[0];
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}


function pokemonVista() {
  const pokemonPorPagina = 30; // Cantidad de Pokémon a mostrar por página

  obtenerCantidadTotalPokemones(); // Obtener la cantidad total de Pokémon
}

