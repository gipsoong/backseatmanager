/**
 * Draft mode's player data: the clubs and their squads (squads.ts), and what we know about
 * players by name: preferred foot, weak foot and archetype.
 */
import type { Archetype } from '../engine/index.ts'

import { POOLS as PREMIER_LEAGUE, type Pool } from './squads.ts'
import * as laLiga from './squads-laliga.ts'
import * as bundesliga from './squads-bundesliga.ts'
import * as serieA from './squads-seriea.ts'
import * as ligue1 from './squads-ligue1.ts'

export type { League, Pool } from './squads.ts'

const LEAGUES = [laLiga, bundesliga, serieA, ligue1]

/** Every club-season: the Premier League first (saves refer to pools by index), then the rest. */
export const POOLS: Pool[] = [...PREMIER_LEAGUE, ...LEAGUES.flatMap((l) => l.POOLS)]

/** Left-footed players (everyone else in the pools is right-footed). */
const PL_LEFT_FOOTED = [
  'Mesut Özil', 'Kieran Gibbs', 'Nacho Monreal', 'Olivier Giroud', 'Robin van Persie',
  'Bukayo Saka', 'Martin Ødegaard', 'Oleksandr Zinchenko', 'Gabriel Magalhães',
  'Kai Havertz', 'Ashley Cole', 'Marcos Alonso', 'Juan Mata', 'Marc Cucurella',
  'Ben Chilwell', 'Cole Palmer', 'Levi Colwill', 'Noni Madueke', 'Daniel Sturridge',
  'Alberto Moreno', 'Daniel Agger', 'José Enrique', 'Mohamed Salah', 'Andrew Robertson',
  'David Silva', 'Aleksandar Kolarov', 'Gaël Clichy', 'Aymeric Laporte', 'Leroy Sané',
  'Phil Foden', 'Joško Gvardiol', 'Nathan Aké', 'Bernardo Silva', 'Erling Haaland',
  'Ederson', 'Patrice Evra', 'Ryan Giggs', 'Luke Shaw', 'Lisandro Martínez', 'Amad Diallo',
  'Rasmus Højlund', 'Gareth Bale', 'Danny Rose', 'Ben Davies', 'Benoît Assou-Ekotto',
  'Jan Vertonghen', 'Rafael van der Vaart', 'Destiny Udogie', 'Sergio Reguilón',
  'Micky van de Ven', 'Dejan Kulusevski', 'Leighton Baines', 'Sylvain Distin',
  'Romelu Lukaku', 'Gareth Barry', 'Riyad Mahrez', 'Christian Fuchs', 'Dušan Tadić',
  'Ryan Bertrand', 'Sven Botman', 'Dan Burn', 'Lewis Hall', 'Miguel Almirón', 'Lucas Digne',
  'Pau Torres', 'Tyrone Mings', 'Leon Bailey', 'Moussa Diaby', 'John McGinn',
  'Aaron Cresswell', 'Emerson Palmieri', 'Angelo Ogbonna', 'Nayef Aguerd', 'Jarrod Bowen',
  'Mohammed Kudus', 'Lucas Paquetá', 'Pervis Estupiñán', 'Solly March', 'Tyrick Mitchell',
  'Michael Olise', 'Odsonne Édouard', 'Adam Wharton',
  'Lukas Podolski', 'Kieran Tierney', 'Filipe Luís', 'Erik Lamela', 'Hakim Ziyech', 'Raphinha',
  'Jeffrey Schlupp', 'Aly Cissokho', 'Bryan Oviedo', 'Rúben Vinagre', 'Benjamin Mendy',
  'Alex Telles', 'Neil Taylor', 'Stephen Ward', 'Charlie Taylor', 'Enda Stevens',
  'Ezgjan Alioski', 'Kostas Tsimikas', 'Riccardo Calafiori', 'Myles Lewis-Skelly',
  'Jakub Kiwior', 'Mamadou Sakho', 'Matija Nastasić', 'Joleon Lescott', 'Ben Mee',
  'Jack Robinson', 'Robbie Brady', 'James Rodríguez', 'Giovani Lo Celso', 'Antony',
]
export const LEFT_FOOTED = new Set([...PL_LEFT_FOOTED, ...LEAGUES.flatMap((l) => l.LEFT_FOOTED)])

/**
 * Weak foot, in the familiar 1-5 stars, where it isn't the usual 3: the two-footed (5) and nearly
 * so (4), and the famously one-footed (2).
 */
const PL_WEAK_FOOT: Record<string, number> = {
  'Santi Cazorla': 5, 'Son Heung-min': 5, 'Nani': 5, 'Kevin De Bruyne': 5, 'Ashley Young': 5,
  'Leandro Trossard': 5, 'Mousa Dembélé': 5, 'Harry Kane': 5, 'Sadio Mané': 4,
  'Eden Hazard': 4, 'Luka Modrić': 4, 'Diogo Jota': 4, 'Paul Pogba': 4,
  'Cristiano Ronaldo': 4, 'Zlatan Ibrahimović': 4, 'Sergio Agüero': 4, 'Wayne Rooney': 4,
  'Christian Eriksen': 4, 'Julián Álvarez': 4, 'Kaoru Mitoma': 4, 'Eberechi Eze': 4,
  'João Cancelo': 4, 'Marcus Rashford': 4, 'Steven Gerrard': 4, 'Frank Lampard': 4,
  'Edinson Cavani': 4, 'Bruno Fernandes': 4, 'Dele Alli': 4, 'Martin Ødegaard': 4,
  'Rodri': 4, 'Thiago Alcântara': 4, 'Mesut Özil': 2, 'Riyad Mahrez': 2, 'Leroy Sané': 2,
  'Gareth Bale': 2, 'Andrew Robertson': 2,
}
export const WEAK_FOOT: Record<string, number> = Object.assign({}, ...LEAGUES.map((l) => l.WEAK_FOOT), PL_WEAK_FOOT)

/**
 * How the best-known players play their position (see engine/archetypes.ts). Anyone not listed
 * gets one read off his attributes.
 */
const PL_ARCHETYPE: Record<string, Archetype> = {
  'Erling Haaland': 'poacher', 'Sergio Agüero': 'poacher', 'Robin van Persie': 'poacher',
  'Jamie Vardy': 'poacher', 'Fernando Torres': 'poacher', 'Daniel Sturridge': 'poacher',
  'Alexander Isak': 'poacher', 'Ollie Watkins': 'poacher', 'Edinson Cavani': 'poacher',
  'Cristiano Ronaldo': 'poacher', 'Rasmus Højlund': 'poacher', 'Darwin Núñez': 'poacher',
  'Diogo Jota': 'poacher', 'Nicolas Jackson': 'poacher', 'Timo Werner': 'poacher',
  'Richarlison': 'poacher', 'Callum Wilson': 'poacher', 'Danny Ings': 'poacher',
  'Shane Long': 'poacher', 'Javier Hernández': 'poacher', 'Nikica Jelavić': 'poacher',
  'Kelechi Iheanacho': 'poacher', 'Julián Álvarez': 'poacher', 'Jhon Durán': 'poacher',
  'Odsonne Édouard': 'poacher', 'Jay Rodriguez': 'poacher',
  'Pierre-Emerick Aubameyang': 'poacher', 'Luis Suárez': 'poacher', 'Gabriel Jesus': 'poacher',
  'Jean-Philippe Mateta': 'poacher', 'Olivier Giroud': 'targetMan', 'Didier Drogba': 'targetMan',
  'Diego Costa': 'targetMan', 'Zlatan Ibrahimović': 'targetMan', 'Romelu Lukaku': 'targetMan',
  'Edin Džeko': 'targetMan', 'Graziano Pellè': 'targetMan', 'Rickie Lambert': 'targetMan',
  'Michail Antonio': 'targetMan', 'Niclas Füllkrug': 'targetMan',
  'Emmanuel Adebayor': 'targetMan', 'Tim Cahill': 'targetMan', 'Leonardo Ulloa': 'targetMan',
  'Evan Ferguson': 'targetMan', 'Danny Welbeck': 'targetMan', 'Harry Kane': 'falseNine',
  'Roberto Firmino': 'falseNine', 'Wayne Rooney': 'falseNine', 'Kai Havertz': 'falseNine',
  'Carlos Tevez': 'falseNine', 'Dominic Solanke': 'falseNine', 'Shinji Okazaki': 'falseNine',
  'João Pedro': 'falseNine', 'Mohamed Salah': 'insideForward', 'Eden Hazard': 'insideForward',
  'Raheem Sterling': 'insideForward', 'Sadio Mané': 'insideForward',
  'Son Heung-min': 'insideForward', 'Bukayo Saka': 'insideForward',
  'Gabriel Martinelli': 'insideForward', 'Phil Foden': 'insideForward',
  'Riyad Mahrez': 'insideForward', 'Gareth Bale': 'insideForward',
  'Philippe Coutinho': 'insideForward', 'Alexis Sánchez': 'insideForward',
  'Marcus Rashford': 'insideForward', 'Cole Palmer': 'insideForward',
  'Noni Madueke': 'insideForward', 'Christian Pulisic': 'insideForward',
  'Luis Díaz': 'insideForward', 'Cody Gakpo': 'insideForward', 'Jarrod Bowen': 'insideForward',
  'Mohammed Kudus': 'insideForward', 'Michael Olise': 'insideForward',
  'Dejan Kulusevski': 'insideForward', 'Leandro Trossard': 'insideForward',
  'Anthony Martial': 'insideForward', 'Harvey Barnes': 'insideForward',
  'Kevin Mirallas': 'insideForward', 'Saïd Benrahma': 'insideForward',
  'Morgan Rogers': 'insideForward', 'Emiliano Buendía': 'insideForward',
  'Juan Mata': 'playmaker', 'Samir Nasri': 'insideForward', 'Leroy Sané': 'winger',
  'Theo Walcott': 'winger', 'Aaron Lennon': 'winger', 'Jadon Sancho': 'winger',
  'Alejandro Garnacho': 'winger', 'Amad Diallo': 'winger', 'Anthony Gordon': 'winger',
  'Allan Saint-Maximin': 'winger', 'Miguel Almirón': 'winger', 'Wilfried Zaha': 'winger',
  'Kaoru Mitoma': 'winger', 'Solly March': 'winger', 'Leon Bailey': 'winger',
  'Moussa Diaby': 'winger', 'Brennan Johnson': 'winger', 'Willian': 'winger', 'Nani': 'winger',
  'Ryan Giggs': 'winger', 'Ashley Young': 'winger', 'Marc Albrighton': 'winger',
  'Steven Pienaar': 'winger', 'Demarai Gray': 'winger', 'Nathan Redmond': 'winger',
  'Simon Adingra': 'winger', 'Jacob Murphy': 'winger', 'Ismaïla Sarr': 'winger',
  'Jack Grealish': 'winger', 'Dušan Tadić': 'winger', 'Andrew Robertson': 'overlapping',
  'Luke Shaw': 'overlapping', 'Leighton Baines': 'overlapping', 'Ashley Cole': 'overlapping',
  'Marcos Alonso': 'overlapping', 'Ben Chilwell': 'overlapping', 'Reece James': 'overlapping',
  'Danny Rose': 'overlapping', 'Kieran Trippier': 'overlapping',
  'Pervis Estupiñán': 'overlapping', 'Destiny Udogie': 'overlapping',
  'Pedro Porro': 'overlapping', 'Pablo Zabaleta': 'overlapping', 'Patrice Evra': 'overlapping',
  'Antonio Valencia': 'overlapping', 'Rafael': 'overlapping', 'Diogo Dalot': 'overlapping',
  'Séamus Coleman': 'overlapping', 'Nathaniel Clyne': 'overlapping',
  'Ryan Bertrand': 'overlapping', 'Ricardo Pereira': 'overlapping', 'Matty Cash': 'overlapping',
  'Lucas Digne': 'overlapping', 'Aaron Cresswell': 'overlapping',
  'Vladimír Coufal': 'overlapping', 'Daniel Muñoz': 'overlapping',
  'Tyrick Mitchell': 'overlapping', 'Tino Livramento': 'overlapping',
  'Tariq Lamptey': 'overlapping', 'Benoît Assou-Ekotto': 'overlapping',
  'Serge Aurier': 'overlapping', 'Sergio Reguilón': 'overlapping', 'Glen Johnson': 'overlapping',
  'Alberto Moreno': 'overlapping', 'José Enrique': 'overlapping',
  'Aleksandar Kolarov': 'overlapping', 'Gaël Clichy': 'overlapping',
  'Bacary Sagna': 'overlapping', 'Kieran Gibbs': 'overlapping', 'Héctor Bellerín': 'overlapping',
  'Kyle Walker': 'overlapping', 'Trent Alexander-Arnold': 'inverted', 'João Cancelo': 'inverted',
  'Oleksandr Zinchenko': 'inverted', 'Ben White': 'inverted', 'Jurriën Timber': 'inverted',
  'Marc Cucurella': 'inverted', 'Lewis Hall': 'inverted',
  'César Azpilicueta': 'defensiveFullBack', 'Branislav Ivanović': 'defensiveFullBack',
  'Takehiro Tomiyasu': 'defensiveFullBack', 'Aaron Wan-Bissaka': 'defensiveFullBack',
  'Nacho Monreal': 'defensiveFullBack', 'Christian Fuchs': 'defensiveFullBack',
  'Danny Simpson': 'defensiveFullBack', 'Joël Veltman': 'defensiveFullBack',
  'Ben Davies': 'defensiveFullBack', 'Tony Hibbert': 'defensiveFullBack',
  'Joel Ward': 'defensiveFullBack', 'Cédric Soares': 'defensiveFullBack',
  'Emerson Palmieri': 'defensiveFullBack', 'Virgil van Dijk': 'ballPlayer',
  'John Stones': 'ballPlayer', 'Aymeric Laporte': 'ballPlayer', 'David Luiz': 'ballPlayer',
  'Jan Vertonghen': 'ballPlayer', 'Toby Alderweireld': 'ballPlayer',
  'William Saliba': 'ballPlayer', 'Rio Ferdinand': 'ballPlayer', 'Thiago Silva': 'ballPlayer',
  'Lisandro Martínez': 'ballPlayer', 'Harry Maguire': 'ballPlayer', 'Lewis Dunk': 'ballPlayer',
  'Marc Guéhi': 'ballPlayer', 'Sven Botman': 'ballPlayer', 'Daniel Agger': 'ballPlayer',
  'Per Mertesacker': 'ballPlayer', 'Pau Torres': 'ballPlayer', 'Nathan Aké': 'ballPlayer',
  'Joško Gvardiol': 'ballPlayer', 'Rúben Dias': 'ballPlayer', 'Joël Matip': 'ballPlayer',
  'Micky van de Ven': 'ballPlayer', 'Levi Colwill': 'ballPlayer',
  'Jan Paul van Hecke': 'ballPlayer', 'Fabian Schär': 'ballPlayer',
  'Joachim Andersen': 'ballPlayer', 'Manuel Akanji': 'ballPlayer',
  'Vincent Kompany': 'ballPlayer', 'John Terry': 'stopper', 'Nemanja Vidić': 'stopper',
  'Gabriel Magalhães': 'stopper', 'Antonio Rüdiger': 'stopper', 'Cristian Romero': 'stopper',
  'Raphaël Varane': 'stopper', 'Ibrahima Konaté': 'stopper', 'Martin Škrtel': 'stopper',
  'Robert Huth': 'stopper', 'Wes Morgan': 'stopper', 'Jamie Carragher': 'stopper',
  'Laurent Koscielny': 'stopper', 'Gary Cahill': 'stopper', 'Phil Jagielka': 'stopper',
  'Tyrone Mings': 'stopper', 'Kurt Zouma': 'stopper', 'Nicolás Otamendi': 'stopper',
  'Chris Smalling': 'stopper', 'Younès Kaboul': 'stopper', 'Ledley King': 'stopper',
  'Dan Burn': 'stopper', 'Craig Dawson': 'stopper', 'Çağlar Söyüncü': 'stopper',
  'José Fonte': 'stopper', 'Ezri Konsa': 'stopper', 'Diego Carlos': 'stopper',
  'Wesley Fofana': 'stopper', 'Thomas Vermaelen': 'stopper', 'Jorginho': 'deepPlaymaker',
  'Michael Carrick': 'deepPlaymaker', 'Mikel Arteta': 'deepPlaymaker', 'Rodri': 'deepPlaymaker',
  'Adam Wharton': 'deepPlaymaker', 'Bruno Guimarães': 'deepPlaymaker',
  'Luka Milivojević': 'deepPlaymaker', 'Fabinho': 'deepPlaymaker',
  'Declan Rice': 'deepPlaymaker', 'Thomas Partey': 'deepPlaymaker',
  'Yves Bissouma': 'deepPlaymaker', 'Boubacar Kamara': 'deepPlaymaker', 'Fernandinho': 'anchor',
  'Nemanja Matić': 'anchor', 'Casemiro': 'anchor', 'Lucas Leiva': 'anchor',
  'Scott Parker': 'anchor', 'Eric Dier': 'anchor', 'Morgan Schneiderlin': 'anchor',
  'Victor Wanyama': 'anchor', 'Wilfred Ndidi': 'anchor', 'Tomáš Souček': 'anchor',
  'Edson Álvarez': 'anchor', 'Cheick Doucouré': 'anchor', 'Carlos Baleba': 'anchor',
  'Rodrigo Bentancur': 'anchor', 'Pierre-Emile Højbjerg': 'anchor', 'Amadou Onana': 'anchor',
  'Ryan Gravenberch': 'anchor', 'Oriol Romeu': 'anchor', 'Gareth Barry': 'anchor',
  'Francis Coquelin': 'anchor', 'N’Golo Kanté': 'ballWinner', 'Idrissa Gueye': 'ballWinner',
  'Moisés Caicedo': 'ballWinner', 'Jefferson Lerma': 'ballWinner', 'Ander Herrera': 'ballWinner',
  'Emre Can': 'ballWinner', 'Kevin De Bruyne': 'playmaker', 'David Silva': 'playmaker',
  'Mesut Özil': 'playmaker', 'Santi Cazorla': 'playmaker', 'Martin Ødegaard': 'playmaker',
  'Bruno Fernandes': 'playmaker', 'Christian Eriksen': 'playmaker', 'Cesc Fàbregas': 'playmaker',
  'Luka Modrić': 'playmaker', 'James Maddison': 'playmaker', 'Lucas Paquetá': 'playmaker',
  'Thiago Alcântara': 'playmaker', 'Mateo Kovačić': 'playmaker', 'Bernardo Silva': 'playmaker',
  'Enzo Fernández': 'playmaker', 'Youri Tielemans': 'playmaker', 'Pascal Groß': 'playmaker',
  'Eberechi Eze': 'playmaker', 'James Ward-Prowse': 'playmaker', 'Adam Lallana': 'playmaker',
  'Paul Scholes': 'playmaker', 'Rafael van der Vaart': 'playmaker', 'Mousa Dembélé': 'playmaker',
  'Danny Drinkwater': 'playmaker', 'Alexis Mac Allister': 'playmaker',
  'Mason Mount': 'playmaker', 'Gylfi Sigurðsson': 'playmaker', 'İlkay Gündoğan': 'playmaker',
  'Mikel Merino': 'playmaker', 'Granit Xhaka': 'playmaker', 'Frank Lampard': 'boxToBox',
  'Steven Gerrard': 'boxToBox', 'Jordan Henderson': 'boxToBox', 'Aaron Ramsey': 'boxToBox',
  'Yaya Touré': 'boxToBox', 'Paul Pogba': 'boxToBox', 'Dele Alli': 'boxToBox',
  'Ross Barkley': 'boxToBox', 'Marouane Fellaini': 'boxToBox', 'Scott McTominay': 'boxToBox',
  'John McGinn': 'boxToBox', 'Joelinton': 'boxToBox', 'Dominik Szoboszlai': 'boxToBox',
  'James Milner': 'boxToBox', 'Ramires': 'boxToBox', 'Jack Wilshere': 'boxToBox',
  'Sandro Tonali': 'boxToBox', 'Douglas Luiz': 'boxToBox', 'Jacob Ramsey': 'boxToBox',
  'Kobbie Mainoo': 'boxToBox', 'Pape Matar Sarr': 'boxToBox', 'Leon Osman': 'boxToBox',
  'James McCarthy': 'boxToBox', 'Sean Longstaff': 'boxToBox', 'Billy Gilmour': 'boxToBox',
  'Pablo Fornals': 'boxToBox', 'Andy King': 'boxToBox', 'Steven Davis': 'boxToBox',
  'Alisson Becker': 'sweeperKeeper', 'Ederson': 'sweeperKeeper', 'Hugo Lloris': 'sweeperKeeper',
  'David Raya': 'sweeperKeeper', 'Bart Verbruggen': 'sweeperKeeper',
  'Robert Sánchez': 'sweeperKeeper', 'Guglielmo Vicario': 'sweeperKeeper',
  'André Onana': 'sweeperKeeper', 'Stefan Ortega': 'sweeperKeeper',
  'Bernd Leno': 'sweeperKeeper', 'Claudio Bravo': 'sweeperKeeper',
  'Aaron Ramsdale': 'sweeperKeeper', 'Jordan Pickford': 'sweeperKeeper',
  // Added with the single-season squads.
  'David de Gea': 'shotStopper', 'Petr Čech': 'shotStopper', 'Thibaut Courtois': 'shotStopper',
  'Joe Hart': 'shotStopper', 'Edwin van der Sar': 'sweeperKeeper', 'Emiliano Martínez': 'shotStopper',
  'Nick Pope': 'shotStopper', 'Kasper Schmeichel': 'shotStopper', 'Édouard Mendy': 'shotStopper',
  'Dimitar Berbatov': 'falseNine', 'Mario Balotelli': 'poacher', 'Demba Ba': 'poacher',
  'Papiss Cissé': 'poacher', 'Wilfried Bony': 'targetMan', 'Andy Carroll': 'targetMan',
  'Raúl Jiménez': 'targetMan', 'Patrick Bamford': 'poacher', 'Chris Wood': 'targetMan',
  'Ashley Barnes': 'targetMan', 'Oliver McBurnie': 'targetMan', 'David McGoldrick': 'falseNine',
  'Jermain Defoe': 'poacher', 'Michael Owen': 'poacher', 'Loïc Rémy': 'poacher',
  'Tammy Abraham': 'poacher', 'Álvaro Negredo': 'targetMan', 'Stevan Jovetić': 'falseNine',
  'Dominic Calvert-Lewin': 'targetMan', 'Clint Dempsey': 'falseNine', 'Rodrigo': 'falseNine',
  'Shinji Kagawa': 'playmaker', 'Oscar': 'playmaker', 'Yohan Cabaye': 'playmaker',
  'Georginio Wijnaldum': 'boxToBox', 'Naby Keïta': 'boxToBox', 'Fred': 'ballWinner',
  'Michael Essien': 'boxToBox', 'João Moutinho': 'playmaker', 'Rúben Neves': 'playmaker',
  'Kalvin Phillips': 'deepPlaymaker', 'James Rodríguez': 'playmaker', 'Allan': 'ballWinner',
  'Mark Noble': 'playmaker', 'Cheick Tioté': 'ballWinner', 'Sofyan Amrabat': 'ballWinner',
  'Adama Traoré': 'winger', 'Pedro Neto': 'winger', 'Hatem Ben Arfa': 'insideForward',
  'Jesús Navas': 'winger', 'Dimitri Payet': 'winger', 'Raphinha': 'insideForward',
  'Jack Harrison': 'winger', 'Erik Lamela': 'insideForward', 'Hakim Ziyech': 'insideForward',
  'Juan Cuadrado': 'winger', 'André Schürrle': 'insideForward', 'Pedro': 'insideForward',
  'Florent Malouda': 'winger', 'Lukas Podolski': 'insideForward', 'Antony': 'insideForward',
  'Ivan Perišić': 'overlapping', 'Matt Doherty': 'overlapping', 'Jonny': 'overlapping',
  'Filipe Luís': 'overlapping', 'Kieran Tierney': 'overlapping', 'Ola Aina': 'overlapping',
  'Timothy Castagne': 'overlapping', 'Victor Moses': 'winger',
}
export const ARCHETYPE: Record<string, Archetype> = Object.assign({}, ...LEAGUES.map((l) => l.ARCHETYPE), PL_ARCHETYPE)

/**
 * Personalities people know (hidden traits): players otherwise get their archetype's typical
 * traits with a little variety (`draftTraits`). Flair: tricks, take-ons, curled shots. Hot heads:
 * fouls, cards, the cynical pull-back. Tireless: pressing and getting up and down all game.
 */
export const FLAIR = new Set([
  'Eden Hazard', 'Luis Suárez', 'Alexis Sánchez', 'Philippe Coutinho', 'Riyad Mahrez', 'Mesut Özil', 'David Silva',
  'Jack Grealish', 'Hatem Ben Arfa', 'Santi Cazorla', 'Samir Nasri', 'Erik Lamela', 'Zlatan Ibrahimović', 'Paul Pogba',
  'Roberto Firmino', 'Sergio Agüero', 'Mohamed Salah', 'Son Heung-min', 'Cesc Fàbregas', 'Bruno Fernandes', 'Martin Ødegaard',
  'Manuel Lanzini', 'Dele Alli', 'Raheem Sterling',
])
export const HOT_HEADS = new Set([
  'Diego Costa', 'Luis Suárez', 'Mario Balotelli', 'Granit Xhaka', 'Wayne Rooney', 'Jamie Vardy', 'Fernandinho', 'Casemiro',
  'Cristian Romero', 'Lisandro Martínez', 'Antonio Rüdiger', 'David Luiz', 'Dele Alli', 'Zlatan Ibrahimović', 'Carlos Tevez',
  'Emiliano Martínez', 'Bruno Fernandes',
])
export const TIRELESS = new Set([
  'N’Golo Kanté', 'James Milner', 'Park Ji-sung', 'Jordan Henderson', 'Jamie Vardy', 'Roberto Firmino', 'Sadio Mané',
  'Carlos Tevez', 'Dirk Kuyt', 'Bukayo Saka', 'Son Heung-min', 'Jarrod Bowen', 'Wayne Rooney', 'Steven Gerrard', 'Erling Haaland',
])

