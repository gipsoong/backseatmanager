/**
 * 2025/26 (session 37): the leading club-seasons of the five leagues, as they stood after the summer
 * window. Added after every other pool, as saves refer to pools by index (`p<pool>-<i>` ids). Same
 * line format and standard as squads.ts: overalls are our estimate of the rating that season, judged
 * against peers in the database. A man in several files is spelt the same in all of them.
 */
import type { Archetype } from '../engine/index.ts'
import { kit, pool, type League, type Pool } from './squads.ts'

const RED = kit('#c8202f', '#ffffff', 'red')
const SKY = kit('#6cabdd', '#1c2c5b', 'blue')
const ROYAL = kit('#034694', '#ffffff', 'blue')
const WHITE = kit('#f4f4f0', '#1b2a4a', 'white')
const BARCA = kit('#a50044', '#f0c330', 'red')
const ATLETI = kit('#cb3524', '#ffffff', 'red')
const BAYERN = kit('#dc052d', '#ffffff', 'red')
const BVB = kit('#fde100', '#111111', 'yellow')
const INTER = kit('#0a4595', '#111111', 'blue')
const MILAN = kit('#c8102e', '#111111', 'red')
const NAPOLI = kit('#12a0d7', '#ffffff', 'blue')
const NAVY = kit('#1b2a4a', '#da291c', 'blue')

const of = (league: League, pools: Pool[]): Pool[] => pools.map((p) => ({ ...p, league }))

const PREMIER_LEAGUE: Pool[] = [
  pool('Arsenal', 'ARS', '2025/26', RED, '4-3-3', `
    David Raya, GK, 87
    Kepa Arrizabalaga, GK, 79, Kepa
    William Saliba, CB, 88
    Gabriel Magalhães, CB, 88, Gabriel
    Cristhian Mosquera, CB, 77
    Piero Hincapié, CB/FB, 81
    Jurriën Timber, FB/CB, 84
    Ben White, FB/CB, 81
    Riccardo Calafiori, FB/CB, 81
    Myles Lewis-Skelly, FB/DM, 76
    Declan Rice, DM/CM, 88
    Martín Zubimendi, DM, 86
    Christian Nørgaard, DM, 77
    Martin Ødegaard, CM/W, 86
    Mikel Merino, CM/DM/ST, 83
    Eberechi Eze, CM/W, 85
    Ethan Nwaneri, W/CM, 76
    Bukayo Saka, W/WM, 88
    Noni Madueke, W, 80
    Gabriel Martinelli, W/ST, 81
    Leandro Trossard, W/ST/CM, 82
    Viktor Gyökeres, ST, 85
    Kai Havertz, ST/CM, 82
    Gabriel Jesus, ST/W, 78
  `),
  pool('Liverpool', 'LIV', '2025/26', RED, '4-2-3-1', `
    Alisson Becker, GK, 88, Alisson
    Giorgi Mamardashvili, GK, 81
    Virgil van Dijk, CB, 88
    Ibrahima Konaté, CB, 83
    Joe Gomez, CB/FB, 78
    Giovanni Leoni, CB, 72
    Jeremie Frimpong, FB/WM, 82
    Milos Kerkez, FB, 80
    Andrew Robertson, FB, 81
    Conor Bradley, FB, 77
    Ryan Gravenberch, DM/CM, 86
    Alexis Mac Allister, CM/DM, 85
    Wataru Endō, DM, 75
    Dominik Szoboszlai, CM/W/FB, 85
    Curtis Jones, CM, 79
    Florian Wirtz, CM/W, 87
    Mohamed Salah, W/ST, 88
    Cody Gakpo, W/ST, 83
    Federico Chiesa, W, 77
    Rio Ngumoha, W, 68
    Hugo Ekitiké, ST/W, 84
    Alexander Isak, ST, 87
  `),
  pool('Manchester City', 'MCI', '2025/26', SKY, '4-2-3-1', `
    Gianluigi Donnarumma, GK, 89
    James Trafford, GK, 77
    Stefan Ortega, GK, 77
    Rúben Dias, CB, 86
    Joško Gvardiol, CB/FB, 85
    John Stones, CB/DM, 81
    Nathan Aké, CB/FB, 79
    Abdukodir Khusanov, CB, 77
    Rayan Aït-Nouri, FB, 81
    Matheus Nunes, FB/CM, 79
    Rico Lewis, FB/CM, 78
    Nico O'Reilly, FB/CM, 76
    Rodri, DM, 88
    Nico González Iglesias, DM, 80, Nico González
    Mateo Kovačić, CM/DM, 81
    Tijjani Reijnders, CM, 85
    Bernardo Silva, CM/W, 84, Bernardo
    Phil Foden, CM/W, 86
    Rayan Cherki, CM/W, 83
    Jérémy Doku, W, 83
    Savinho, W, 80
    Oscar Bobb, W, 74
    Omar Marmoush, ST/W, 83
    Erling Haaland, ST, 91
  `),
  pool('Chelsea', 'CHE', '2025/26', ROYAL, '4-2-3-1', `
    Robert Sánchez, GK, 80
    Filip Jörgensen, GK, 75
    Wesley Fofana, CB, 78
    Trevoh Chalobah, CB, 80
    Tosin Adarabioyo, CB, 77
    Benoît Badiashile, CB, 77
    Jorrel Hato, CB/FB, 77
    Josh Acheampong, CB/FB, 72
    Reece James, FB/CM, 84
    Malo Gusto, FB, 80
    Marc Cucurella, FB, 83
    Moisés Caicedo, DM/CM, 87
    Enzo Fernández, CM/DM, 85
    Roméo Lavia, DM, 78
    Andrey Santos, CM/DM, 78
    Cole Palmer, W/CM, 87
    Pedro Neto, W, 82
    Estêvão, W, 80
    Alejandro Garnacho, W, 80
    Jamie Gittens, W, 77
    João Pedro Galvão, ST/CM, 83, João Pedro
    Liam Delap, ST, 77
  `),
]

const LA_LIGA: Pool[] = [
  pool('Real Madrid', 'RMA', '2025/26', WHITE, '4-3-3', `
    Thibaut Courtois, GK, 90
    Andriy Lunin, GK, 79
    Antonio Rüdiger, CB, 84
    Éder Militão, CB, 84
    Dean Huijsen, CB, 83
    David Alaba, CB, 80
    Raúl Asencio, CB, 77
    Trent Alexander-Arnold, FB/CM, 85
    Dani Carvajal, FB, 82
    Álvaro Carreras, FB, 81
    Ferland Mendy, FB, 79
    Fran García, FB, 77
    Aurélien Tchouaméni, DM/CB, 85
    Federico Valverde, CM/WM/FB, 88
    Jude Bellingham, CM, 88
    Eduardo Camavinga, CM/DM/FB, 82
    Arda Güler, CM/W, 84
    Dani Ceballos, CM, 77
    Franco Mastantuono, W/CM, 76
    Brahim Díaz, CM/W, 79, Brahim
    Vinícius Júnior, W/ST, 89, Vinícius
    Rodrygo, W/ST, 83
    Kylian Mbappé, ST/W, 91
    Gonzalo García, ST, 74
    Endrick, ST, 75
  `),
  pool('Barcelona', 'BAR', '2025/26', BARCA, '4-2-3-1', `
    Joan García, GK, 85
    Wojciech Szczęsny, GK, 81
    Marc-André ter Stegen, GK, 86
    Pau Cubarsí, CB, 84
    Ronald Araújo, CB, 82
    Andreas Christensen, CB/DM, 80
    Eric García, CB/FB/DM, 80
    Gerard Martín, FB/CB, 77
    Jules Koundé, FB/CB, 86
    Alejandro Balde, FB, 82
    Frenkie de Jong, CM/DM, 86
    Marc Casadó, DM, 78
    Marc Bernal, DM, 74
    Pedri, CM, 89
    Gavi, CM, 80
    Dani Olmo, CM/W, 83
    Fermín López, CM/W, 82
    Lamine Yamal, W, 89
    Raphinha, W, 87
    Marcus Rashford, W/ST, 82
    Roony Bardghji, W, 73
    Ferran Torres, ST/W, 81
    Robert Lewandowski, ST, 85
  `),
  pool('Atlético Madrid', 'ATM', '2025/26', ATLETI, '4-4-2', `
    Jan Oblak, GK, 87
    Juan Musso, GK, 78
    José María Giménez, CB, 80
    Robin Le Normand, CB, 80
    David Hancko, CB/FB, 81
    Clément Lenglet, CB, 77
    Marc Pubill, CB/FB, 75
    Nahuel Molina, FB, 79
    Matteo Ruggeri, FB, 77
    Marcos Llorente, FB/CM/WM, 82
    Koke, CM/DM, 80
    Pablo Barrios, CM, 81
    Johnny Cardoso, DM, 79
    Conor Gallagher, CM/DM, 80
    Álex Baena, CM/WM, 83
    Thiago Almada, CM/W, 80
    Giuliano Simeone, WM/W, 80
    Nicolás González, WM/W, 79
    Antoine Griezmann, ST/CM, 84
    Julián Álvarez, ST/W, 87
    Alexander Sørloth, ST, 81
    Giacomo Raspadori, ST/CM, 79
  `),
]

const BUNDESLIGA: Pool[] = [
  pool('Bayern Munich', 'FCB', '2025/26', BAYERN, '4-2-3-1', `
    Manuel Neuer, GK, 86
    Jonas Urbig, GK, 74
    Sven Ulreich, GK, 70
    Dayot Upamecano, CB, 85
    Jonathan Tah, CB, 85
    Kim Min-jae, CB, 82, Kim
    Hiroki Ito, CB/FB, 79
    Josip Stanišić, FB/CB, 80
    Konrad Laimer, FB/DM/CM, 82
    Alphonso Davies, FB, 82
    Sacha Boey, FB, 75
    Joshua Kimmich, DM/FB, 88
    Aleksandar Pavlović, DM, 83
    Leon Goretzka, CM/DM, 82
    Tom Bischof, CM, 77
    Jamal Musiala, CM/W, 87
    Michael Olise, W, 89
    Luis Díaz, W/ST, 86
    Serge Gnabry, W/CM, 82
    Lennart Karl, W/CM, 72
    Nicolas Jackson, ST, 79
    Harry Kane, ST, 91
  `),
  pool('Borussia Dortmund', 'BVB', '2025/26', BVB, '3-4-3', `
    Gregor Kobel, GK, 86
    Alexander Meyer, GK, 72
    Nico Schlotterbeck, CB, 84
    Niklas Süle, CB, 79
    Waldemar Anton, CB, 80
    Ramy Bensebaini, CB/FB, 77
    Emre Can, DM/CB, 77
    Julian Ryerson, FB/WM, 79
    Daniel Svensson, FB/WM, 77
    Yan Couto, FB/WM, 77
    Felix Nmecha, CM/DM, 81
    Marcel Sabitzer, CM, 79
    Pascal Groß, CM/DM, 79
    Jobe Bellingham, CM, 77
    Salih Özcan, DM, 73
    Julian Brandt, CM/W, 81
    Karim Adeyemi, W/ST, 81
    Maximilian Beier, W/ST, 79
    Carney Chukwuemeka, CM/W, 75
    Serhou Guirassy, ST, 85
    Fábio Silva, ST, 74
  `),
]

const SERIE_A: Pool[] = [
  pool('Inter', 'INT', '2025/26', INTER, '3-5-2', `
    Yann Sommer, GK, 83
    Josep Martínez, GK, 77
    Alessandro Bastoni, CB, 86
    Manuel Akanji, CB, 83
    Francesco Acerbi, CB, 79
    Stefan de Vrij, CB, 80
    Yann Bisseck, CB, 79
    Denzel Dumfries, FB/WM, 83
    Federico Dimarco, FB/WM, 85
    Carlos Augusto, FB, 77, Carlos Augusto
    Luis Henrique, WM/FB, 77
    Matteo Darmian, FB/CB, 74
    Hakan Çalhanoğlu, DM, 85
    Nicolò Barella, CM, 86
    Henrikh Mkhitaryan, CM, 80
    Petar Sučić, CM, 77
    Piotr Zieliński, CM, 80
    Davide Frattesi, CM, 79
    Andy Diouf, CM, 75
    Lautaro Martínez, ST, 88
    Marcus Thuram, ST, 84
    Ange-Yoan Bonny, ST, 77
    Francesco Pio Esposito, ST, 74
  `),
  pool('Napoli', 'NAP', '2025/26', NAPOLI, '4-1-4-1', `
    Alex Meret, GK, 81
    Vanja Milinković-Savić, GK, 80
    Amir Rrahmani, CB, 81
    Alessandro Buongiorno, CB, 81
    Sam Beukema, CB, 79
    Juan Jesus, CB, 72, Juan Jesus
    Giovanni Di Lorenzo, FB/CB, 83
    Mathías Olivera, FB, 79
    Miguel Gutiérrez, FB, 79
    Leonardo Spinazzola, FB/WM, 75
    Stanislav Lobotka, DM, 84
    André-Frank Zambo Anguissa, CM, 82, Anguissa
    Scott McTominay, CM, 87
    Kevin De Bruyne, CM, 86
    Billy Gilmour, CM/DM, 78
    Eljif Elmas, CM/W, 76
    Matteo Politano, W/WM, 80
    David Neres, W, 80
    Noa Lang, W, 79
    Rasmus Højlund, ST, 80
    Romelu Lukaku, ST, 81
    Lorenzo Lucca, ST, 75
  `),
  pool('AC Milan', 'MIL', '2025/26', MILAN, '3-5-2', `
    Mike Maignan, GK, 86
    Pietro Terracciano, GK, 74
    Fikayo Tomori, CB, 80
    Matteo Gabbia, CB, 79
    Strahinja Pavlović, CB, 79
    Koni De Winter, CB, 76
    Pervis Estupiñán, FB/WM, 78
    Davide Bartesaghi, FB/WM, 74
    Alexis Saelemaekers, WM/W, 79
    Zachary Athekame, FB/WM, 72
    Luka Modrić, CM, 85
    Youssouf Fofana, CM/DM, 81
    Samuele Ricci, DM, 79
    Ardon Jashari, DM, 77
    Adrien Rabiot, CM/DM, 83
    Ruben Loftus-Cheek, CM, 78
    Christian Pulisic, W/ST, 84
    Rafael Leão, W/ST, 85
    Christopher Nkunku, ST/CM, 80
    Santiago Giménez, ST, 79
  `),
]

const LIGUE_1: Pool[] = [
  pool('Paris Saint-Germain', 'PSG', '2025/26', NAVY, '4-3-3', `
    Lucas Chevalier, GK, 83
    Matvey Safonov, GK, 78
    Marquinhos, CB, 85
    Willian Pacho, CB, 85
    Illia Zabarnyi, CB, 81
    Lucas Beraldo, CB/FB, 78
    Lucas Hernández, CB/FB, 81
    Achraf Hakimi, FB, 88
    Nuno Mendes, FB, 87
    Vitinha, CM/DM, 89
    João Neves, CM/DM, 87
    Fabián Ruiz, CM, 84
    Warren Zaïre-Emery, CM/FB, 81
    Lee Kang-in, CM/W, 79, Lee
    Senny Mayulu, CM, 72
    Ousmane Dembélé, W/ST, 90
    Khvicha Kvaratskhelia, W, 88
    Désiré Doué, W/CM, 86
    Bradley Barcola, W, 83
    Ibrahim Mbaye, W, 70
    Gonçalo Ramos, ST, 80
  `),
]

export const POOLS: Pool[] = [
  ...of('Premier League', PREMIER_LEAGUE),
  ...of('La Liga', LA_LIGA),
  ...of('Bundesliga', BUNDESLIGA),
  ...of('Serie A', SERIE_A),
  ...of('Ligue 1', LIGUE_1),
]

/** Left-footed players here (a name already in another file's list needs no second entry). */
export const LEFT_FOOTED: string[] = [
  'Piero Hincapié', 'Riccardo Calafiori', 'Myles Lewis-Skelly', 'Martin Ødegaard',
  'Gabriel Magalhães', 'Milos Kerkez', 'Andrew Robertson', 'Mohamed Salah', 'Rayan Aït-Nouri', 'Joško Gvardiol',
  'Nathan Aké', "Nico O'Reilly", 'Phil Foden', 'Bernardo Silva', 'Marc Cucurella', 'Jorrel Hato', 'Cole Palmer',
  'Estêvão', 'Álvaro Carreras', 'Ferland Mendy', 'Fran García', 'Arda Güler', 'Franco Mastantuono',
  'Lamine Yamal', 'Raphinha', 'Alejandro Balde', 'Gerard Martín', 'Matteo Ruggeri', 'David Hancko',
  'Álex Baena', 'Nicolás González', 'Antoine Griezmann', 'Alphonso Davies', 'Michael Olise',
  'Ramy Bensebaini', 'Daniel Svensson', 'Nico Schlotterbeck', 'Alessandro Bastoni', 'Federico Dimarco',
  'Carlos Augusto', 'Mathías Olivera', 'Miguel Gutiérrez', 'Matteo Politano',
  'Romelu Lukaku', 'Pervis Estupiñán', 'Davide Bartesaghi', 'Strahinja Pavlović', 'Adrien Rabiot',
  'Nuno Mendes', 'Lucas Hernández', 'Lucas Beraldo', 'Fabián Ruiz', 'Lee Kang-in',
  'Alessandro Buongiorno',
]

/** Weak feet worth noting (3 otherwise). */
export const WEAK_FOOT: Record<string, number> = {
  'Florian Wirtz': 4, 'Eberechi Eze': 4, 'Rayan Cherki': 5, 'Jérémy Doku': 4, 'Ousmane Dembélé': 5,
  'Lamine Yamal': 4, 'Michael Olise': 3, 'Vitinha': 4, 'Kylian Mbappé': 4, 'Harry Kane': 5,
}

/** Archetypes of the best-known players here (not already in the other files). */
export const ARCHETYPE: Record<string, Archetype> = {
  'Giorgi Mamardashvili': 'shotStopper', 'Joan García': 'shotStopper', 'Lucas Chevalier': 'sweeperKeeper',
  'Gregor Kobel': 'sweeperKeeper', 'James Trafford': 'sweeperKeeper',
  'Cristhian Mosquera': 'ballPlayer', 'Dean Huijsen': 'ballPlayer', 'Jonathan Tah': 'stopper', 'David Hancko': 'ballPlayer',
  'Illia Zabarnyi': 'stopper', 'Sam Beukema': 'ballPlayer', 'Strahinja Pavlović': 'stopper', 'Abdukodir Khusanov': 'stopper',
  'Milos Kerkez': 'overlapping', 'Rayan Aït-Nouri': 'overlapping', 'Álvaro Carreras': 'overlapping', 'Jorrel Hato': 'ballPlayer',
  'Luis Henrique': 'winger', 'Pervis Estupiñán': 'overlapping', 'Davide Bartesaghi': 'overlapping',
  'Martín Zubimendi': 'deepPlaymaker', 'Christian Nørgaard': 'anchor', 'Johnny Cardoso': 'anchor', 'Samuele Ricci': 'deepPlaymaker',
  'Ardon Jashari': 'deepPlaymaker', 'Tijjani Reijnders': 'boxToBox', 'Florian Wirtz': 'playmaker', 'Eberechi Eze': 'playmaker',
  'Rayan Cherki': 'playmaker', 'Pablo Barrios': 'boxToBox', 'Thiago Almada': 'playmaker', 'Tom Bischof': 'playmaker',
  'Felix Nmecha': 'boxToBox', 'Jobe Bellingham': 'boxToBox', 'Petar Sučić': 'playmaker', 'Álex Baena': 'playmaker',
  'Michael Olise': 'insideForward', 'Jérémy Doku': 'winger', 'Estêvão': 'insideForward', 'Franco Mastantuono': 'insideForward',
  'Jamie Gittens': 'winger', 'Noa Lang': 'insideForward', 'Giuliano Simeone': 'winger', 'Karim Adeyemi': 'winger',
  'Viktor Gyökeres': 'poacher', 'Hugo Ekitiké': 'falseNine', 'Omar Marmoush': 'poacher', 'Liam Delap': 'targetMan',
  'Ange-Yoan Bonny': 'poacher', 'Francesco Pio Esposito': 'targetMan', 'Lorenzo Lucca': 'targetMan', 'Santiago Giménez': 'poacher',
}
