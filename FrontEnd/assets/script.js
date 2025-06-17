// Fonction qui affiche ou cache un élément selon un booléen, avec display personnalisable
function toggleDisplay(element, show, displayType = "inline-block") {
  if (!element) return;
  element.style.display = show ? displayType : "none";
}

// Met à jour l'affichage selon que l'utilisateur soit connecté ou non
function updateUI(token) {
  const sousProjet = document.querySelector(".sous-projet");
  const editButton = document.querySelector(".edit-button");
  const blocEdit = document.querySelector(".bloc-edit");
  const loginLink = document.getElementById("login-link");
  const logoutLink = document.getElementById("logout-link");

  if (token) {
    if (sousProjet) sousProjet.style.display = "none";
    toggleDisplay(editButton, true);
    toggleDisplay(blocEdit, true, "flex");
    toggleDisplay(loginLink, false);
    toggleDisplay(logoutLink, true);
  } else {
    if (sousProjet) sousProjet.style.display = "flex";
    toggleDisplay(editButton, false);
    toggleDisplay(blocEdit, false);
    toggleDisplay(loginLink, true);
    toggleDisplay(logoutLink, false);
  }
}
////////////////////////////////////////////////////////
function afficherMessageUtilisateur(message, type = "success") {
  const zoneMessage = document.getElementById("message-utilisateur");
  if (!zoneMessage) return;
  zoneMessage.textContent = message;
  zoneMessage.className = type;
  setTimeout(() => {
    zoneMessage.textContent = "";
  }, 3000); // le message s'affiche pendant 3 sec
}
///////////////////////////////////////////////////////
function ajouterMediaDansGaleriePrincipale(work) {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  const figure = document.createElement("figure");
  figure.dataset.id = work.id;

  const img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.title;

  const caption = document.createElement("figcaption");
  caption.textContent = work.title;

  figure.appendChild(img);
  figure.appendChild(caption);
  gallery.appendChild(figure);
}

/*******Partie Modale*********/
function setupModal() {
  // Récupération les éléments nécessaires
  const titreGalerie = document.querySelector(".title-modale h3:nth-of-type(1)");
  const titreAjout = document.querySelector(".title-modale h3:nth-of-type(2)");
  const blocEdit = document.querySelector(".bloc-edit");
  const modale = document.getElementById("modale-edition");
  const fermerModale = document.getElementById("fermer-modale");
  const vueGalerie = document.getElementById("vue-galerie");
  const vueAjout = document.getElementById("vue-ajout");
  const formAjout = document.getElementById("form-ajout-media");
  const selectCategorie = document.getElementById("categorie-media");
  const contenuGalerie = vueGalerie ? vueGalerie.querySelector(".contenu-galerie") : null;
  const boutonAjoutPhoto = document.getElementById("ouvrir-formulaire-ajout");
  const fileInput = document.getElementById("fichier-media");
  const customBtn = document.getElementById("customUploadBtn");
  const previewImg = document.getElementById("previewImage");
  const retourBtn = document.getElementById("retour-galerie");

  // Sécurité : on vérifie que tous les éléments existent avant d'aller plus loin
  if (!blocEdit || !modale || !fermerModale || !vueGalerie || !vueAjout || !formAjout || !selectCategorie || !contenuGalerie || !boutonAjoutPhoto || !fileInput || !customBtn || !previewImg) {
    console.warn("Certains éléments nécessaires à la modale sont manquants.");
    return;
  }

  // Affiche le bouton "Ajouter une photo" uniquement si connecté
  const token = localStorage.getItem("token");
  boutonAjoutPhoto.style.display = token ? "inline-block" : "none";

  // Ouvrir la modale depuis l'icône d'édition
  blocEdit.addEventListener("click", (e) => {
    e.preventDefault();
    const tokenCheck = localStorage.getItem("token");
    if (!tokenCheck) {
      afficherMessageUtilisateur("Vous devez être connecté pour modifier la galerie.", "error");
      return;
    }
    modale.style.display = "flex";
    chargerCategories(); 
    chargerGalerie();    
    afficherVue("galerie"); // Par défaut on affiche la galerie
  });

  // Fermer la modale (croix)
  fermerModale.addEventListener("click", () => {
    modale.style.display = "none";
    formAjout.reset();
    resetPreview(); 
    clearFormErrors(); // Nettoie les erreurs de formulaire
  });

  // Fermer la modale en cliquant en dehors
  window.addEventListener("click", (e) => {
    if (e.target === modale) {
      modale.style.display = "none";
      formAjout.reset();
      resetPreview();
      clearFormErrors();
    }
  });

  // Passer à la vue "ajouter une photo"
  boutonAjoutPhoto.addEventListener("click", () => {
    const tokenCheck = localStorage.getItem("token");
    if (!tokenCheck) {
      afficherMessageUtilisateur("Vous devez être connecté pour ajouter une photo.", "error");
      return;
    }
    afficherVue("ajout");
    resetPreview(true); // Affiche l'icône d'image par défaut à l'ouverture de la vue ajout
  });

  // Gère le clic sur l'icône de retour, revient à la vue Galerie depuis la vue Ajout
  if (retourBtn) {
    retourBtn.addEventListener("click", () => {
      afficherVue("galerie");
    });
  }

  // Fonction qui change la vue en fonction de la page (galerie <-> ajout)
 function afficherVue(vue) {
  const retourBtn = document.getElementById("retour-galerie");
  const titres = document.querySelectorAll(".title-modale h3");

  if (vue === "galerie") {
    vueGalerie.classList.add("active");
    vueAjout.classList.remove("active");
    boutonAjoutPhoto.style.display = "inline-block";
    retourBtn.style.display = "none";
    titres[0].style.display = "block"; // Galerie photo
    titres[1].style.display = "none"; // Ajout photo
  } else {
    vueAjout.classList.add("active");
    vueGalerie.classList.remove("active");
    boutonAjoutPhoto.style.display = "none";
    retourBtn.style.display = "inline-block";
    titres[0].style.display = "none";
    titres[1].style.display = "block";
  }
}

 // Récupère les catégories via API pour le formulaire d'ajout
  async function chargerCategories() {
  try {
    const res = await fetch("http://localhost:5678/api/categories");
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    const categories = await res.json();

    // Vide d'abord le select
    selectCategorie.innerHTML = '<option value=""></option>';

    // Ajoute chaque catégorie comme option
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;
      selectCategorie.appendChild(option);
    });

  } catch (error) {
    console.error("Erreur chargement catégories :", error);
    selectCategorie.innerHTML = '<option value="">Erreur chargement</option>';
  }
}

  // Charge les médias et les insère dans la modale
  async function chargerGalerie() {
    try {
      const res = await fetch("http://localhost:5678/api/works");
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const travaux = await res.json();

      contenuGalerie.innerHTML = "";

      if (!travaux.length) {
        contenuGalerie.textContent = "Aucun média dans la galerie.";
        return;
      }

      travaux.forEach(work => {
        const figure = document.createElement("figure");
        figure.classList.add("image-container");
        figure.dataset.id = work.id;

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;
        img.style.height = "115px";
        img.style.objectFit = "cover";
        img.style.display = "block";
        img.style.margin = "3px";
        img.style.padding = "3px";
        img.style.gap = "30px";

        const caption = document.createElement("figcaption");
        figure.appendChild(img);
        figure.appendChild(caption);

        // Affiche l'icon de suppression si connecté
        const token = localStorage.getItem("token");
        if (token) {
          const deleteButton = document.createElement("button");
          deleteButton.classList.add("delete-icon");
          deleteButton.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
          deleteButton.addEventListener("click", async () => {
            const confirmed = confirm("Supprimer ce média ?");
            if (confirmed) {
              try {
                const res = await fetch(`http://localhost:5678/api/works/${work.id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                  await chargerGalerie(); // Recharge la galerie dans la modale
                  const figureDansGalerie = document.querySelector(`.gallery figure[data-id="${work.id}"]`);
                  if (figureDansGalerie) figureDansGalerie.remove(); // Supprime aussi de la galerie principale
                  afficherMessageUtilisateur("Média supprimé !");
                } else {
                  afficherMessageUtilisateur("Échec de la suppression.", "error");
                }
              } catch (error) {
                console.error("Erreur lors de la suppression :", error);
                afficherMessageUtilisateur("Erreur serveur.", "error");
              }
            }
          });
          figure.appendChild(deleteButton);
        }

        contenuGalerie.appendChild(figure);
      });
    } catch (error) {
      console.error("Erreur chargement galerie :", error);
      contenuGalerie.textContent = "Erreur chargement galerie.";
    }
  }

  // Supprime les messages d'erreurs du formulaire
  function clearFormErrors() {
    const errorElements = formAjout.querySelectorAll(".error-message");
    errorElements.forEach(el => el.textContent = "");
  }

  // Réinitialise l'image de prévisualisation
  function resetPreview(showDefault = false) {
    fileInput.value = ""; // Vide le champ fichier
    if (showDefault) {
      previewImg.src = "./assets/icons/icon-image.png"; // Image par défaut
      previewImg.style.display = "block";
      customBtn.style.display = "block";
    } else {
      previewImg.src = "";
      previewImg.style.display = "none";
      customBtn.style.display = "block";
    }
  }

  // Envoi du formulaire d'ajout de média
  formAjout.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors();

    const fichier = fileInput.files[0];
    const titre = document.getElementById("titre-media").value.trim();
    const categorie = selectCategorie.value;

    // Vérifications de base
    if (!fichier) return afficherMessageUtilisateur("Veuillez sélectionner un fichier image.", "error");
    if (!titre) return afficherMessageUtilisateur("Veuillez renseigner un titre.", "error");
    if (!categorie) return afficherMessageUtilisateur("Veuillez sélectionner une catégorie.", "error");
    if (fichier.size > 4 * 1024 * 1024) return afficherMessageUtilisateur("Le fichier ne doit pas dépasser 4 Mo.", "error");

    const formData = new FormData();
    formData.append("image", fichier);
    formData.append("title", titre);
    formData.append("category", categorie);

    try {
      const res = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        formAjout.reset();
        await chargerGalerie();
        afficherVue("galerie");
        ajouterMediaDansGaleriePrincipale(data); 
        afficherMessageUtilisateur("Média ajouté avec succès !");
        resetPreview(); // Nettoie l'image après envoi
      } else {
        const errorData = await res.json();
        afficherMessageUtilisateur(`Erreur : ${errorData.message || res.statusText}`, "error");
      }
    } catch (error) {
      console.error("Erreur ajout média :", error);
      afficherMessageUtilisateur("Erreur serveur lors de l'ajout.", "error");
    }
  });

  // Gère le bouton personnalisé pour choisir une image
  customBtn.addEventListener("click", () => {
    fileInput.click();
  });

  // Gère l'affichage de l'aperçu d'image une fois sélectionnée
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        afficherMessageUtilisateur("Le fichier dépasse 4 Mo.", "error");
        fileInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewImg.style.display = "block";
        customBtn.style.display = "none";
      };
      reader.readAsDataURL(file);
    } else {
      resetPreview(true); // Si aucun fichier sélectionné, remettre l’icône par défaut
    }
  });
}


// Gère la déconnexion utilisateur
function setupLogout() {
  const logoutLink = document.getElementById("logout-link");
  if (!logoutLink) return;

  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token"); // Supprime le token de connexion
    window.location.reload(); // Recharge la page
  });
}

// Gère la soumission du formulaire de connexion
function setupLoginForm() {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Vérifications basiques
    if (!email || !password) {
      const errorMsg = document.getElementById("error-message");
      if (errorMsg) errorMsg.textContent = "Veuillez remplir tous les champs.";
      return;
    }

    try {
      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Réponse login:", data);

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "index.html"; // redirection après login
      } else {
        const errorMsg = document.getElementById("error-message");
        if (errorMsg) errorMsg.textContent = data.message || "Identifiants incorrects.";
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
      const errorMsg = document.getElementById("error-message");
      if (errorMsg) errorMsg.textContent = "Erreur serveur.";
    }
  });
}

// Affiche dynamiquement les projets dans la galerie
function loadProjects(categoryId = null) {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  fetch("http://localhost:5678/api/works")
    .then((response) => {
      if (!response.ok) throw new Error(`Erreur ${response.status} lors du chargement des projets`);
      return response.json();
    })
    .then((works) => {
      gallery.innerHTML = ""; // Vide la galerie avant affichage

      const filteredWorks = categoryId
        ? works.filter((work) => work.categoryId === categoryId)
        : works;

      // Création dynamique des éléments <figure>
      filteredWorks.forEach((work) => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;


        const caption = document.createElement("figcaption");
        caption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(caption);
        gallery.appendChild(figure);
      });
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des projets :", error);
      const gallery = document.querySelector(".gallery");
      if (gallery) gallery.textContent = "Erreur lors du chargement des projets.";
    });
}

// Charge les filtres dynamiquement depuis l’API
function loadFilters() {
  const filterContainer = document.querySelector(".sous-projet");
  if (!filterContainer) return;

  fetch("http://localhost:5678/api/categories")
    .then((response) => {
      if (!response.ok) throw new Error(`Erreur ${response.status} lors du chargement des filtres`);
      return response.json();
    })
    .then((categories) => {
      filterContainer.innerHTML = ""; // Vide les anciens filtres

      // Création du bouton "Tous"
      const allButton = document.createElement("button");
      allButton.textContent = "Tous";
      allButton.classList.add("filter-button", "active");
      allButton.addEventListener("click", () => {
        setActiveFilter(allButton);
        loadProjects(); // Affiche tous les projets
      });
      filterContainer.appendChild(allButton);

      // Création d’un bouton par catégorie
      categories.forEach((category) => {
        const button = document.createElement("button");
        button.textContent = category.name;
        button.classList.add("filter-button");
        button.addEventListener("click", () => {
          setActiveFilter(button);
          loadProjects(category.id); // Affiche projets filtrés
        });
        filterContainer.appendChild(button);
      });
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des filtres :", error);
      filterContainer.textContent = "Erreur lors du chargement des filtres.";
    });
}

// Met à jour visuellement le filtre actif
function setActiveFilter(activeButton) {
  const buttons = document.querySelectorAll(".filter-button");
  buttons.forEach((btn) => btn.classList.remove("active"));
  activeButton.classList.add("active");
}

// Point d'entrée : initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  updateUI(token);
  setupLoginForm();
  setupLogout();
  setupModal();
  loadFilters();
  loadProjects();
  afficherBarreNoireSiConnecte();
});

// Affiche la barre noire "Mode édition" si l'utilisateur est connecté
function afficherBarreNoireSiConnecte() {
  const token = localStorage.getItem("token");
  const barre = document.getElementById("admin-bar");

  if (token && barre) {
    barre.style.display = "flex"; 
    document.body.classList.add("barre-active"); 
  }
}

