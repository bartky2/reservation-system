document.addEventListener("DOMContentLoaded", function () {
  // Elementy nawigacji
  const mainPanelLink = document.getElementById("main-panel");
  const myReservationsLink = document.getElementById("my-reservations");

  // Widoki
  const mainView = document.getElementById("main-view");
  const reservationView = document.getElementById("reservation-view");
  const myReservationsView = document.getElementById("my-reservations-view");

  // Komunikat sukcesu
  const successMessage = document.getElementById("success-message");
  const successText = document.getElementById("success-text");
  const reservationInfo = document.getElementById("reservation-info");
  const viewReservationsLink = document.getElementById("view-reservations");
  const closeSuccessBtn = document.querySelector(".success-message .close-btn"); // Sprecyzowanie selektora

  // Elementy niestandardowego okna dialogowego potwierdzenia
  const confirmDialogOverlay = document.getElementById(
    "confirm-dialog-overlay"
  );
  const confirmDialogTitle = document.getElementById("confirm-dialog-title");
  const confirmDialogText = document.getElementById("confirm-dialog-text");
  const confirmDialogOkBtn = document.getElementById("confirm-dialog-ok");
  const confirmDialogCancelBtn = document.getElementById(
    "confirm-dialog-cancel"
  );
  let confirmCallback = null; // Zmienna do przechowywania funkcji callback

  // Przyciski i elementy interaktywne
  let resourceCards = document.querySelectorAll(".resource-card"); // Zmienione na let, aby można było aktualizować
  const tabButtons = document.querySelectorAll(".tab-button");
  const backToListBtn = document.getElementById("back-to-list");
  const timeSlots = document.querySelectorAll(".time-slot");
  const reserveBtn = document.getElementById("reserve-btn");
  reserveBtn.classList.add("btn");
  const datePicker = document.getElementById("date-picker");

  // Elementy do aktualizacji
  const reservationTitle = document.getElementById("reservation-title");
  const reservationDate = document.getElementById("reservation-date");
  const reservationCapacity = document.getElementById("reservation-capacity");

  // Dane zasobów
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

  // Przechowywanie rezerwacji
  let userReservations = [];
  let selectedRoom = null;
  let selectedTime = null;

  // Funkcja do przełączania widoków
  function showView(view) {
    // Ukryj wszystkie widoki
    mainView.classList.add("hidden");
    reservationView.classList.add("hidden");
    myReservationsView.classList.add("hidden");

    // Pokaż wybrany widok
    view.classList.remove("hidden");

    // Aktualizacja aktywnego linku w nawigacji
    if (view === mainView) {
      mainPanelLink.classList.add("active");
      myReservationsLink.classList.remove("active");
    } else if (view === myReservationsView) {
      myReservationsLink.classList.add("active");
      mainPanelLink.classList.remove("active");
    }
  }

  // Funkcja do renderowania kart zasobów
  function renderResourceCards(filterCategory = "all") {
    const resourcesContainer = document.querySelector(".resources-container");
    resourcesContainer.innerHTML = ""; // Wyczyść istniejące karty

    Object.keys(resources).forEach((key) => {
      const resource = resources[key];
      if (filterCategory === "all" || resource.category === filterCategory) {
        const card = document.createElement("div");
        card.className = "resource-card";
        card.setAttribute("data-room", key);

        // Różne wyświetlanie informacji w zależności od kategorii zasobu
        let detailsHTML = "";

        if (resource.category === "computer-equipment") {
          // Dla sprzętu komputerowego pokazujemy specyfikację zamiast pojemności
          detailsHTML = `
            <p>Specyfikacja: ${resource.equipment}</p>
            <p>Dostępność: Natychmiastowa</p>
          `;
        } else {
          // Dla innych kategorii pokazujemy standardowe informacje
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

    // Ponownie przypisz event listenery do nowo utworzonych kart
    resourceCards = document.querySelectorAll(".resource-card");
    addEventListenersToResourceCards();
  }

  // Funkcja do dodawania event listenerów do kart zasobów
  function addEventListenersToResourceCards() {
    resourceCards.forEach((card) => {
      card.addEventListener("click", function () {
        const roomId = this.getAttribute("data-room");
        selectedRoom = roomId;
        const room = resources[roomId];

        // Aktualizacja widoku rezerwacji
        reservationTitle.textContent = `Rezerwacja: ${room.name}`;
        reservationDate.textContent = datePicker.value;

        // Różne wyświetlanie informacji w zależności od kategorii zasobu
        if (room.category === "computer-equipment") {
          // Dla sprzętu komputerowego pokazujemy specyfikację zamiast pojemności
          reservationCapacity.textContent = room.equipment;
          // Zmień etykietę na "Specyfikacja" zamiast "Pojemność"
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
          // Dla innych kategorii pokazujemy standardowe informacje
          reservationCapacity.textContent = room.capacity;
          // Przywróć etykietę "Pojemność"
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

        // Pokaż widok rezerwacji
        showView(reservationView);
      });
    });
  }

  // Obsługa kliknięcia na zakładki kategorii
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Zaktualizuj style i klasy dla wszystkich zakładek
      tabButtons.forEach((btn) => {
        btn.classList.remove("tab-active");
        // btn.style.color = "#333"; // Kolor nieaktywnych zakładek jest zarządzany przez CSS z !important
      });
      // Dodaj klasę 'tab-active' dla klikniętej zakładki
      this.classList.add("tab-active");

      const category = this.getAttribute("data-category");
      renderResourceCards(category);
    });
  });

  // Ustawienie początkowego stanu aktywnej zakładki (jeśli istnieje)
  const initialActiveTab = document.querySelector(".tab-button.tab-active");
  if (initialActiveTab) {
    initialActiveTab.style.color = "white"; // Ustawienie koloru dla początkowo aktywnej zakładki
  }

  // Początkowe renderowanie kart zasobów - wywołanie po załadowaniu DOM
  // renderResourceCards(); // Usunięto to wywołanie, ponieważ jest już na końcu pliku

  // Obsługa przycisku powrotu do listy
  backToListBtn.addEventListener("click", function (e) {
    e.preventDefault();
    showView(mainView);
    // Resetuj wybór godziny
    timeSlots.forEach((slot) => slot.classList.remove("selected"));
    selectedTime = null;
  });

  // Obsługa wyboru godziny
  timeSlots.forEach((slot) => {
    slot.addEventListener("click", function () {
      // Usuń klasę 'selected' ze wszystkich slotów
      timeSlots.forEach((s) => s.classList.remove("selected"));
      // Dodaj klasę 'selected' do klikniętego slotu
      this.classList.add("selected");
      selectedTime = this.textContent;
    });
  });

  // Obsługa przycisku rezerwacji
  reserveBtn.addEventListener("click", function () {
    if (!selectedTime) {
      alert("Proszę wybrać godzinę rezerwacji.");
      return;
    }

    const room = resources[selectedRoom];
    const date = datePicker.value;

    // Dodaj rezerwację do listy
    userReservations.push({
      room: room.name,
      date: date,
      time: selectedTime,
    });

    // Aktualizuj widok moich rezerwacji
    updateMyReservationsView();

    // Wyświetl komunikat sukcesu
    successText.textContent = "Twoja rezerwacja została pomyślnie utworzona.";
    reservationInfo.textContent = `Zasób: ${room.name}, Data: ${formatDate(
      date
    )}, Godzina: ${selectedTime}`;
    successMessage.classList.remove("hidden");

    // Przejdź do widoku głównego
    showView(mainView);
  });

  // Obsługa zamknięcia komunikatu sukcesu
  closeSuccessBtn.addEventListener("click", function () {
    successMessage.classList.add("hidden");
  });

  // Obsługa linku do rezerwacji w komunikacie sukcesu
  viewReservationsLink.addEventListener("click", function (e) {
    e.preventDefault();
    successMessage.classList.add("hidden");
    showView(myReservationsView);
  });

  // Obsługa linków nawigacyjnych
  mainPanelLink.addEventListener("click", function (e) {
    e.preventDefault();
    showView(mainView);
  });

  myReservationsLink.addEventListener("click", function (e) {
    e.preventDefault();
    showView(myReservationsView);
  });

  // Funkcja aktualizująca widok moich rezerwacji
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

    // Dodaj obsługę przycisków usuwania
    const deleteButtons = document.querySelectorAll(".btn-danger");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const index = parseInt(this.getAttribute("data-index"));
        deleteReservation(index);
      });
    });
  }

  // Funkcja wyświetlająca niestandardowe okno dialogowe potwierdzenia
  function showConfirmDialog(title, text, callback) {
    confirmDialogTitle.textContent = title;
    confirmDialogText.textContent = text;
    confirmCallback = callback;
    confirmDialogOverlay.classList.add("visible");
  }

  // Obsługa przycisków w niestandardowym oknie dialogowym
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

  // Funkcja usuwająca rezerwację
  function deleteReservation(index) {
    const reservation = userReservations[index];
    const dialogTitle = "Potwierdzenie usunięcia";
    const dialogText = `Czy na pewno chcesz usunąć rezerwację ${
      reservation.room
    } na dzień ${formatDate(reservation.date)} o godzinie ${reservation.time}?`;

    showConfirmDialog(dialogTitle, dialogText, function () {
      userReservations.splice(index, 1);
      updateMyReservationsView();
      // Wyświetl komunikat sukcesu
      successText.textContent = "Rezerwacja została pomyślnie usunięta.";
      reservationInfo.textContent = `Usunięto: ${
        reservation.room
      }, Data: ${formatDate(reservation.date)}, Godzina: ${reservation.time}`;
      successMessage.classList.remove("hidden");
    });
  }

  // Funkcja formatująca datę
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0].split("-").reverse().join("-");
  }

  // Inicjalizacja - dodaj przykładową rezerwację
  userReservations.push({
    room: "Sala Konferencyjna A",
    date: "2025-06-08",
    time: "09:00",
  });

  // Aktualizuj widok moich rezerwacji
  updateMyReservationsView();
  // Początkowe renderowanie kart zasobów po załadowaniu DOM i zainicjowaniu innych elementów
  renderResourceCards();
});
