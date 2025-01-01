import $ from "jquery";
import axios from "axios";

export function initDropdown() {
  const searchInput = $("#search-input");
  const dropdownList = $("#dropdown-list");
  const dropdownContainer = $("#dropdown-container");
  const tagsContainer = $("#tags-container");
  const recentAndHistoryContainer = $("#recent-and-history-container-items");
  const seeAll = $("#see-all");

  const API_URL =
    "https://api.jsonsilo.com/public/6466368b-b15f-4236-a952-81076b35ec03";

  const pageSize = 10;
  let history = JSON.parse(sessionStorage.getItem("history")) || [];
  let page = 1;
  let data = [];
  let filteredData = [];
  let recent = [];

  const initFetchingData = async () => {
    try {
      const response = await axios.get(API_URL, {
        "Content-Type": "application/json",
      });
      data = response.data.data;
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  // Render the recent items
  const renderRecentItems = () => {
    recentAndHistoryContainer.empty();

    recent.forEach((item) => {
      const recentItem = `
      <div class="recent-item" data-id="${item.id}">
        <img src="${item.imageURL}" alt="${item.title}" />
        <span>${item.title}</span>
      </div>
    `;
      recentAndHistoryContainer.append(recentItem);
    });
  };

  // Add item to recent and history
  const addToRecentAndHistory = ({ id, title, imageURL }) => {
    recent = recent.filter((recentItem) => recentItem.id !== id);
    console.log(recent);
    recent.unshift({ id, title, imageURL });
    if (recent.length > 5) recent.pop();
    renderRecentItems();

    if (!history.some((historyItem) => historyItem.id === id)) {
      history.push({ id, title, imageURL });
      sessionStorage.setItem("history", JSON.stringify(history));
    }
  };

  const renderList = () => {
    const startIndex = page * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    paginatedData.forEach((item) => {
      const listItem = `
      <li data-id="${item.id}">
        <img id="${item.id}" src="${item.imageURL}" alt="${item.title}" />
        <span>${item.title}</span>
      </li>
    `;
      dropdownList.append(listItem);
    });

    page++;
  };

  const handleSearch = (query) => {
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
  };

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
  dropdownList.on("scroll", () => {
    if (
      dropdownList.scrollTop() + dropdownList.innerHeight() >=
      dropdownList[0].scrollHeight - 10
    ) {
      renderList();
    }
  });

  const addTag = ({ id, title, imageURL }) => {
    const existingTag = [...tagsContainer.find(".tag")].find(
      (tag) => $(tag).data("id") === id
    );

    if (!existingTag) {
      const tag = `
        <div class="tag" data-id="${id}">
          ${title}
          <span class="remove-tag">x</span>
        </div>
      `;
      tagsContainer.append(tag);
    }

    addToRecentAndHistory({ id, title, imageURL });
  };

  const removeTag = (itemId) => {
    tagsContainer.find(`.tag[data-id="${itemId}"]`).remove();
  };

  // Handle tag adding
  dropdownList.on("click", "li", function () {
    const itemId = $(this).data("id");
    const itemTitle = $(this).text();
    const itemImage = $(this).find("img").attr("src");

    addTag({ id: itemId, title: itemTitle, imageURL: itemImage });
  });

  // Handle tag removal
  tagsContainer.on("click", ".remove-tag", function () {
    const itemId = $(this).parent().data("id");
    removeTag(itemId);
  });

  // Handle history
  seeAll.on("click", () => {
    recentAndHistoryContainer.empty();

    history.forEach((item) => {
      const recentItem = `
      <div class="recent-item" data-id="${item.id}">
        <img src="${item.imageURL}" alt="${item.title}" />
        <span>${item.title}</span>
      </div>
    `;
      recentAndHistoryContainer.append(recentItem);
    });
  });

  // Initial data fetch and render recent items
  initFetchingData();
}
