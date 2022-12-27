
const items = document.querySelector('.todo-list');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const paginate = document.querySelector('.paginate');

const postsPerPage = 5;
const scroll = false;
let currentPage = 1;



function activeArrow(currentPage, countElem) {
	if(scroll === false){
		if(currentPage === 1) {
			prev.classList.toggle('disabled');
		}
		else {
			prev.classList.remove('disabled');
		}
	
		if(currentPage === countElem) {
			next.classList.toggle('disabled');
		}
		else {
			next.classList.remove('disabled');
		}
	}
}


function setActiveNum(currentPage) {
  document.querySelectorAll(".paginate-item").forEach((el) => {
    el.classList.remove("active");
    
    const pageIndex = Number(el.getAttribute("page-index"));
    if (pageIndex === currentPage) el.classList.add("active");
  });
}


async function createItemHTML(currentPage) {
	items.textContent = "";
	const data = await getItems();
	const indexOfLastPost = +currentPage * postsPerPage;
	const indexOfFirstPost = indexOfLastPost - postsPerPage;
	const currentPost = data.slice(indexOfFirstPost, indexOfLastPost);
	currentPost.forEach(el => {
		items.insertAdjacentHTML('beforeend', `
			<li class="todo-item" id=item-${el.id}>
				<input class="checkbox" type="checkbox" ${el.completed}>
				<label class="title">${el.title}</label>
				<input class="textfield" type="text">
				<button class="edit">изменить</button>
				<button class="delete">удалить</button>
			</li>
		`);
	});
	setActiveNum(currentPage);
}


async function getItems() {
  const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=52');
  const data = await res.json();
	return data;
}


function createPaginateHTML(el) {
	const pageNum = document.createElement("li");
	pageNum.className = "paginate-item";
	pageNum.textContent = el;
	pageNum.setAttribute("page-index", el);
	pageNum.setAttribute("aria-label", "Page " + el);
	paginate.appendChild(pageNum);
	return pageNum;
}


function getPaginateNum(pageNumbers) {
	pageNumbers.forEach(el => {
		createPaginateHTML(el);
	});
}


function changePaginateArr(pageNumbers, index, arrOfCurrButtons) {
	paginate.innerHTML = "";

	if( !isNaN(index) ) index = Number(index);

	const leftDots = "... ";
	const commonDots = "...";
	const rightDots = " ...";

	if(pageNumbers.length < 6){
		getPaginateNum(pageNumbers);
	}	
	else {
		if(index >= 1 && index <= 3){
			getPaginateNum([1, 2, 3, 4, commonDots, pageNumbers.length])
		}
		else if(index === 4) {
			const sliced = pageNumbers.slice(0, 5)
			getPaginateNum([...sliced, commonDots, pageNumbers.length])
		}
		else if(index >= 5 && index < pageNumbers.length - 2) { 
      const sliced1 = pageNumbers.slice(index - 2, index);
      const sliced2 = pageNumbers.slice(index, index + 1);
			getPaginateNum([1, leftDots, ...sliced1, ...sliced2, rightDots, pageNumbers.length]);
		}
		else if(index > pageNumbers.length - 3) { 
			const sliced = pageNumbers.slice(pageNumbers.length - 4);                    
			getPaginateNum([1, leftDots, ...sliced]);
		}
		else if(index === commonDots) {
			currentPage = Number(arrOfCurrButtons[arrOfCurrButtons.length - 3]) + 1;
			changePaginateArr(pageNumbers, Number(arrOfCurrButtons[arrOfCurrButtons.length - 3]) + 1, arrOfCurrButtons);
			createItemHTML( +arrOfCurrButtons[arrOfCurrButtons.length - 3] + 1 );
		}
		else if(index === leftDots) {
			currentPage = Number(arrOfCurrButtons[3]) - 2;
			changePaginateArr(pageNumbers, Number(arrOfCurrButtons[3]) - 2, arrOfCurrButtons);
			createItemHTML( Number(arrOfCurrButtons[3]) - 2 );
    }
    else if(index === rightDots) {
			currentPage = Number(arrOfCurrButtons[3]) + 2;
			changePaginateArr(pageNumbers, Number(arrOfCurrButtons[3]) + 2, arrOfCurrButtons);
			createItemHTML( Number(arrOfCurrButtons[3]) + 2 );
    }
	}
}


async function getPaginationNums() {
	const data = await getItems();

	const pageNumbers = [];
	for(let i = 1; i <= Math.ceil(data.length / postsPerPage); i++) 
		pageNumbers.push(i);

		return pageNumbers;
}



window.addEventListener('DOMContentLoaded', async () => {
	const data = await getItems();
	const arrPag = await getPaginationNums();

	changePaginateArr(arrPag, currentPage, []);
	createItemHTML(currentPage);

	activeArrow(currentPage, arrPag);

	paginate.addEventListener('click', e => {
		if(e.target && e.target.tagName == 'LI') {
			currentPage = e.target.getAttribute('page-index');

			activeArrow(Number(currentPage), arrPag.length);
			createItemHTML( Number(e.target.getAttribute('page-index')));
			changePaginateArr(arrPag, e.target.getAttribute('page-index'), [...paginate.childNodes].map(el => el.textContent));
		}
	});

	prev.addEventListener('click', e => {
		if(scroll) {
			(--currentPage <= 0) ? currentPage = arrPag.length : currentPage;
		}
		else {
			(--currentPage <= 0) ? currentPage = 1 : currentPage;
		}

		activeArrow(currentPage, arrPag.length);
		createItemHTML( currentPage );
		changePaginateArr(arrPag, currentPage, [...paginate.childNodes].map(el => el.textContent));
	});
	next.addEventListener('click', e => {
		if(scroll) {
			(++currentPage > arrPag.length) ? currentPage = 1 : currentPage;
		}
		else {
			(++currentPage > arrPag.length) ? currentPage = arrPag.length : currentPage;
		}
		
		activeArrow(currentPage, arrPag.length);		
		createItemHTML( currentPage );
		changePaginateArr(arrPag, currentPage, [...paginate.childNodes].map(el => el.textContent));
	});
});