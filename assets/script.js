function commencer(){
  document.getElementById("menu").style.display = "none";
  document.getElementById("jeu").style.display = "block";
  //Création du tableau de constantes du niveaux qui contient toutes les informations du niveau
  var constantes;
  //Appel de la fonction qui va remplir le tableau de constantes
  getInfosNiveau();
  //Affichage de la consigne pour commencer à bouger le serpent
  document.getElementById("consigne").style.display = "block";
  //Efface le bouton Recommencer
  document.getElementById("btnRecommencer").style.display = "none";
}

window.addEventListener("load", function(){
  //Le bouton jouer du menu efface le menu et affiche le canvas de jeu
  var btnJouer = document.getElementById("btnJouer");
  btnJouer.addEventListener("click", commencer);
  //Le bouton recommencer s'affiche lorsque le joueur a perdu, il relance le niveau
  var btnRecommencer = document.getElementById("btnRecommencer");
  btnRecommencer.addEventListener("click",commencer);
  //Le bouton retour affiché dans le jeu
  var btnRetour = document.getElementById("btnRetour");
  btnRetour.addEventListener("click", function(){
    //Il stop le jeu
    clearInterval(idInt);
    //Puis efface le canvas et affiche le menu
    document.getElementById("jeu").style.display = "none";
    document.getElementById("menu").style.display = "block";
  });
});


function getInfosNiveau(){
  //On récupère le niveau sélectionné par le joueur
  var niveaux = document.getElementById("niveaux");
  var niveau = niveaux.options[niveaux.selectedIndex].value;
  //On va chercher le fichier json correspondant
  var url = "./assets/niveaux/" + niveau +".json";
  var req = new XMLHttpRequest();
  req.open("GET", url);
  req.onerror = function() {
      console.log("Échec de chargement "+url);
  };
  req.onload = function() {
      if (req.status === 200) {
        var data = JSON.parse(req.responseText);
        //Tableau contenant les éléments du serpent
        var serpent = [];
        //Le serpent mesure 3 cases au départ
        serpent[0] = [data.dimensions[0]/2+2, data.dimensions[1]/2];
        serpent[1] = [data.dimensions[0]/2+1, data.dimensions[1]/2];
        serpent[2] = [data.dimensions[0]/2, data.dimensions[1]/2];
        constantes = {
          "dimensions" : data.dimensions,
          "delai" : data.delay,
          "murs" : data.walls,
          "fruits" : data.fruit,
          "score" : 0,
          "taillePixel" : 10,
          "niveau" : niveau.toUpperCase(),
          "serpent" : serpent,
          "direction" : "na"
        };
        //Enclenche l'interval qui actualisera le canvas toutes les "delai"+ms. Le délai dépend du niveau
        idInt = window.setInterval(miseAJourMonde, constantes.delai);
        //On affiche les informations du niveau : sa difficulté et le score
        document.getElementById("titreNiveau").textContent = constantes.niveau;
        document.getElementById("score").textContent = constantes.score;
        document.getElementById("score").style.color = "green";
      } else {
        console.log("Erreur " + req.status);
      }
  };
  req.send();
}

function miseAJourMonde(){
  var canvas = document.getElementById('mainCanvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
  }

  //On récupère le tableau représentant le monde qui vient d'être actualisé
  var monde = chargerMonde(constantes);

  //Nombre de lignes du canvas
  var lignes = constantes.dimensions[0];
  //Nombre de colonnes du canvas
  var colonnes = constantes.dimensions[1];

  //Pour chaque case du monde
  for(i=0; i<lignes; i++){
    for(j=0; j<colonnes; j++){
      //On regarde ce que représente la case
      switch(monde[i][j]){
        //Le corps du serpent est gris, sa tête est blanche (entre dans le default)
        case "serpent":
          ctx.fillStyle = "grey";
          ctx.fillRect(j*constantes.taillePixel,i*constantes.taillePixel, constantes.taillePixel, constantes.taillePixel);
          break;
        //Le fond est vert
        case "vide" :
          ctx.fillStyle = "green";
          ctx.fillRect(j*constantes.taillePixel,i*constantes.taillePixel, constantes.taillePixel, constantes.taillePixel);
          break;
        //Le fruit est l'image d'une pomme
        case "fruit" :
          ctx.fillStyle = "green";
          ctx.fillRect(j*constantes.taillePixel,i*constantes.taillePixel, constantes.taillePixel, constantes.taillePixel);
          var pomme = document.getElementById("pomme");
          ctx.drawImage(pomme, j*constantes.taillePixel,i*constantes.taillePixel, constantes.taillePixel, constantes.taillePixel);
          break;
        //Les murs sont noirs
        case "mur" :
          ctx.fillStyle = "black";
          ctx.fillRect(j*constantes.taillePixel,i*constantes.taillePixel, constantes.taillePixel, constantes.taillePixel);
          break;
        default:
          ctx.fillStyle = "white";
          ctx.fillRect(j*constantes.taillePixel,i*constantes.taillePixel, constantes.taillePixel, constantes.taillePixel);
          break;
      }
    }
  }
}

//Cette fonction réattribue à chaque case du tableau, ce qu'elle doit représenter, elle est appelé toutes les 100ms lorsque la fonction de miseà jour en a besoin
function chargerMonde(constantes){
  var lignes = constantes.dimensions[0];
  var colonnes = constantes.dimensions[1];
  //Tableau des coordonnées du serpent
  var s = constantes.serpent;
  //Tableau des coordonnées des fruits
  var f = constantes.fruits;
  //Tableau des coordonnées des murs
  var m = constantes.murs;

  //Chaque ligne est initialisée à vide
  var monde = [];
  for (var  i = 0; i<lignes ; i++){
    monde[i] = [];
    for(var j=0; j<colonnes; j++){
      monde[i][j] = "vide";
    }
  }

  //Pour chaque coordonnées du serpent
  for(i=0 ; i<s.length; i++){
    var ligne = s[i][0];
    var colonne = s[i][1];
    monde[ligne][colonne] = "serpent";
    if(ligne == s[s.length-1][0] && colonne == s[s.length-1][1]){
      monde[ligne][colonne] = "tete";
    }
  }

  //Pour chaque coordonnées des fruits
  for (i=0; i<f.length; i++){
    var ligne = f[i][0];
    var colonne = f[i][1];
    monde[ligne][colonne] = "fruit";
  }

  //Pour chaque coordonnées des murs
  for(i=0 ; i<m.length; i++){
    var ligne = m[i][0];
    var colonne = m[i][1];
    monde[ligne][colonne] = "mur";
  }

  //Après l'actualisation, le serpent peut à nouveau bouger
  mouvementSerpent();

  //Retourne le nouveau monde
  return monde;

}

//Lorsque l'utilisateur appuie sur une touche
document.addEventListener("keydown", function(event){
  //Si le jeu n'a pas encore commencé, on indique la consigne à l'utilisateur
  if(document.getElementById("consigne").style.display != "none"){
    document.getElementById("consigne").style.display = "none";
  }
  var touche = event.key;
  var direction;
  //Affectation de la nouvelle direction du serpent à la constante en fonction de la flèche pressée
  switch(touche){
    case "ArrowUp":
      direction = "haut";
      break;
    case "ArrowRight":
      direction = "droite";
      break;
    case "ArrowDown":
      direction = "bas";
      break;
    case "ArrowLeft":
      direction = "gauche";
      break;
    //Si la touche pressée n'est pas une flèche, le serpent ne change pas de direction
    default:
      direction = constantes.direction;
      break;
    }
    constantes.direction = direction;

});

//Cette fonction est appellée toutes les 100ms par la fonction de mise à jour du monde
function mouvementSerpent(){
  var d = constantes.direction;
  var s = constantes.serpent;
  var tete = s.length-1;
  //Selon la direction
  switch(d){
    //Si le serpent se dirige vers le haut, sa tête est une nouvelle case avec la même ordonnée mais abcisse -1 et on lui coupe la queue
    case "haut":
      s.push([s[tete][0]-1, s[tete][1]])
      s.splice(0,1);
      break;
    //Si le serpent se dirige vers la droite, sa tête est une nouvelle case avec la même abcisse mais ordonnée +1 et on lui coupe la queue
    case "droite":
      s.push([s[tete][0], s[tete][1]+1])
      s.splice(0,1);
      break;
    //L'inverse pour les autres sens
    case "bas":
      s.push([s[tete][0]+1, s[tete][1]])
      s.splice(0,1);
      break;
    case "gauche":
      s.push([s[tete][0], s[tete][1]-1])
      s.splice(0,1);
      break;
  }
  //Après chaque mouvement du serpent, on vérifie s'il entre en contact avec un objet (lui-même, un mur ou un fruit)
  verifCollision();
}

function verifCollision(){
  var s = constantes.serpent;
  var tete = s.length-1
  //Si le serpent se mord
  for(j=0 ; j<s.length-1 ; j++){
    var ligne = s[j][0];
    var colonne = s[j][1];
    if(s[tete][0] == ligne && s[tete][1] == colonne){
      perdu("morsure");
    }
  }

  //Si la tête atteint les limites du canvas du canvas
  if((s[tete][0] < 0 || s[tete][0] > constantes.dimensions[0]-1) || (s[tete][1] < 0 || s[tete][1] > constantes.dimensions[1]-1)){
    perdu("mur");
  }

  //Si la tête rencontre un mur
  for(j=0 ; j<constantes.murs.length; j++){
    var ligne = constantes.murs[j][0];
    var colonne = constantes.murs[j][1];
    if(ligne === s[tete][0] && colonne === s[tete][1]){
      perdu("mur");
    }
  }

  //Si la tête rencontre un fruit
  for (j=0; j<constantes.fruits.length; j++){
    var ligne = constantes.fruits[j][0];
    var colonne = constantes.fruits[j][1];
    if(ligne === s[tete][0] && colonne === s[tete][1]){
      //Score incrémenté de 1
      constantes.score++;
      //Mise à jour de l'affichage du score
      document.getElementById("score").textContent = constantes.score;
      //Coordonnées du nouveau fruit aléatoires
      var x = Math.floor(Math.random()*Math.floor(constantes.dimensions[0]));
      var y = Math.floor(Math.random()*Math.floor(constantes.dimensions[1]));
      //On supprime le fruit mangé
      constantes.fruits.splice(j, 1);
      //On ajoute le nouveau
      constantes.fruits.push([x,y]);

      var queue = s[0];
      //Selon la direction, on ajoute une case au corps du serpent qui allonge sa queue
      switch(constantes.direction){
        case "haut":
          s.unshift([queue[0]+1, queue[1]]);
          break;
        case "droite":
          s.unshift([queue[0], queue[1]-1]);
          break;
        case "bas":
          s.unshift([queue[0]-1, queue[1]]);
          break;
        case "gauche":
          s.unshift([queue[0], queue[1]+1]);
          break;
      }

    }
  }
}

function perdu(raison){
  clearInterval(idInt);
  var score = document.getElementById("score");
  switch(raison){
    case "morsure" :
      score.textContent = "Aïe tu t'es mordu ! Score : " +  + constantes.score;
      score.style.color = "red";
      break;
    case "mur" :
      score.textContent = "Aïe tu t'es pris un mur ! Score : " +  + constantes.score;
      score.style.color = "red";
  }
  var btnRecommencer = document.getElementById("btnRecommencer");
  btnRecommencer.style.display = "inline-block";
}
