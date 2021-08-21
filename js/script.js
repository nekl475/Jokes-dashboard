const form = document.querySelector(`#formJoke`),
    jokeContainer = document.querySelector(`#searchContainer`),
    categoriesCategory = document.querySelector(`#categoriesCategory`),
    jokeCategories = document.querySelectorAll(`input[name="jokeType"]`),
    categoriesList = document.querySelector(`#categoriesList`),
    searchJoke = document.querySelector(`#searchJoke`),
    DOMAIN = `https://api.chucknorris.io`,
    newFaw = document.querySelector(`#jokeFave`);



jokeCategories.forEach(input => {
    input.addEventListener(`change`, () => {

        let catList = document.querySelectorAll(`.external`);

        if (input.id == `categoriesCategory`) {
            catList.forEach(btn => {
                btn.classList.add(`show`);
            });
        } else {
            catList.forEach(btn => {
                btn.classList.remove(`show`);
            });
        }
        let checkedCategory = categoriesList.querySelector(`input[name="categoryList"]:checked`),
            checkedCategoryIndex = checkedCategory.dataset.index;

        if (checkedCategoryIndex !== 0) {
            checkedCategory.checked = false;
            categoriesList.querySelector(`input[name="categoryList"][data-index="0"]`).checked = true;

        }
    });
});

const getCategories = () => {

    let xhr = new XMLHttpRequest();
    xhr.open(`GET`, `${DOMAIN}/jokes/categories`);
    xhr.send();

    xhr.addEventListener(`readystatechange`, () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let categories = JSON.parse(xhr.responseText);
            renderCategories(categories);
        }
    });
};

getCategories();


const renderCategories = data => {
    let renderLI = data.map((cat, index) => {
            return `
					<label for="categoryList${cat}">
                    <input type="radio" value="${cat}" name="categoryList" id="categoryList${cat}" ${!index ? 'checked' : ''} data-index="${index}">
                    <span class ="external">${cat}</span>
                    </label>
				`;
        })
        .join(``);

    categoriesList.innerHTML = renderLI;
};

class Form {
    constructor(el) {
        el.addEventListener(`submit`, e => {
            e.preventDefault();
            this.formSubmit();
        });
    }

    formSubmit() {
        let type = form.querySelector(`input[name="jokeType"]:checked`).value;

        if (type === 'random') {
            this.getJoke(`${DOMAIN}/jokes/random`);
        } else if (type === `categories`) {
            let cat = categoriesList.querySelector(`input[name="categoryList"]:checked`).value;
            this.getJoke(`${DOMAIN}/jokes/random?category=${cat}`);
        } else if (type === `search`) {
            this.getJoke(`${DOMAIN}/jokes/search?query=${searchJoke.value}`);
        }
    }

    getJoke(url) {
        let xhr = new XMLHttpRequest();
        xhr.open(`GET`, url);
        xhr.send();

        xhr.addEventListener(`readystatechange`, () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let joke = JSON.parse(xhr.responseText);

                jokeContainer.innerHTML = '';

                if (joke.result && joke.result.length) {
                    joke.result.forEach(jok => {
                        this.renderJoke(jok, jokeContainer);
                    });
                } else if (!joke.result) {
                    this.renderJoke(joke, jokeContainer);
                }

            }
        });
    }
    setJokesLock(arr) {
        localStorage.setItem(`favsJok`, JSON.stringify(arr));
    }

    getJokesLock() {
        let favJokes = localStorage.getItem(`favsJok`);
        return favJokes ? JSON.parse(favJokes) : new Array();
    }

    renderJoke(jokeData, container, favourite = false) {

            let jokeBlock = document.createElement(`div`);
            jokeBlock.className = `joke__block`;

            let favJokeLabel = document.createElement(`label`);
            favJokeLabel.for = `favJoke${jokeData.id}`;

            let favJokeLabelImg = document.createElement(`img`);
            favJokeLabelImg.src = `img/${favourite ? `heart.svg`:`Vector.svg`}`;
        favJokeLabelImg.alt = `like`;

        let favJokeLabelInput = document.createElement(`input`);
        favJokeLabelInput.type = `checkbox`;
        favJokeLabelInput.id = `favJoke${jokeData.id}`;
        favJokeLabelInput.className = `joke__block--heart`;

        favJokeLabelInput.addEventListener(`click`, () => {
            let localJokes = this.getJokesLock();
            if(favourite){
                let indexFavJ = localJokes.findIndex(localJoke=> localJoke.id === jokeData.id);
                localJokes.splice(indexFavJ, 1);
                this.setJokesLock(localJokes);
                this.getFavJokes();
            }else{
                let jokeExist = localJokes.find(lockjoke => lockjoke.id === jokeData.id);
                if(!jokeExist){
                    localJokes.push(jokeData);
                    this.setJokesLock(localJokes);
                    this.renderJoke(jokeData,newFaw, true);
                }
                 
             
               
                   
            }
            
            
        });

        favJokeLabel.append(favJokeLabelImg,favJokeLabelInput);

        jokeBlock.innerHTML = `<br>
            <div class="joke__text">
                <img src="${jokeData.icon_url}" alt="joke icon" width="30" height="30" loading="lazy">
                <div class="joke__withid">
                    <p class="joke__withid--p">ID:
                        <a href="${jokeData.url} " target="_blank " class="joke__withid--id ">${jokeData.id}
                            <img src="img/link.svg" alt="link">
                        </a>
                    </p>
                    <p class="joke__withid--text">${jokeData.value}</p>
                    <p class="joke__withid--date">Last update:${jokeData.updated_at}</p>
                    ${jokeData.categories.length ? `<p class="joke__withid--category">${jokeData.categories[0]}</p>` : ``}
                </div>
            </div>`;

        jokeBlock.prepend(favJokeLabel);
        
        container.append(jokeBlock);
        
    }
	
    getFavJokes() {       
        newFaw.innerHTML = '';

        let lokalJokes = this.getJokesLock();
        lokalJokes.forEach(jokes =>{
            this.renderJoke(jokes,newFaw,true);
        });
    }
}

let JokeForm = new Form(form);
JokeForm.getFavJokes();