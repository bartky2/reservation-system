document.addEventListener("DOMContentLoaded", function () {
  const mainPanelLink = document.getElementById("main-panel");
  const myReservationsLink = document.getElementById("my-reservations");

  const mainView = document.getElementById("main-view");
  const reservationView = document.getElementById("reservation-view");
  const myReservationsView = document.getElementById("my-reservations-view");

  const successMessage = document.getElementById("success-message");
  const successText = document.getElementById("success-text");
  const reservationInfo = document.getElementById("reservation-info");
  const viewReservationsLink = document.getElementById("view-reservations");
  const closeSuccessBtn = document.querySelector(".success-message .close-btn");

  const confirmDialogOverlay = document.getElementById(
    "confirm-dialog-overlay"
  );
  const confirmDialogTitle = document.getElementById("confirm-dialog-title");
  const confirmDialogText = document.getElementById("confirm-dialog-text");
  const confirmDialogOkBtn = document.getElementById("confirm-dialog-ok");
  const confirmDialogCancelBtn = document.getElementById(
    "confirm-dialog-cancel"
  );
  let confirmCallback = null;

  let resourceCards = document.querySelectorAll(".resource-card");
  const tabButtons = document.querySelectorAll(".tab-button");
  const backToListBtn = document.getElementById("back-to-list");
  const timeSlots = document.querySelectorAll(".time-slot");
  const reserveBtn = document.getElementById("reserve-btn");
  reserveBtn.classList.add("btn");
  const datePicker = document.getElementById("date-picker");

  const reservationTitle = document.getElementById("reservation-title");
  const reservationDate = document.getElementById("reservation-date");
  const reservationCapacity = document.getElementById("reservation-capacity");

  const resources = {
    "sala-a": {
      name: "Sala Konferencyjna A",
      capacity: "10 osób",
      equipment: "Projektor, Tablica",
      category: "conference-room",
    },
    "sala-b": {
      name: "Sala Konferencyjna B",
      capacity: "6 osób",
      equipment: "TV, Tablica",
      category: "conference-room",
    },
    "pokoj-c": {
      name: "Pokój Spotkań C",
      capacity: "4 osoby",
      equipment: "Tablica",
      category: "conference-room",
    },
    "samochod-1": {
      name: "Samochód Toyota Corolla",
      capacity: "5 osób",
      equipment: "Klimatyzacja, GPS",
      category: "car",
    },
    "samochod-2": {
      name: "Samochód Ford Focus",
      capacity: "5 osób",
      equipment: "Klimatyzacja",
      category: "car",
    },
    "laptop-1": {
      name: "Laptop Dell XPS 15",
      capacity: "1 osoba",
      equipment: "Intel i7, 16GB RAM, 512GB SSD",
      category: "computer-equipment",
    },
    "projektor-1": {
      name: "Projektor Epson EB-U05",
      capacity: "N/A",
      equipment: "Full HD, 3400 Lumenów",
      category: "computer-equipment",
    },
  };

  let userReservations = [];
  let selectedRoom = null;
  let selectedTime = null;

  function showView(view) {
    mainView.classList.add("hidden");
    reservationView.classList.add("hidden");
    myReservationsView.classList.add("hidden");

    view.classList.remove("hidden");

    if (view === mainView) {
      mainPanelLink.classList.add("active");
      myReservationsLink.classList.remove("active");
    } else if (view === myReservationsView) {
      myReservationsLink.classList.add("active");
      mainPanelLink.classList.remove("active");
    }
  }

  function renderResourceCards(filterCategory = "all") {
    const resourcesContainer = document.querySelector(".resources-container");
    resourcesContainer.innerHTML = "";

    Object.keys(resources).forEach((key) => {
      const resource = resources[key];
      if (filterCategory === "all" || resource.category === filterCategory) {
        const card = document.createElement("div");
        card.className = "resource-card";
        card.setAttribute("data-room", key);

        let detailsHTML = "";

        if (resource.category === "computer-equipment") {
          detailsHTML = `
            <p>Specyfikacja: ${resource.equipment}</p>
            <p>Dostępność: Natychmiastowa</p>
          `;
        } else {
          detailsHTML = `
            <p>Pojemność: ${resource.capacity}</p>
            <p>Wyposażenie: ${resource.equipment}</p>
          `;
        }

        card.innerHTML = `
          <h4>${resource.name}</h4>
          ${detailsHTML}
        `;
        resourcesContainer.appendChild(card);
      }
    });

    resourceCards = document.querySelectorAll(".resource-card");
    addEventListenersToResourceCards();
  }

  function addEventListenersToResourceCards() {
    resourceCards.forEach((card) => {
      card.addEventListener("click", function () {
        const roomId = this.getAttribute("data-room");
        selectedRoom = roomId;
        const room = resources[roomId];

        reservationTitle.textContent = `Rezerwacja: ${room.name}`;
        reservationDate.textContent = datePicker.value;

        if (room.category === "computer-equipment") {
          reservationCapacity.textContent = room.equipment;
          const capacityLabel = document.querySelector(
            'label[for="reservation-capacity"], .reservation-details p'
          );
          if (
            capacityLabel &&
            capacityLabel.textContent.includes("Pojemność")
          ) {
            capacityLabel.innerHTML = capacityLabel.innerHTML.replace(
              "Pojemność:",
              "Specyfikacja:"
            );
          }
        } else {
          reservationCapacity.textContent = room.capacity;
          const capacityLabel = document.querySelector(
            'label[for="reservation-capacity"], .reservation-details p'
          );
          if (
            capacityLabel &&
            capacityLabel.textContent.includes("Specyfikacja")
          ) {
            capacityLabel.innerHTML = capacityLabel.innerHTML.replace(
              "Specyfikacja:",
              "Pojemność:"
            );
          }
        }

        showView(reservationView);
      });
    });
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      tabButtons.forEach((btn) => {
        btn.classList.remove("tab-active");
      });
      this.classList.add("tab-active");

      const category = this.getAttribute("data-category");
      renderResourceCards(category);
    });
  });

  const initialActiveTab = document.querySelector(".tab-button.tab-active");
  if (initialActiveTab) {
    initialActiveTab.style.color = "white";
  }

  backToListBtn.addEventListener("click", function (e) {
    e.preventDefault();
    showView(mainView);
    timeSlots.forEach((slot) => slot.classList.remove("selected"));
    selectedTime = null;
  });

  timeSlots.forEach((slot) => {
    slot.addEventListener("click", function () {
      timeSlots.forEach((s) => s.classList.remove("selected"));
      this.classList.add("selected");
      selectedTime = this.textContent;
    });
  });

  reserveBtn.addEventListener("click", function () {
    if (!selectedTime) {
      alert("Proszę wybrać godzinę rezerwacji.");
      return;
    }

    const room = resources[selectedRoom];
    const date = datePicker.value;

    userReservations.push({
      room: room.name,
      date: date,
      time: selectedTime,
    });

    updateMyReservationsView();

    successText.textContent = "Twoja rezerwacja została pomyślnie utworzona.";
    reservationInfo.textContent = `Zasób: ${room.name}, Data: ${formatDate(
      date
    )}, Godzina: ${selectedTime}`;
    successMessage.classList.remove("hidden");

    showView(mainView);
  });

  closeSuccessBtn.addEventListener("click", function () {
    successMessage.classList.add("hidden");
  });

  viewReservationsLink.addEventListener("click", function (e) {
    e.preventDefault();
    successMessage.classList.add("hidden");
    showView(myReservationsView);
  });

  mainPanelLink.addEventListener("click", function (e) {
    e.preventDefault();
    showView(mainView);
  });

  myReservationsLink.addEventListener("click", function (e) {
    e.preventDefault();
    showView(myReservationsView);
  });

  function updateMyReservationsView() {
    const reservationsList = document.querySelector(".reservations-list");
    reservationsList.innerHTML = "";

    if (userReservations.length === 0) {
      reservationsList.innerHTML = "<p>Nie masz żadnych rezerwacji.</p>";
      return;
    }

    userReservations.forEach((reservation, index) => {
      const reservationItem = document.createElement("div");
      reservationItem.className = "reservation-item";
      reservationItem.innerHTML = `
                <h3>${reservation.room}</h3>
                <p>Data: ${formatDate(reservation.date)}, Godzina: ${
        reservation.time
      }</p>
                <button class="btn btn-danger" data-index="${index}">Usuń rezerwację</button>
            `;
      reservationsList.appendChild(reservationItem);
    });

    const deleteButtons = document.querySelectorAll(".btn-danger");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const index = parseInt(this.getAttribute("data-index"));
        deleteReservation(index);
      });
    });
  }

  function showConfirmDialog(title, text, callback) {
    confirmDialogTitle.textContent = title;
    confirmDialogText.textContent = text;
    confirmCallback = callback;
    confirmDialogOverlay.classList.add("visible");
  }

  confirmDialogOkBtn.addEventListener("click", function () {
    if (confirmCallback) {
      confirmCallback();
    }
    confirmDialogOverlay.classList.remove("visible");
    confirmCallback = null;
  });

  confirmDialogCancelBtn.addEventListener("click", function () {
    confirmDialogOverlay.classList.remove("visible");
    confirmCallback = null;
  });

  function deleteReservation(index) {
    const reservation = userReservations[index];
    const dialogTitle = "Potwierdzenie usunięcia";
    const dialogText = `Czy na pewno chcesz usunąć rezerwację ${
      reservation.room
    } na dzień ${formatDate(reservation.date)} o godzinie ${reservation.time}?`;

    showConfirmDialog(dialogTitle, dialogText, function () {
      userReservations.splice(index, 1);
      updateMyReservationsView();
      successText.textContent = "Rezerwacja została pomyślnie usunięta.";
      reservationInfo.textContent = `Usunięto: ${
        reservation.room
      }, Data: ${formatDate(reservation.date)}, Godzina: ${reservation.time}`;
      successMessage.classList.remove("hidden");
    });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0].split("-").reverse().join("-");
  }

  userReservations.push({
    room: "Sala Konferencyjna A",
    date: "2025-06-08",
    time: "09:00",
  });

  updateMyReservationsView();
  renderResourceCards();
});
