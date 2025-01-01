import $ from "jquery";
import axios from "axios";

export function initDropdown() {
  const searchInput = $("#dropdown-search");
  const dropdownList = $("#dropdown-list");
  const dropdownContainer = $("#dropdown-container");
  const selectedItems = $("#selected-items");

  const API_URL = "../db.json";
  let page = 1;
  const pageSize = 10;
  let data = [];
  let filteredData = [];

  async function initFetchingData() {
    try {
      const response = await axios.get(API_URL);
      data = response.data.data;
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }

  function renderList() {
    const startIndex = page * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    paginatedData.forEach((item) => {
      const listItem = `
      <li data-id="${item.id}">
        <img src="${item.imageURL}" alt="${item.title}" />
        <span>${item.title}</span>
      </li>
    `;
      dropdownList.append(listItem);
    });

    page++;
  }

  function handleSearch(query) {
    dropdownList.empty();

    page = 0;

    filteredData = data.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredData.length > 0) {
      dropdownContainer.show();
      renderList();
    } else {
      dropdownContainer.hide();
    }
  }

  // Handle search input
  searchInput.on("input", function () {
    const query = $(this).val();
    if (query === "") {
      dropdownList.empty();
      dropdownContainer.hide();
    } else {
      handleSearch(query);
    }
  });

  // Handle infinite scrolling
  dropdownList.on("scroll", function () {
    if (
      dropdownList.scrollTop() + dropdownList.innerHeight() >=
      dropdownList[0].scrollHeight - 10
    ) {
      renderList();
    }
  });

  // Handle selection
  dropdownList.on("click", "li", function () {
    const itemId = $(this).data("id");
    const itemText = $(this).text();
    selectedItems.append(
      `<div class="selected-item" data-id="${itemId}">${itemText}<span class="remove-item">x</span></div>`
    );
  });

  // Handle removal of selected items
  selectedItems.on("click", ".remove-item", function () {
    $(this).parent().remove();
  });

  // Remove dropdown list when clicking outside
  $(document).on("click", function (event) {
    if (!$(event.target).closest("#dropdown-container").length) {
      dropdownList.empty();
      dropdownContainer.hide();
    }
  });

  // Initial data fetch
  initFetchingData();
}
